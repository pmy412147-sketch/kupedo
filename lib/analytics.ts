import { supabase } from './supabase';

// Generate or get session ID for anonymous tracking
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Detect device type
export const getDeviceType = (): string => {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get traffic source
export const getTrafficSource = (): string => {
  if (typeof window === 'undefined') return 'direct';

  const referrer = document.referrer;
  if (!referrer) return 'direct';

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes('google')) return 'google';
    if (hostname.includes('facebook')) return 'facebook';
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('twitter') || hostname.includes('t.co')) return 'twitter';
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('youtube')) return 'youtube';

    // Check if it's from the same domain
    if (hostname === window.location.hostname) return 'internal';

    return 'referral';
  } catch {
    return 'direct';
  }
};

// Track ad view
export const trackAdView = async (
  adId: string,
  userId?: string,
  duration: number = 0
) => {
  try {
    const sessionId = getSessionId();
    const source = getTrafficSource();
    const deviceType = getDeviceType();
    const referrer = typeof window !== 'undefined' ? document.referrer : null;

    await supabase.from('listing_views').insert({
      ad_id: adId,
      user_id: userId || null,
      session_id: sessionId,
      source,
      referrer,
      device_type: deviceType,
      duration
    });

    // Update view count on ad
    await supabase.rpc('increment_view_count', { ad_id: adId });
  } catch (error) {
    console.error('Error tracking ad view:', error);
  }
};

// Track interaction
export const trackInteraction = async (
  adId: string,
  actionType: 'click_phone' | 'click_message' | 'save' | 'share' | 'click_email',
  userId?: string,
  metadata?: Record<string, any>
) => {
  try {
    const sessionId = getSessionId();

    await supabase.from('listing_interactions').insert({
      ad_id: adId,
      user_id: userId || null,
      session_id: sessionId,
      action_type: actionType,
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
};

// Analyze competitors
export const analyzeCompetitors = async (adId: string, categoryId: string, price: number) => {
  try {
    // Get similar ads in the same category
    const { data: similarAds } = await supabase
      .from('ads')
      .select('id, title, price, created_at')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .neq('id', adId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!similarAds) return;

    // Calculate similarity and store
    for (const competitor of similarAds) {
      const priceDifference = price - (competitor.price || 0);
      const similarityScore = Math.max(0, 100 - Math.abs(priceDifference / price) * 100);

      await supabase.from('competitor_listings').insert({
        ad_id: adId,
        competitor_ad_id: competitor.id,
        similarity_score: similarityScore,
        price_difference: priceDifference
      });
    }
  } catch (error) {
    console.error('Error analyzing competitors:', error);
  }
};

// Get listing optimization suggestions
export const getOptimizationSuggestions = async (adId: string) => {
  try {
    const { data: ad } = await supabase
      .from('ads')
      .select('*, listing_views(*), listing_interactions(*)')
      .eq('id', adId)
      .single();

    if (!ad) return [];

    const suggestions: string[] = [];

    // Check images
    if (!ad.images || ad.images.length < 3) {
      suggestions.push('Pridajte viac fotografií (minimálne 3-5) pre lepšiu viditeľnosť');
    }

    // Check description length
    if (ad.description.length < 100) {
      suggestions.push('Rozšírte popis na aspoň 100 znakov pre lepšie SEO');
    }

    // Check price optimization
    const { data: categoryAds } = await supabase
      .from('ads')
      .select('price')
      .eq('category_id', ad.category_id)
      .eq('status', 'active');

    if (categoryAds && categoryAds.length > 0) {
      const avgPrice = categoryAds.reduce((sum, a) => sum + (a.price || 0), 0) / categoryAds.length;
      const priceDiff = ((ad.price - avgPrice) / avgPrice) * 100;

      if (priceDiff > 20) {
        suggestions.push(`Vaša cena je o ${priceDiff.toFixed(0)}% vyššia ako priemer v kategórii`);
      } else if (priceDiff < -20) {
        suggestions.push(`Vaša cena je o ${Math.abs(priceDiff).toFixed(0)}% nižšia ako priemer - možno ju môžete zvýšiť`);
      }
    }

    // Check activity
    const daysSinceCreated = (Date.now() - new Date(ad.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated > 14) {
      suggestions.push('Aktualizujte inzerát pre lepšie umiestnenie vo výsledkoch');
    }

    // Check views vs interactions
    const views = ad.listing_views?.length || 0;
    const interactions = ad.listing_interactions?.length || 0;
    if (views > 50 && interactions / views < 0.05) {
      suggestions.push('Nízka konverzia - skúste upraviť nadpis alebo prvú fotografiu');
    }

    return suggestions;
  } catch (error) {
    console.error('Error getting optimization suggestions:', error);
    return [];
  }
};

// Create A/B test
export const createABTest = async (
  adId: string,
  experimentType: 'title' | 'description' | 'images',
  variantA: string,
  variantB: string
) => {
  try {
    const { data } = await supabase
      .from('listing_experiments')
      .insert({
        ad_id: adId,
        experiment_type: experimentType,
        variant_a: variantA,
        variant_b: variantB
      })
      .select()
      .single();

    return data;
  } catch (error) {
    console.error('Error creating A/B test:', error);
    return null;
  }
};

// Track A/B test result
export const trackABTestView = async (experimentId: string, variant: 'a' | 'b') => {
  try {
    const field = variant === 'a' ? 'variant_a_views' : 'variant_b_views';

    const { data: experiment } = await supabase
      .from('listing_experiments')
      .select(field)
      .eq('id', experimentId)
      .single();

    if (experiment) {
      await supabase
        .from('listing_experiments')
        .update({ [field]: experiment[field] + 1 })
        .eq('id', experimentId);
    }
  } catch (error) {
    console.error('Error tracking A/B test view:', error);
  }
};

// Determine A/B test winner
export const determineABTestWinner = async (experimentId: string) => {
  try {
    const { data: experiment } = await supabase
      .from('listing_experiments')
      .select('*')
      .eq('id', experimentId)
      .single();

    if (!experiment) return null;

    const totalViews = experiment.variant_a_views + experiment.variant_b_views;
    if (totalViews < 100) return null; // Need minimum 100 views

    const conversionA = experiment.variant_a_views > 0
      ? experiment.variant_a_clicks / experiment.variant_a_views
      : 0;
    const conversionB = experiment.variant_b_views > 0
      ? experiment.variant_b_clicks / experiment.variant_b_views
      : 0;

    const winner = conversionA > conversionB ? 'a' : 'b';

    await supabase
      .from('listing_experiments')
      .update({
        winner,
        ended_at: new Date().toISOString()
      })
      .eq('id', experimentId);

    return winner;
  } catch (error) {
    console.error('Error determining A/B test winner:', error);
    return null;
  }
};
