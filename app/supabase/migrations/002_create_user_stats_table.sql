-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  wallet TEXT PRIMARY KEY REFERENCES profiles(wallet) ON DELETE CASCADE,
  splits INTEGER DEFAULT 0 NOT NULL,
  steals INTEGER DEFAULT 0 NOT NULL,
  broken_streaks INTEGER DEFAULT 0 NOT NULL,
  best_streak INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  winrate DECIMAL(5,2) DEFAULT 0.00 NOT NULL CHECK (winrate >= 0 AND winrate <= 100),
  rounds_joined INTEGER DEFAULT 0 NOT NULL,
  total_payout DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_stats_current_streak ON user_stats(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_best_streak ON user_stats(best_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_winrate ON user_stats(winrate DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_rounds_joined ON user_stats(rounds_joined DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_payout ON user_stats(total_payout DESC);

-- Create updated_at trigger
CREATE TRIGGER update_user_stats_updated_at 
  BEFORE UPDATE ON user_stats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats table
-- Users can read all stats (for leaderboards, etc.)
CREATE POLICY "User stats are publicly readable" ON user_stats
  FOR SELECT USING (true);

-- Users can insert their own stats
CREATE POLICY "Users can create their own stats" ON user_stats
  FOR INSERT WITH CHECK (wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can update their own stats
CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- System/admin can update any stats (for game mechanics)
CREATE POLICY "System can update user stats" ON user_stats
  FOR UPDATE USING (current_setting('request.jwt.claims', true)::json->>'role' = 'system');

-- Users cannot delete stats
CREATE POLICY "User stats cannot be deleted" ON user_stats
  FOR DELETE USING (false);

-- Create function to calculate winrate automatically
CREATE OR REPLACE FUNCTION calculate_winrate()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.splits + NEW.steals) > 0 THEN
    NEW.winrate = ROUND((NEW.splits::DECIMAL / (NEW.splits + NEW.steals)) * 100, 2);
  ELSE
    NEW.winrate = 0;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically calculate winrate on insert/update
CREATE TRIGGER calculate_user_stats_winrate
  BEFORE INSERT OR UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION calculate_winrate();

-- Add comments for documentation
COMMENT ON TABLE user_stats IS 'User game statistics and performance metrics';
COMMENT ON COLUMN user_stats.wallet IS 'Reference to user wallet address';
COMMENT ON COLUMN user_stats.splits IS 'Total number of split choices made';
COMMENT ON COLUMN user_stats.steals IS 'Total number of steal choices made';
COMMENT ON COLUMN user_stats.broken_streaks IS 'Number of times streak was broken';
COMMENT ON COLUMN user_stats.best_streak IS 'Highest consecutive streak achieved';
COMMENT ON COLUMN user_stats.current_streak IS 'Current consecutive streak';
COMMENT ON COLUMN user_stats.winrate IS 'Win rate percentage (calculated automatically)';
COMMENT ON COLUMN user_stats.rounds_joined IS 'Total number of game rounds participated in';
COMMENT ON COLUMN user_stats.total_payout IS 'Total payout earned from the game';
