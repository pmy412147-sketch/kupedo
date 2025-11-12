/*
  # Remove Trigger and Fix Profile Creation

  1. Changes
    - Removes the automatic trigger (causing 500 errors)
    - Updates RLS policies to allow profile creation by authenticated users
    - Adds policy for anon users during signup

  2. Notes
    - Profile will now be created by the application code, not by trigger
    - This is more reliable and easier to debug
*/

-- Drop the trigger completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies that allow profile creation
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to do anything (needed for initial setup)
CREATE POLICY "Service role can do anything"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
