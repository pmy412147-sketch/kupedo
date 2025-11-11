import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgktuyehfwwsjqbvndjs.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBna3R1eWVoZnd3c2pxYnZuZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTc4MDAsImV4cCI6MjA3Nzk5MzgwMH0.xFC-JqLUFlpvugPdZNaEGDKC_Tivd56uDcwy43ki5bQ';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  postal_code: string | null;
  verified_email: boolean;
  verified_phone: boolean;
  verified_id: boolean;
  rating_average: number;
  rating_count: number;
  total_sales: number;
  total_purchases: number;
  member_since: string;
  last_active: string;
  is_dealer: boolean;
  created_at: string;
  updated_at: string;
};

export type Ad = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  price_negotiable: boolean;
  category_id: string;
  location: string;
  postal_code: string | null;
  street: string | null;
  house_number: string | null;
  images: string[];
  video_url: string | null;
  status: 'active' | 'sold' | 'expired' | 'deleted' | 'pending';
  condition: string | null;
  is_featured: boolean;
  featured_until: string | null;
  view_count: number;
  favorite_count: number;
  message_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  expires_at: string;
  profile?: Profile;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type Conversation = {
  id: string;
  ad_id: string | null;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  ad?: Ad;
  other_profile?: Profile;
  last_message?: Message;
};

export type Favorite = {
  id: string;
  user_id: string;
  ad_id: string;
  created_at: string;
  ad?: Ad;
};

export type SavedSearch = {
  id: string;
  user_id: string;
  name: string;
  search_query: string | null;
  filters: Record<string, any>;
  notify_email: boolean;
  notify_frequency: 'instant' | 'daily' | 'weekly';
  last_notified_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  ad_id: string | null;
  rating: number;
  comment: string | null;
  transaction_type: 'buyer' | 'seller' | null;
  created_at: string;
  reviewer?: Profile;
  ad?: Ad;
};
