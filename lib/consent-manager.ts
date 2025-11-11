import { createClient } from '@/lib/supabase';

export interface ConsentPreferences {
  ad_storage: boolean;
  ad_user_data: boolean;
  ad_personalization: boolean;
  analytics_storage: boolean;
}

export interface ConsentRecord extends ConsentPreferences {
  id?: string;
  user_id?: string;
  consent_version: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  updated_at?: string;
}

export async function saveConsentToDatabase(
  userId: string,
  preferences: ConsentPreferences
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const consentRecord: Partial<ConsentRecord> = {
      user_id: userId,
      ad_storage: preferences.ad_storage,
      ad_user_data: preferences.ad_user_data,
      ad_personalization: preferences.ad_personalization,
      analytics_storage: preferences.analytics_storage,
      consent_version: 'v1',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    const { data: existingConsent } = await supabase
      .from('consent_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingConsent) {
      const { error } = await supabase
        .from('consent_preferences')
        .update(consentRecord)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating consent:', error);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('consent_preferences')
        .insert([consentRecord]);

      if (error) {
        console.error('Error inserting consent:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving consent to database:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getConsentFromDatabase(
  userId: string
): Promise<ConsentPreferences | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('consent_preferences')
      .select('ad_storage, ad_user_data, ad_personalization, analytics_storage')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching consent:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting consent from database:', error);
    return null;
  }
}

export function getConsentFromCookie(): ConsentPreferences | null {
  if (typeof document === 'undefined') return null;

  const CONSENT_COOKIE_NAME = 'dealio_consent_preferences';
  const cookies = document.cookie.split(';');
  const consentCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${CONSENT_COOKIE_NAME}=`)
  );

  if (consentCookie) {
    try {
      const value = consentCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(value));
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function saveConsentToCookie(
  preferences: ConsentPreferences,
  expiryDays: number = 365
): void {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);

  const CONSENT_COOKIE_NAME = 'dealio_consent_preferences';
  document.cookie = `${CONSENT_COOKIE_NAME}=${JSON.stringify(preferences)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}

export function updateGoogleConsent(preferences: ConsentPreferences): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: preferences.ad_storage ? 'granted' : 'denied',
      ad_user_data: preferences.ad_user_data ? 'granted' : 'denied',
      ad_personalization: preferences.ad_personalization ? 'granted' : 'denied',
      analytics_storage: preferences.analytics_storage ? 'granted' : 'denied',
    });
  }
}

export function setDefaultGoogleConsent(): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    });
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
