/*
  # Initial Kupado.sk Database Schema

  1. New Tables
    - `profiles`
      - User profile information with verification status
      - Includes display name, avatar, contact info, verification badges
      - Tracks user reputation and statistics
    
    - `ads`
      - Main advertisements/listings table
      - Includes all listing details, images, location, pricing
      - Supports multiple categories with flexible metadata
      - Tracks views, favorites, and engagement metrics
    
    - `categories`
      - Product/service categories with metadata
      - Hierarchical structure support
    
    - `messages`
      - Real-time messaging between users
      - Supports ad-specific conversations
      - Read status tracking
    
    - `conversations`
      - Message thread management
      - Participant tracking and metadata
    
    - `favorites`
      - User saved/favorited listings
      - Quick access to liked items
    
    - `saved_searches`
      - Stored search queries with notification preferences
      - Auto-alert when new matching items are posted
    
    - `reviews`
      - User ratings and reviews after transactions
      - Trust and reputation building
    
    - `reports`
      - User-generated content reports
      - Moderation queue management
    
    - `ad_views`
      - Analytics tracking for listing impressions
      - Helps with insights and recommendations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for active listings
    - Private messaging between conversation participants
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  phone text,
  bio text,
  location text,
  postal_code text,
  verified_email boolean DEFAULT false,
  verified_phone boolean DEFAULT false,
  verified_id boolean DEFAULT false,
  rating_average decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  total_purchases integer DEFAULT 0,
  member_since timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  is_dealer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  parent_id text REFERENCES categories(id),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price decimal(12,2) DEFAULT 0,
  price_negotiable boolean DEFAULT false,
  category_id text REFERENCES categories(id) NOT NULL,
  location text NOT NULL,
  postal_code text,
  street text,
  house_number text,
  images text[] DEFAULT '{}',
  video_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'deleted', 'pending')),
  condition text,
  is_featured boolean DEFAULT false,
  featured_until timestamptz,
  view_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  message_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '90 days')
);

-- Create indexes for ads
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_price ON ads(price);
CREATE INDEX IF NOT EXISTS idx_ads_location ON ads(location);
CREATE INDEX IF NOT EXISTS idx_ads_postal_code ON ads(postal_code);
CREATE INDEX IF NOT EXISTS idx_ads_featured ON ads(is_featured, featured_until) WHERE is_featured = true;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE,
  participant_1 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(ad_id, participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_ad_id ON conversations(ad_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_ad_id ON favorites(ad_id);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  search_query text,
  filters jsonb DEFAULT '{}',
  notify_email boolean DEFAULT true,
  notify_frequency text DEFAULT 'daily' CHECK (notify_frequency IN ('instant', 'daily', 'weekly')),
  last_notified_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id uuid REFERENCES ads(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  transaction_type text CHECK (transaction_type IN ('buyer', 'seller')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_type text NOT NULL CHECK (reported_type IN ('ad', 'user', 'message')),
  reported_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  moderator_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- Create ad_views table for analytics
CREATE TABLE IF NOT EXISTS ad_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_ip text,
  referrer text,
  device_type text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views(ad_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

-- Ads policies
CREATE POLICY "Active ads are viewable by everyone"
  ON ads FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can insert own ads"
  ON ads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads"
  ON ads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ads"
  ON ads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved searches policies
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Reports policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Ad views policies
CREATE POLICY "Ad views can be inserted by anyone"
  ON ad_views FOR INSERT
  WITH CHECK (true);

-- Function to update ad view count
CREATE OR REPLACE FUNCTION increment_ad_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ads SET view_count = view_count + 1 WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_ad_view_count
  AFTER INSERT ON ad_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_ad_view_count();

-- Function to update conversation last message timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    rating_average = (
      SELECT AVG(rating)::decimal(3,2)
      FROM reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    )
  WHERE id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Insert default categories
INSERT INTO categories (id, name, slug, description, display_order) VALUES
  ('zvierata', 'Zvieratá', 'zvierata', 'Psy, Mačky, Kone, ...', 1),
  ('deti', 'Deti', 'deti', 'Autosedačky, Kočíky, ...', 2),
  ('reality', 'Reality', 'reality', 'Byty predaj, Domy...', 3),
  ('praca', 'Práca', 'praca', 'Administratíva, Brigády, ...', 4),
  ('auto', 'Auto', 'auto', 'Škoda, Fiat, VW, ...', 5),
  ('motocykle', 'Motocykle', 'motocykle', 'Cestné motocykle, Skútre, ...', 6),
  ('stroje', 'Stroje', 'stroje', 'Drevoobrábacie, Kovoobrábacie ...', 7),
  ('dom-zahrada', 'Dom a záhrada', 'dom-zahrada', 'Kosačky, Kotle, Bojlery ...', 8),
  ('pc', 'PC', 'pc', 'Notebooky, Počítače, ...', 9),
  ('mobily', 'Mobily', 'mobily', 'Apple, Google, Samsung, ...', 10),
  ('foto', 'Foto', 'foto', 'Fotoaparáty, Videokamery, ...', 11),
  ('elektro', 'Elektro', 'elektro', 'Autorádia, Chladničky, ...', 12),
  ('sport', 'Šport', 'sport', 'Horské bicykle, Lyže, ...', 13),
  ('hudba', 'Hudba', 'hudba', 'Bicie nástroje, Skúšobne ...', 14),
  ('vstupenky', 'Vstupenky', 'vstupenky', 'Letenky, Hudba, Koncerty, ...', 15),
  ('knihy', 'Knihy', 'knihy', 'Beletria, Učebnice, ...', 16),
  ('nabytok', 'Nábytok', 'nabytok', 'Kuchyne, Sedacie súpravy ...', 17),
  ('oblecenie', 'Oblečenie', 'oblecenie', 'Obuv, Šperky, Hodinky ...', 18),
  ('sluzby', 'Služby', 'sluzby', 'Doučovanie, Ubytovanie, ...', 19),
  ('ostatne', 'Ostatné', 'ostatne', 'Starožitnosti, Zberateľstvo ...', 20)
ON CONFLICT (id) DO NOTHING;
