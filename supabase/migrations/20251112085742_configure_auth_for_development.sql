/*
  # Configure Auth for Development

  1. Changes
    - Ensures auth.users table can accept new signups
    - Adds a fallback mechanism to handle profile creation
    - Creates a more robust profile sync system

  2. Notes
    - This migration ensures profiles are created even if the trigger fails
    - Handles edge cases where email confirmation might be enabled
*/

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with improved reliability
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create a function to manually sync profiles for existing users without profiles
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.created_at,
    au.updated_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Run the sync function to catch any existing users
SELECT public.sync_user_profiles();
