import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adId = searchParams.get('adId');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!adId) {
      return NextResponse.json(
        { error: 'adId is required' },
        { status: 400 }
      );
    }

    const { data: sourceAd } = await supabase
      .from('ads')
      .select('*')
      .eq('id', adId)
      .single();

    if (!sourceAd) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    const { data: cached } = await supabase
      .from('similar_search_cache')
      .select('*')
      .eq('source_ad_id', adId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      const { data: similarAds } = await supabase
        .from('ads')
        .select('*')
        .in('id', cached.similar_ad_ids)
        .eq('status', 'active')
        .limit(limit);

      return NextResponse.json({
        similarAds: similarAds || [],
        cached: true,
      });
    }

    let query = supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .neq('id', adId);

    if (sourceAd.category_id) {
      query = query.eq('category_id', sourceAd.category_id);
    }

    if (sourceAd.price > 0) {
      const priceMin = sourceAd.price * 0.7;
      const priceMax = sourceAd.price * 1.3;
      query = query.gte('price', priceMin).lte('price', priceMax);
    }

    const { data: similarAds } = await query.limit(limit);

    if (similarAds && similarAds.length > 0) {
      const similarAdIds = similarAds.map((ad: any) => ad.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await supabase.from('similar_search_cache').insert({
        source_ad_id: adId,
        similar_ad_ids: similarAdIds,
        matching_features: ['category', 'price_range', 'location'],
        expires_at: expiresAt.toISOString(),
      });
    }

    return NextResponse.json({
      similarAds: similarAds || [],
      cached: false,
    });
  } catch (error: any) {
    console.error('Error finding similar ads:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to find similar ads' },
      { status: 500 }
    );
  }
}
