import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput, geminiPrompts } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

interface Alternative {
  brand: string;
  model: string;
  differences: string;
  why: string;
  priceRange: string;
}

interface AlternativesResponse {
  alternatives: Alternative[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, category, userId } = body;

    if (!product || !category) {
      return NextResponse.json(
        { error: 'product and category are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = geminiPrompts.suggestAlternatives(product, category);
    const schema = JSON.stringify({
      alternatives: [
        {
          brand: 'string',
          model: 'string',
          differences: 'string',
          why: 'string',
          priceRange: 'string',
        },
      ],
    });

    const result = await generateStructuredOutput<AlternativesResponse>(prompt, schema);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    if (userId) {
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        feature_type: 'suggest_alternatives',
        response_time_ms: generationTime,
        success: true,
      });
    }

    return NextResponse.json({
      alternatives: result.alternatives,
      generationTime,
    });
  } catch (error: any) {
    console.error('Error suggesting alternatives:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to suggest alternatives' },
      { status: 500 }
    );
  }
}
