-- Create community_pot_events table
CREATE TABLE IF NOT EXISTS community_pot_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(15,2) NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('contribution', 'claim', 'rollover', 'bonus')),
  wallet TEXT REFERENCES profiles(wallet) ON DELETE SET NULL,
  day_unix INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_pot_events_event_type ON community_pot_events(event_type);
CREATE INDEX IF NOT EXISTS idx_community_pot_events_wallet ON community_pot_events(wallet);
CREATE INDEX IF NOT EXISTS idx_community_pot_events_day_unix ON community_pot_events(day_unix);
CREATE INDEX IF NOT EXISTS idx_community_pot_events_created_at ON community_pot_events(created_at);
CREATE INDEX IF NOT EXISTS idx_community_pot_events_metadata ON community_pot_events USING GIN(metadata);

-- Enable Row Level Security
ALTER TABLE community_pot_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_pot_events table
-- All pot events are publicly readable (for transparency)
CREATE POLICY "Community pot events are publicly readable" ON community_pot_events
  FOR SELECT USING (true);

-- Only system can insert pot events (game mechanics)
CREATE POLICY "System can create pot events" ON community_pot_events
  FOR INSERT WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'system');

-- Users cannot update or delete pot events (immutable record)
CREATE POLICY "Community pot events are immutable" ON community_pot_events
  FOR UPDATE USING (false);

CREATE POLICY "Community pot events cannot be deleted" ON community_pot_events
  FOR DELETE USING (false);

-- Function to get community pot total
CREATE OR REPLACE FUNCTION get_community_pot_total()
RETURNS DECIMAL(15,2) AS $$
DECLARE
  total DECIMAL(15,2) := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN event_type IN ('contribution', 'bonus') THEN amount
      WHEN event_type IN ('claim', 'rollover') THEN -amount
      ELSE 0
    END
  ), 0)
  INTO total
  FROM community_pot_events;
  
  RETURN GREATEST(total, 0); -- Ensure non-negative
END;
$$ language 'plpgsql';

-- Function to get community pot total for a specific day
CREATE OR REPLACE FUNCTION get_community_pot_total_for_day(target_day_unix INTEGER)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  total DECIMAL(15,2) := 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN event_type IN ('contribution', 'bonus') THEN amount
      WHEN event_type IN ('claim', 'rollover') THEN -amount
      ELSE 0
    END
  ), 0)
  INTO total
  FROM community_pot_events
  WHERE day_unix <= target_day_unix;
  
  RETURN GREATEST(total, 0); -- Ensure non-negative
END;
$$ language 'plpgsql';

-- Function to get daily pot statistics
CREATE OR REPLACE FUNCTION get_daily_pot_stats(target_day_unix INTEGER DEFAULT NULL)
RETURNS TABLE(
  day_unix INTEGER,
  contributions DECIMAL(15,2),
  claims DECIMAL(15,2),
  net_change DECIMAL(15,2),
  event_count INTEGER
) AS $$
BEGIN
  IF target_day_unix IS NULL THEN
    target_day_unix := EXTRACT(EPOCH FROM DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC'))::INTEGER;
  END IF;
  
  RETURN QUERY
  SELECT 
    cpe.day_unix,
    COALESCE(SUM(CASE WHEN cpe.event_type IN ('contribution', 'bonus') THEN cpe.amount ELSE 0 END), 0) as contributions,
    COALESCE(SUM(CASE WHEN cpe.event_type IN ('claim', 'rollover') THEN cpe.amount ELSE 0 END), 0) as claims,
    COALESCE(SUM(CASE 
      WHEN cpe.event_type IN ('contribution', 'bonus') THEN cpe.amount
      WHEN cpe.event_type IN ('claim', 'rollover') THEN -cpe.amount
      ELSE 0
    END), 0) as net_change,
    COUNT(*)::INTEGER as event_count
  FROM community_pot_events cpe
  WHERE cpe.day_unix = target_day_unix
  GROUP BY cpe.day_unix;
END;
$$ language 'plpgsql';

-- Function to add pot event with validation
CREATE OR REPLACE FUNCTION add_pot_event(
  p_amount DECIMAL(15,2),
  p_event_type TEXT,
  p_wallet TEXT DEFAULT NULL,
  p_day_unix INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
  current_total DECIMAL(15,2);
BEGIN
  -- Set default day_unix if not provided
  IF p_day_unix IS NULL THEN
    p_day_unix := EXTRACT(EPOCH FROM DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC'))::INTEGER;
  END IF;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- For claim events, ensure sufficient pot balance
  IF p_event_type IN ('claim', 'rollover') THEN
    current_total := get_community_pot_total();
    IF current_total < p_amount THEN
      RAISE EXCEPTION 'Insufficient pot balance. Current: %, Requested: %', current_total, p_amount;
    END IF;
  END IF;
  
  -- Insert the event
  INSERT INTO community_pot_events (amount, event_type, wallet, day_unix, metadata)
  VALUES (p_amount, p_event_type, p_wallet, p_day_unix, p_metadata)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE community_pot_events IS 'Events affecting the community pot balance (contributions, claims, rollovers)';
COMMENT ON COLUMN community_pot_events.amount IS 'Amount of the transaction (always positive, direction determined by event_type)';
COMMENT ON COLUMN community_pot_events.event_type IS 'Type of event: contribution (add), claim (remove), rollover (remove), bonus (add)';
COMMENT ON COLUMN community_pot_events.wallet IS 'Wallet address associated with the event (optional for system events)';
COMMENT ON COLUMN community_pot_events.day_unix IS 'Unix timestamp of the day when the event occurred';
COMMENT ON COLUMN community_pot_events.metadata IS 'Additional event metadata (JSON format)';

COMMENT ON FUNCTION get_community_pot_total() IS 'Returns the current total community pot balance';
COMMENT ON FUNCTION get_community_pot_total_for_day(INTEGER) IS 'Returns the community pot balance as of a specific day';
COMMENT ON FUNCTION get_daily_pot_stats(INTEGER) IS 'Returns daily statistics for pot events';
COMMENT ON FUNCTION add_pot_event(DECIMAL, TEXT, TEXT, INTEGER, JSONB) IS 'Safely adds a new pot event with validation';
