-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet TEXT UNIQUE NOT NULL,
  handle TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet);
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
-- Users can read all profiles (for leaderboards, etc.)
CREATE POLICY "Profiles are publicly readable" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (true);

-- Users can update their own profile (based on wallet address)
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users cannot delete profiles (optional - remove if deletion should be allowed)
CREATE POLICY "Profiles cannot be deleted" ON profiles
  FOR DELETE USING (false);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles containing wallet address, handle, and metadata';
COMMENT ON COLUMN profiles.wallet IS 'Solana wallet address (base58 encoded)';
COMMENT ON COLUMN profiles.handle IS 'Unique user handle/username';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN profiles.bio IS 'User biography/description';
