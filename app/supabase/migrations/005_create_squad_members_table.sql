-- Create squad_members table
CREATE TABLE IF NOT EXISTS squad_members (
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL REFERENCES profiles(wallet) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('member', 'moderator', 'leader', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (squad_id, wallet)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_squad_members_squad_id ON squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_wallet ON squad_members(wallet);
CREATE INDEX IF NOT EXISTS idx_squad_members_role ON squad_members(role);
CREATE INDEX IF NOT EXISTS idx_squad_members_joined_at ON squad_members(joined_at);

-- Enable Row Level Security
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for squad_members table
-- Squad members can read their squad's member list
CREATE POLICY "Squad members can read their squad member list" ON squad_members
  FOR SELECT USING (
    squad_id IN (
      SELECT squad_id 
      FROM squad_members 
      WHERE wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Anyone can read member lists of public squads
CREATE POLICY "Public squad members are readable" ON squad_members
  FOR SELECT USING (
    squad_id IN (
      SELECT id 
      FROM squads 
      WHERE is_public = TRUE
    )
  );

-- Users can join squads (insert their own membership)
CREATE POLICY "Users can join squads" ON squad_members
  FOR INSERT WITH CHECK (
    wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    AND squad_id IN (
      SELECT id 
      FROM squads 
      WHERE is_public = TRUE
    )
  );

-- Squad leaders/admins can add members
CREATE POLICY "Squad leaders can add members" ON squad_members
  FOR INSERT WITH CHECK (
    squad_id IN (
      SELECT squad_id 
      FROM squad_members 
      WHERE wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        AND role IN ('leader', 'admin')
    )
  );

-- Squad creators can add members
CREATE POLICY "Squad creators can add members" ON squad_members
  FOR INSERT WITH CHECK (
    squad_id IN (
      SELECT id 
      FROM squads 
      WHERE created_by = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Users can leave squads (delete their own membership)
CREATE POLICY "Users can leave squads" ON squad_members
  FOR DELETE USING (wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Squad leaders/admins can remove members
CREATE POLICY "Squad leaders can remove members" ON squad_members
  FOR DELETE USING (
    squad_id IN (
      SELECT squad_id 
      FROM squad_members 
      WHERE wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        AND role IN ('leader', 'admin')
    )
  );

-- Squad creators can remove members
CREATE POLICY "Squad creators can remove members" ON squad_members
  FOR DELETE USING (
    squad_id IN (
      SELECT id 
      FROM squads 
      WHERE created_by = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Squad leaders/admins can update member roles
CREATE POLICY "Squad leaders can update member roles" ON squad_members
  FOR UPDATE USING (
    squad_id IN (
      SELECT squad_id 
      FROM squad_members 
      WHERE wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        AND role IN ('leader', 'admin')
    )
  );

-- Squad creators can update member roles
CREATE POLICY "Squad creators can update member roles" ON squad_members
  FOR UPDATE USING (
    squad_id IN (
      SELECT id 
      FROM squads 
      WHERE created_by = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Function to enforce squad member limits
CREATE OR REPLACE FUNCTION enforce_squad_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get current member count and max allowed
    SELECT COUNT(*), s.max_members
    INTO current_count, max_allowed
    FROM squad_members sm
    JOIN squads s ON s.id = sm.squad_id
    WHERE sm.squad_id = NEW.squad_id
    GROUP BY s.max_members;
    
    -- If no existing members, get max from squads table directly
    IF current_count IS NULL THEN
      SELECT max_members INTO max_allowed FROM squads WHERE id = NEW.squad_id;
      current_count := 0;
    END IF;
    
    -- Check if adding this member would exceed the limit
    IF current_count >= max_allowed THEN
      RAISE EXCEPTION 'Squad is full. Maximum members: %', max_allowed;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to enforce member limits
CREATE TRIGGER enforce_squad_member_limit_trigger
  BEFORE INSERT ON squad_members
  FOR EACH ROW
  EXECUTE FUNCTION enforce_squad_member_limit();

-- Function to automatically add squad creator as admin
CREATE OR REPLACE FUNCTION add_squad_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the squad creator as an admin member
  INSERT INTO squad_members (squad_id, wallet, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (squad_id, wallet) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-add squad creator as admin
CREATE TRIGGER add_squad_creator_as_admin_trigger
  AFTER INSERT ON squads
  FOR EACH ROW
  EXECUTE FUNCTION add_squad_creator_as_admin();

-- Add comments for documentation
COMMENT ON TABLE squad_members IS 'Squad membership and role assignments';
COMMENT ON COLUMN squad_members.squad_id IS 'Reference to the squad';
COMMENT ON COLUMN squad_members.wallet IS 'Reference to the member wallet address';
COMMENT ON COLUMN squad_members.role IS 'Member role: member, moderator, leader, or admin';
COMMENT ON COLUMN squad_members.joined_at IS 'When the member joined the squad';
