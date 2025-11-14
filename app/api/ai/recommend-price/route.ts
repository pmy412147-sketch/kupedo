import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput, claudePrompts } from '@/lib/claude';
import { supabase } from '@/lib/supabase';

interface PriceRecommendation {
  recommendedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketAnalysis: string;
  reasoning: string;
  competitiveness: 'low' | 'medium' | 'high';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productInfo, similarProducts, userId, adId, category } = body;

    if (!productInfo) {
      return NextResponse.json(
        { error: 'productInfo is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = claudePrompts.recommendPrice(productInfo, similarProducts || []);
    const schema = JSON.stringify({
      recommendedPrice: 0,
      priceRange: {
        min: 0,
        max: 0,
      },
      marketAnalysis: 'string',
      reasoning: 'string',
      competitiveness: 'medium',
    });

    const recommendation = await generateStructuredOutput<PriceRecommendation>(prompt, schema);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    if (userId) {
      await supabase.from('price_analysis').insert({
        ad_id: adId || null,
        user_id: userId,
        category: category || 'general',
        recommended_price: recommendation.recommendedPrice,
        price_range_min: recommendation.priceRange.min,
        price_range_max: recommendation.priceRange.max,
        market_analysis: recommendation.marketAnalysis,
        reasoning: recommendation.reasoning,
        competitiveness: recommendation.competitiveness,
        similar_products_analyzed: similarProducts?.length || 0,
      });

      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        feature_type: 'recommend_price',
        response_time_ms: generationTime,
        success: true,
      });
    }

    return NextResponse.json({
      recommendation,
      generationTime,
    });
  } catch (error: any) {
    console.error('Error recommending price:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to recommend price' },
      { status: 500 }
    );
  }
}
