-- Create squads table
CREATE TABLE IF NOT EXISTS squads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  emblem_url TEXT,
  max_members INTEGER DEFAULT 20 NOT NULL CHECK (max_members > 0 AND max_members <= 100),
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  created_by TEXT NOT NULL REFERENCES profiles(wallet) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_squads_name ON squads(name);
CREATE INDEX IF NOT EXISTS idx_squads_slug ON squads(slug);
CREATE INDEX IF NOT EXISTS idx_squads_is_public ON squads(is_public);
CREATE INDEX IF NOT EXISTS idx_squads_created_by ON squads(created_by);
CREATE INDEX IF NOT EXISTS idx_squads_created_at ON squads(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_squads_updated_at 
  BEFORE UPDATE ON squads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_squad_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from name
  base_slug := LOWER(REGEXP_REPLACE(TRIM(NEW.name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '^-+|-+$', '', 'g');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'squad';
  END IF;
  
  -- Check for uniqueness and add counter if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM squads WHERE slug = final_slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate slug
CREATE TRIGGER generate_squad_slug_trigger
  BEFORE INSERT OR UPDATE ON squads
  FOR EACH ROW
  EXECUTE FUNCTION generate_squad_slug();

-- Enable Row Level Security
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for squads table
-- Public squads are readable by everyone
CREATE POLICY "Public squads are readable by everyone" ON squads
  FOR SELECT USING (is_public = TRUE);

-- Squad members can read their squad (even if private)
CREATE POLICY "Squad members can read their squad" ON squads
  FOR SELECT USING (
    id IN (
      SELECT squad_id 
      FROM squad_members 
      WHERE wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    )
  );

-- Squad creators can read their squads
CREATE POLICY "Squad creators can read their squads" ON squads
  FOR SELECT USING (created_by = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can create squads
CREATE POLICY "Users can create squads" ON squads
  FOR INSERT WITH CHECK (created_by = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Squad creators can update their squads
CREATE POLICY "Squad creators can update their squads" ON squads
  FOR UPDATE USING (created_by = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Squad leaders can update their squads (assuming leader role exists)
CREATE POLICY "Squad leaders can update their squads" ON squads
  FOR UPDATE USING (
    id IN (
      SELECT squad_id 
      FROM squad_members 
      WHERE wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        AND role IN ('leader', 'admin')
    )
  );

-- Squad creators can delete their squads
CREATE POLICY "Squad creators can delete their squads" ON squads
  FOR DELETE USING (created_by = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Add comments for documentation
COMMENT ON TABLE squads IS 'Squad/team information for group gameplay';
COMMENT ON COLUMN squads.name IS 'Human-readable squad name';
COMMENT ON COLUMN squads.slug IS 'URL-friendly unique identifier (auto-generated from name)';
COMMENT ON COLUMN squads.description IS 'Squad description or mission statement';
COMMENT ON COLUMN squads.emblem_url IS 'URL to squad emblem/logo image';
COMMENT ON COLUMN squads.max_members IS 'Maximum number of members allowed in the squad';
COMMENT ON COLUMN squads.is_public IS 'Whether the squad is publicly visible and joinable';
COMMENT ON COLUMN squads.created_by IS 'Wallet address of the squad creator';
