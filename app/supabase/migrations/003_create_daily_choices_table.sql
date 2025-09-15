-- Create daily_choices table
CREATE TABLE IF NOT EXISTS daily_choices (
  wallet TEXT NOT NULL REFERENCES profiles(wallet) ON DELETE CASCADE,
  day_unix INTEGER NOT NULL,
  committed BOOLEAN DEFAULT FALSE NOT NULL,
  revealed BOOLEAN DEFAULT FALSE NOT NULL,
  choice INTEGER CHECK (choice IN (0, 1)), -- 0 = split, 1 = steal
  commit_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (wallet, day_unix)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_choices_day_unix ON daily_choices(day_unix);
CREATE INDEX IF NOT EXISTS idx_daily_choices_committed ON daily_choices(committed);
CREATE INDEX IF NOT EXISTS idx_daily_choices_revealed ON daily_choices(revealed);
CREATE INDEX IF NOT EXISTS idx_daily_choices_choice ON daily_choices(choice);
CREATE INDEX IF NOT EXISTS idx_daily_choices_created_at ON daily_choices(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_daily_choices_updated_at 
  BEFORE UPDATE ON daily_choices 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE daily_choices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_choices table
-- Users can read their own choices
CREATE POLICY "Users can read their own daily choices" ON daily_choices
  FOR SELECT USING (wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can read choices for squad members (for squad sync functionality)
CREATE POLICY "Users can read squad member choices" ON daily_choices
  FOR SELECT USING (
    wallet IN (
      SELECT sm.wallet 
      FROM squad_members sm1
      JOIN squad_members sm2 ON sm1.squad_id = sm2.squad_id
      WHERE sm2.wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- System can read all choices (for game mechanics)
CREATE POLICY "System can read all daily choices" ON daily_choices
  FOR SELECT USING (current_setting('request.jwt.claims', true)::json->>'role' = 'system');

-- Users can insert their own choices
CREATE POLICY "Users can create their own daily choices" ON daily_choices
  FOR INSERT WITH CHECK (wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can update their own choices (for commit/reveal process)
CREATE POLICY "Users can update their own daily choices" ON daily_choices
  FOR UPDATE USING (wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- System can update any choices (for game mechanics)
CREATE POLICY "System can update daily choices" ON daily_choices
  FOR UPDATE USING (current_setting('request.jwt.claims', true)::json->>'role' = 'system');

-- Users cannot delete choices (maintain game integrity)
CREATE POLICY "Daily choices cannot be deleted" ON daily_choices
  FOR DELETE USING (false);

-- Create function to get current day unix timestamp
CREATE OR REPLACE FUNCTION get_current_day_unix()
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(EPOCH FROM DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC'))::INTEGER;
END;
$$ language 'plpgsql';

-- Create function to validate choice timing (commit phase vs reveal phase)
CREATE OR REPLACE FUNCTION validate_choice_timing()
RETURNS TRIGGER AS $$
DECLARE
  current_hour INTEGER;
BEGIN
  -- Get current UTC hour
  current_hour := EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC');
  
  -- Commit phase: 00:00 - 11:59 UTC
  -- Reveal phase: 12:00 - 23:59 UTC
  
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.committed = FALSE AND NEW.committed = TRUE) THEN
    -- Committing - only allowed during commit phase (first 12 hours)
    IF current_hour >= 12 THEN
      RAISE EXCEPTION 'Commits are only allowed during the first 12 hours of the day (00:00-11:59 UTC)';
    END IF;
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.revealed = FALSE AND NEW.revealed = TRUE THEN
    -- Revealing - only allowed during reveal phase (last 12 hours)
    IF current_hour < 12 THEN
      RAISE EXCEPTION 'Reveals are only allowed during the last 12 hours of the day (12:00-23:59 UTC)';
    END IF;
    
    -- Must have committed before revealing
    IF NOT NEW.committed THEN
      RAISE EXCEPTION 'Cannot reveal without first committing';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timing validation trigger
CREATE TRIGGER validate_daily_choice_timing
  BEFORE INSERT OR UPDATE ON daily_choices
  FOR EACH ROW
  EXECUTE FUNCTION validate_choice_timing();

-- Add comments for documentation
COMMENT ON TABLE daily_choices IS 'Daily choice commitments and reveals for the commit-reveal game mechanism';
COMMENT ON COLUMN daily_choices.wallet IS 'Reference to user wallet address';
COMMENT ON COLUMN daily_choices.day_unix IS 'Unix timestamp of the day (start of day in UTC)';
COMMENT ON COLUMN daily_choices.committed IS 'Whether the user has committed their choice for this day';
COMMENT ON COLUMN daily_choices.revealed IS 'Whether the user has revealed their choice for this day';
COMMENT ON COLUMN daily_choices.choice IS 'The revealed choice: 0 = split, 1 = steal';
COMMENT ON COLUMN daily_choices.commit_hash IS 'Hash of the committed choice (for verification)';
