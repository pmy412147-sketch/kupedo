import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput, geminiPrompts } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

interface TitleResponse {
  titles: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productInfo, userId } = body;

    if (!productInfo || !userId) {
      return NextResponse.json(
        { error: 'productInfo and userId are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = geminiPrompts.generateAdTitle(productInfo);
    const schema = JSON.stringify({
      titles: ['string', 'string', 'string'],
    });

    const result = await generateStructuredOutput<TitleResponse>(prompt, schema);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    await supabase.from('ai_generated_content').insert({
      user_id: userId,
      content_type: 'title',
      generated_text: JSON.stringify(result.titles),
      input_data: productInfo,
      generation_time_ms: generationTime,
    });

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      feature_type: 'generate_title',
      response_time_ms: generationTime,
      success: true,
    });

    return NextResponse.json({
      titles: result.titles,
      generationTime,
    });
  } catch (error: any) {
    console.error('Error generating title:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to generate title' },
      { status: 500 }
    );
  }
}
