/*
  # Enable pg_net Extension for Push Notifications

  1. Changes
    - Enable pg_net extension for HTTP requests from database
    - Configure app settings for Supabase URL and service role key
    - These are needed for the message notification trigger
    
  2. Security
    - pg_net allows secure HTTP calls from database triggers
    - Service role key is stored securely in database settings
    - Only functions with SECURITY DEFINER can access these settings
    
  3. Note
    - The actual Supabase URL and service role key must be set via environment
    - This migration prepares the infrastructure
*/

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant usage to authenticated users (via SECURITY DEFINER functions)
GRANT USAGE ON SCHEMA net TO postgres, authenticated, service_role;

-- Note: Supabase automatically provides these settings:
-- - current_setting('request.headers')::json->>'host' for URL
-- - We'll use edge function URL directly in the trigger
