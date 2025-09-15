-- Create useful views and additional functions for the SPLIT game

-- View: Enhanced user stats with profile information
CREATE OR REPLACE VIEW user_stats_with_profile AS
SELECT 
  us.*,
  p.handle,
  p.avatar_url,
  p.bio,
  p.created_at as profile_created_at,
  -- Calculate derived stats
  (us.splits + us.steals) as total_games,
  CASE 
    WHEN us.current_streak >= 20 THEN 'legend'
    WHEN us.current_streak >= 10 THEN 'elite'
    WHEN us.current_streak >= 5 THEN 'trusted'
    ELSE 'newcomer'
  END as level
FROM user_stats us
JOIN profiles p ON us.wallet = p.wallet;

-- View: Squad statistics with member information
CREATE OR REPLACE VIEW squad_stats AS
SELECT 
  s.*,
  COUNT(sm.wallet) as member_count,
  COALESCE(AVG(us.current_streak), 0) as avg_streak,
  COALESCE(AVG(us.winrate), 0) as avg_winrate,
  COALESCE(SUM(us.total_payout), 0) as total_squad_payout,
  -- Squad sync rate for current day
  COALESCE(
    (SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(CASE WHEN dc.committed THEN 1 END) * 100.0 / COUNT(*))
      END
    FROM squad_members sm2
    LEFT JOIN daily_choices dc ON sm2.wallet = dc.wallet 
      AND dc.day_unix = EXTRACT(EPOCH FROM DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC'))::INTEGER
    WHERE sm2.squad_id = s.id), 0
  ) as current_sync_rate
FROM squads s
LEFT JOIN squad_members sm ON s.id = sm.squad_id
LEFT JOIN user_stats us ON sm.wallet = us.wallet
GROUP BY s.id;

-- View: Daily game summary
CREATE OR REPLACE VIEW daily_game_summary AS
SELECT 
  day_unix,
  COUNT(*) as total_players,
  COUNT(CASE WHEN committed THEN 1 END) as committed_players,
  COUNT(CASE WHEN revealed THEN 1 END) as revealed_players,
  COUNT(CASE WHEN choice = 0 THEN 1 END) as split_count,
  COUNT(CASE WHEN choice = 1 THEN 1 END) as steal_count,
  ROUND(
    COUNT(CASE WHEN choice = 0 THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN revealed THEN 1 END), 0), 2
  ) as split_percentage
FROM daily_choices
GROUP BY day_unix
ORDER BY day_unix DESC;

-- View: Leaderboard data with ranking
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY current_streak DESC, best_streak DESC, winrate DESC) as rank,
  wallet,
  handle,
  avatar_url,
  current_streak as streak,
  best_streak,
  winrate,
  rounds_joined as weight,
  total_payout as pnl24h, -- Placeholder - in real implementation this would be calculated
  level,
  -- Squad information
  (SELECT s.name FROM squads s JOIN squad_members sm ON s.id = sm.squad_id WHERE sm.wallet = usp.wallet LIMIT 1) as squad_name,
  -- Squad sync rate (placeholder)
  COALESCE(
    (SELECT current_sync_rate FROM squad_stats ss JOIN squad_members sm ON ss.id = sm.squad_id WHERE sm.wallet = usp.wallet LIMIT 1), 
    0
  ) as squad_sync,
  CASE 
    WHEN handle IS NOT NULL THEN true 
    ELSE false 
  END as verified
FROM user_stats_with_profile usp
ORDER BY current_streak DESC, best_streak DESC, winrate DESC;

-- Function: Get squad sync statistics for a specific day
CREATE OR REPLACE FUNCTION get_squad_sync_stats(
  p_squad_id UUID,
  p_day_unix INTEGER DEFAULT NULL
)
RETURNS TABLE(
  total_members INTEGER,
  committed_members INTEGER,
  revealed_members INTEGER,
  sync_percentage DECIMAL(5,2)
) AS $$
DECLARE
  target_day INTEGER;
BEGIN
  -- Use current day if not specified
  IF p_day_unix IS NULL THEN
    target_day := EXTRACT(EPOCH FROM DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC'))::INTEGER;
  ELSE
    target_day := p_day_unix;
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(sm.wallet)::INTEGER as total_members,
    COUNT(CASE WHEN dc.committed THEN 1 END)::INTEGER as committed_members,
    COUNT(CASE WHEN dc.revealed THEN 1 END)::INTEGER as revealed_members,
    CASE 
      WHEN COUNT(sm.wallet) = 0 THEN 0::DECIMAL(5,2)
      ELSE ROUND((COUNT(CASE WHEN dc.committed THEN 1 END) * 100.0 / COUNT(sm.wallet)), 2)
    END as sync_percentage
  FROM squad_members sm
  LEFT JOIN daily_choices dc ON sm.wallet = dc.wallet AND dc.day_unix = target_day
  WHERE sm.squad_id = p_squad_id;
END;
$$ language 'plpgsql';

-- Function: Update user stats after a game round
CREATE OR REPLACE FUNCTION update_user_stats_after_round(
  p_wallet TEXT,
  p_choice INTEGER, -- 0 = split, 1 = steal
  p_won BOOLEAN,
  p_payout DECIMAL(15,2) DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
  current_stats user_stats%ROWTYPE;
  new_streak INTEGER;
BEGIN
  -- Get current stats
  SELECT * INTO current_stats FROM user_stats WHERE wallet = p_wallet;
  
  -- If no stats exist, create initial record
  IF NOT FOUND THEN
    INSERT INTO user_stats (wallet, splits, steals, rounds_joined, total_payout)
    VALUES (p_wallet, 0, 0, 0, 0);
    SELECT * INTO current_stats FROM user_stats WHERE wallet = p_wallet;
  END IF;
  
  -- Calculate new streak
  IF p_choice = 0 AND p_won THEN -- Split and won
    new_streak := current_stats.current_streak + 1;
  ELSE
    new_streak := 0;
    -- Increment broken streaks if we had a streak
    IF current_stats.current_streak > 0 THEN
      UPDATE user_stats 
      SET broken_streaks = broken_streaks + 1 
      WHERE wallet = p_wallet;
    END IF;
  END IF;
  
  -- Update stats
  UPDATE user_stats SET
    splits = CASE WHEN p_choice = 0 THEN splits + 1 ELSE splits END,
    steals = CASE WHEN p_choice = 1 THEN steals + 1 ELSE steals END,
    current_streak = new_streak,
    best_streak = GREATEST(best_streak, new_streak),
    rounds_joined = rounds_joined + 1,
    total_payout = total_payout + p_payout,
    updated_at = NOW()
  WHERE wallet = p_wallet;
END;
$$ language 'plpgsql';

-- Function: Get user's squad information
CREATE OR REPLACE FUNCTION get_user_squad(p_wallet TEXT)
RETURNS TABLE(
  squad_id UUID,
  squad_name TEXT,
  squad_slug TEXT,
  member_role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  member_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.slug,
    sm.role,
    sm.joined_at,
    (SELECT COUNT(*)::INTEGER FROM squad_members WHERE squad_id = s.id)
  FROM squads s
  JOIN squad_members sm ON s.id = sm.squad_id
  WHERE sm.wallet = p_wallet;
END;
$$ language 'plpgsql';

-- Function: Check if user can join squad
CREATE OR REPLACE FUNCTION can_join_squad(p_wallet TEXT, p_squad_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  squad_info RECORD;
  current_members INTEGER;
  is_already_member BOOLEAN;
BEGIN
  -- Get squad information
  SELECT * INTO squad_info FROM squads WHERE id = p_squad_id;
  
  IF NOT FOUND THEN
    RETURN FALSE; -- Squad doesn't exist
  END IF;
  
  -- Check if user is already a member
  SELECT EXISTS(SELECT 1 FROM squad_members WHERE squad_id = p_squad_id AND wallet = p_wallet)
  INTO is_already_member;
  
  IF is_already_member THEN
    RETURN FALSE; -- Already a member
  END IF;
  
  -- Check if squad is public
  IF NOT squad_info.is_public THEN
    RETURN FALSE; -- Private squad
  END IF;
  
  -- Check member count
  SELECT COUNT(*) INTO current_members FROM squad_members WHERE squad_id = p_squad_id;
  
  IF current_members >= squad_info.max_members THEN
    RETURN FALSE; -- Squad is full
  END IF;
  
  RETURN TRUE;
END;
$$ language 'plpgsql';

-- Create RPC functions for the API
-- These functions can be called directly from the client with proper RLS

-- RPC: Get community pot total (public function)
CREATE OR REPLACE FUNCTION rpc_get_community_pot_total()
RETURNS DECIMAL(15,2) AS $$
BEGIN
  RETURN get_community_pot_total();
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- RPC: Get leaderboard
CREATE OR REPLACE FUNCTION rpc_get_leaderboard(
  p_mode TEXT DEFAULT 'streak',
  p_limit INTEGER DEFAULT 100
)
RETURNS SETOF leaderboard_view AS $$
BEGIN
  CASE p_mode
    WHEN 'streak' THEN
      RETURN QUERY SELECT * FROM leaderboard_view ORDER BY streak DESC LIMIT p_limit;
    WHEN 'winrate' THEN
      RETURN QUERY SELECT * FROM leaderboard_view ORDER BY winrate DESC LIMIT p_limit;
    WHEN 'weight' THEN
      RETURN QUERY SELECT * FROM leaderboard_view ORDER BY weight DESC LIMIT p_limit;
    ELSE
      RETURN QUERY SELECT * FROM leaderboard_view ORDER BY streak DESC LIMIT p_limit;
  END CASE;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON user_stats_with_profile TO anon, authenticated;
GRANT SELECT ON squad_stats TO anon, authenticated;
GRANT SELECT ON daily_game_summary TO anon, authenticated;
GRANT SELECT ON leaderboard_view TO anon, authenticated;

GRANT EXECUTE ON FUNCTION rpc_get_community_pot_total() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION rpc_get_leaderboard(TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_squad_sync_stats(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_squad(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION can_join_squad(TEXT, UUID) TO anon, authenticated;

-- Add comments for documentation
COMMENT ON VIEW user_stats_with_profile IS 'User statistics combined with profile information and derived level';
COMMENT ON VIEW squad_stats IS 'Squad statistics including member count and performance metrics';
COMMENT ON VIEW daily_game_summary IS 'Daily game statistics including player counts and choice distribution';
COMMENT ON VIEW leaderboard_view IS 'Ranked leaderboard with user information and squad details';

COMMENT ON FUNCTION get_squad_sync_stats(UUID, INTEGER) IS 'Get squad synchronization statistics for a specific day';
COMMENT ON FUNCTION update_user_stats_after_round(TEXT, INTEGER, BOOLEAN, DECIMAL) IS 'Update user statistics after completing a game round';
COMMENT ON FUNCTION get_user_squad(TEXT) IS 'Get squad information for a specific user';
COMMENT ON FUNCTION can_join_squad(TEXT, UUID) IS 'Check if a user can join a specific squad';
COMMENT ON FUNCTION rpc_get_community_pot_total() IS 'RPC function to get current community pot total';
COMMENT ON FUNCTION rpc_get_leaderboard(TEXT, INTEGER) IS 'RPC function to get leaderboard data with different sorting modes';
