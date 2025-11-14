import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput, geminiPrompts } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

interface QualityEvaluation {
  totalScore: number;
  breakdown: {
    description: number;
    photos: number;
    specifications: number;
    pricing: number;
  };
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adData, userId, adId } = body;

    if (!adData || !userId) {
      return NextResponse.json(
        { error: 'adData and userId are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = geminiPrompts.evaluateAdQuality(adData);
    const schema = JSON.stringify({
      totalScore: 0,
      breakdown: {
        description: 0,
        photos: 0,
        specifications: 0,
        pricing: 0,
      },
      suggestions: ['string'],
      strengths: ['string'],
      weaknesses: ['string'],
    });

    let evaluation: QualityEvaluation;

    try {
      evaluation = await generateStructuredOutput<QualityEvaluation>(prompt, schema);
    } catch (apiError: any) {
      if (apiError.message?.includes('preťažená')) {
        return NextResponse.json(
          { error: 'AI je momentálne preťažená. Prosím skúste to o chvíľu.' },
          { status: 503 }
        );
      }
      throw apiError;
    }

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    if (adId) {
      const { data: existing } = await supabase
        .from('ad_quality_scores')
        .select('id')
        .eq('ad_id', adId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('ad_quality_scores')
          .update({
            total_score: evaluation.totalScore,
            description_score: evaluation.breakdown.description,
            photos_score: evaluation.breakdown.photos,
            specifications_score: evaluation.breakdown.specifications,
            pricing_score: evaluation.breakdown.pricing,
            suggestions: evaluation.suggestions,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            updated_at: new Date().toISOString(),
          })
          .eq('ad_id', adId);
      } else {
        await supabase.from('ad_quality_scores').insert({
          ad_id: adId,
          user_id: userId,
          total_score: evaluation.totalScore,
          description_score: evaluation.breakdown.description,
          photos_score: evaluation.breakdown.photos,
          specifications_score: evaluation.breakdown.specifications,
          pricing_score: evaluation.breakdown.pricing,
          suggestions: evaluation.suggestions,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
        });
      }
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      feature_type: 'evaluate_quality',
      response_time_ms: generationTime,
      success: true,
    });

    return NextResponse.json({
      ...evaluation,
      generationTime,
    });
  } catch (error: any) {
    console.error('Error evaluating quality:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to evaluate quality' },
      { status: 500 }
    );
  }
}
