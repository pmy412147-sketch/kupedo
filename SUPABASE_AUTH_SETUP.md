# Supabase Authentication Setup Guide

## Google OAuth Configuration

To enable Google Sign-In, you need to configure Google OAuth in your Supabase project:

### Step 1: Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list of providers
5. Enable the Google provider
6. You'll need to add your **Google Client ID** and **Google Client Secret**

### Step 2: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Add authorized redirect URIs:
   - `https://voxpvsxsrnamungvllke.supabase.co/auth/v1/callback`
   - For local development: `http://localhost:3000`
7. Click **Create** and save your **Client ID** and **Client Secret**

### Step 3: Add Credentials to Supabase

1. Return to Supabase Dashboard > Authentication > Providers > Google
2. Paste your **Google Client ID** in the Client ID field
3. Paste your **Google Client Secret** in the Client Secret field
4. Click **Save**

### Step 4: Configure Site URL (Important!)

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Set your **Site URL** to your production domain (e.g., `https://kupado.sk`)
3. Add your development URL to **Redirect URLs**: `http://localhost:3000/**`

### Step 5: Test Authentication

1. Start your development server: `npm run dev`
2. Click "Prihlásiť sa" (Sign In)
3. Click "Pokračovať s Google" (Continue with Google)
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## Email/Password Authentication

Email/password authentication works out of the box with Supabase! Users will receive a confirmation email by default.

### Disable Email Confirmation (Optional)

If you want to disable email confirmation for testing:

1. Go to Supabase Dashboard > Authentication > Settings
2. Find "Enable email confirmations"
3. Toggle it off (not recommended for production)

## Troubleshooting

### "Invalid Redirect URI" Error
- Make sure the redirect URI in Google Cloud Console matches exactly: `https://voxpvsxsrnamungvllke.supabase.co/auth/v1/callback`
- Check that there are no trailing slashes

### Authentication Not Working Locally
- Verify that `http://localhost:3000/**` is in your Redirect URLs in Supabase
- Clear your browser cookies and try again

### Users Not Appearing in Database
- The system automatically creates a profile in the `profiles` table when a user signs in for the first time
- Check the browser console for any errors

## Current Configuration

Your app is now using **Supabase Auth** instead of Firebase Auth. The authentication flow:

1. Users sign in via Google OAuth or Email/Password
2. Supabase handles authentication and session management
3. A profile is automatically created in the `profiles` table
4. User data is synced with the authentication state

## Security Notes

- Always use HTTPS in production
- Never commit your Google Client Secret to version control
- Regularly rotate your credentials
- Enable Row Level Security (RLS) policies on all tables (already configured)
