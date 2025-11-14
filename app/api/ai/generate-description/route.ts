import { NextRequest, NextResponse } from 'next/server';
import { generateTextWithRetry, geminiPrompts } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

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

    const prompt = geminiPrompts.generateAdDescription(productInfo);
    const generatedText = await generateTextWithRetry(prompt);

    const endTime = Date.now();
    const generationTime = endTime - startTime;

    await supabase.from('ai_generated_content').insert({
      user_id: userId,
      content_type: 'description',
      generated_text: generatedText,
      input_data: productInfo,
      generation_time_ms: generationTime,
    });

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      feature_type: 'generate_description',
      response_time_ms: generationTime,
      success: true,
    });

    return NextResponse.json({
      description: generatedText,
      generationTime,
    });
  } catch (error: any) {
    console.error('Error generating description:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to generate description' },
      { status: 500 }
    );
  }
}
