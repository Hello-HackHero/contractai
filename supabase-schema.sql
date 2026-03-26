-- ============================================
-- ContractAI Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  analyses_used INTEGER DEFAULT 0,
  analyses_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'inr',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Allow service role to insert profiles (for auto-creation)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT WITH CHECK (true);

-- Contracts: users can only access their own contracts
CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts"
  ON contracts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can also insert contracts
CREATE POLICY "Service can insert contracts"
  ON contracts FOR INSERT WITH CHECK (true);

-- Transactions: users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert transactions"
  ON transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update transactions"
  ON transactions FOR UPDATE USING (true);

-- ============================================
-- Auto-create profile on signup (trigger)
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Create Storage bucket for contracts
-- ============================================
-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: "contracts"
-- Set as public (or configure appropriate policies)

-- ============================================
-- 4. Contract Chats table (Manual Add)
-- ============================================
CREATE TABLE IF NOT EXISTS contract_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for chat
ALTER TABLE contract_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contract chats"
  ON contract_chats FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_chats.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own contract chats"
  ON contract_chats FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_chats.contract_id 
      AND contracts.user_id = auth.uid()
    )
  );
