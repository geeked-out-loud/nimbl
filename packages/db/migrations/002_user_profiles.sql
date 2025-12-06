-- Migration 002: User Profiles & Auth Integration
-- This migration:
-- 1. Drops old custom users table
-- 2. Converts forms.owner_id from TEXT to UUID
-- 3. Creates user_profiles table linked to auth.users
-- 4. Sets up triggers and functions for auth

-- Step 1: Drop old custom users table (if exists)
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Convert forms.owner_id from TEXT to UUID
-- First, delete test data with invalid UUIDs
DELETE FROM forms WHERE owner_id = 'test-user-123' OR owner_id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

-- Convert the column type
ALTER TABLE forms 
  ALTER COLUMN owner_id TYPE UUID USING owner_id::uuid;

-- Add foreign key constraint
ALTER TABLE forms
  ADD CONSTRAINT forms_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT username_format CHECK (username ~ '^[A-Za-z0-9._]{3,30}$')
);

-- Index for fast username lookup during login
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Step 4: RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_select_public ON user_profiles;

-- Users can read their own profile
CREATE POLICY user_profiles_select_own ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY user_profiles_update_own ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can check if username exists (for signup validation)
CREATE POLICY user_profiles_select_public ON user_profiles
  FOR SELECT
  USING (true);

-- Step 5: Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Function to get user email by username (for login)
CREATE OR REPLACE FUNCTION public.get_email_by_username(input_username TEXT)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT u.email INTO user_email
  FROM auth.users u
  JOIN public.user_profiles p ON p.id = u.id
  WHERE p.username = input_username;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
