import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { data: existingRecommendations } = await supabase
      .from('ai_recommendations')
      .select('*, ads(*)')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('score', { ascending: false })
      .limit(limit);

    if (existingRecommendations && existingRecommendations.length > 0) {
      return NextResponse.json({
        recommendations: existingRecommendations,
        cached: true,
      });
    }

    const { data: recommendations, error } = await supabase.rpc(
      'generate_user_recommendations',
      {
        user_id_param: userId,
        limit_count: limit,
      }
    );

    if (error) throw error;

    if (recommendations && recommendations.length > 0) {
      const recommendationsToInsert = recommendations.map((rec: any) => ({
        user_id: userId,
        recommended_ad_id: rec.ad_id,
        recommendation_type: rec.recommendation_type,
        score: rec.score,
        reasoning: rec.reasoning,
      }));

      await supabase.from('ai_recommendations').insert(recommendationsToInsert);

      const { data: fullRecommendations } = await supabase
        .from('ai_recommendations')
        .select('*, ads(*)')
        .eq('user_id', userId)
        .in(
          'recommended_ad_id',
          recommendations.map((r: any) => r.ad_id)
        );

      return NextResponse.json({
        recommendations: fullRecommendations || recommendations,
        cached: false,
      });
    }

    return NextResponse.json({
      recommendations: [],
      cached: false,
    });
  } catch (error: any) {
    console.error('Error generating recommendations:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recommendationId, interacted } = body;

    if (!recommendationId) {
      return NextResponse.json(
        { error: 'recommendationId is required' },
        { status: 400 }
      );
    }

    await supabase
      .from('ai_recommendations')
      .update({ user_interacted: interacted })
      .eq('id', recommendationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating recommendation:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}
