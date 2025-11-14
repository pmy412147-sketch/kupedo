import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput, geminiPrompts } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

interface ComparisonResult {
  summary: string;
  comparison: {
    specifications: string;
    priceValue: string;
    condition: string;
  };
  recommendation: {
    bestChoice: number;
    reasoning: string;
  };
  suitability: Array<{
    productIndex: number;
    suitableFor: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products, userId, category } = body;

    if (!products || !Array.isArray(products) || products.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 products are required for comparison' },
        { status: 400 }
      );
    }

    const cacheKey = crypto
      .createHash('md5')
      .update(JSON.stringify(products))
      .digest('hex');

    const { data: cached } = await supabase
      .from('ai_cache')
      .select('cached_response, id')
      .eq('cache_key', cacheKey)
      .eq('feature_type', 'compare_products')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached) {
      await supabase.rpc('increment_cache_hit', { cache_key_param: cacheKey });

      return NextResponse.json({
        comparison: cached.cached_response,
        cached: true,
      });
    }

    const startTime = Date.now();

    const prompt = geminiPrompts.compareProducts(products);
    const schema = JSON.stringify({
      summary: 'string',
      comparison: {
        specifications: 'string',
        priceValue: 'string',
        condition: 'string',
      },
      recommendation: {
        bestChoice: 0,
        reasoning: 'string',
      },
      suitability: [
        {
          productIndex: 0,
          suitableFor: 'string',
        },
      ],
    });

    const comparison = await generateStructuredOutput<ComparisonResult>(prompt, schema);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    const adIds = products.map((p: any) => p.id);

    await supabase.from('ai_comparisons').insert({
      user_id: userId || null,
      ad_ids: adIds,
      category: category || 'general',
      comparison_data: comparison,
      summary: comparison.summary,
      best_choice: comparison.recommendation.bestChoice,
      recommendation_reasoning: comparison.recommendation.reasoning,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await supabase.from('ai_cache').insert({
      cache_key: cacheKey,
      feature_type: 'compare_products',
      input_hash: cacheKey,
      cached_response: comparison,
      expires_at: expiresAt.toISOString(),
    });

    if (userId) {
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        feature_type: 'compare_products',
        response_time_ms: generationTime,
        success: true,
        metadata: { product_count: products.length },
      });
    }

    return NextResponse.json({
      comparison,
      generationTime,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error comparing products:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to compare products' },
      { status: 500 }
    );
  }
}
