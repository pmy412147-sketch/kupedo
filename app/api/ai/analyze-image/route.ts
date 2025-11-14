import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

interface ImageAnalysis {
  qualityScore: number;
  resolutionScore: number;
  lightingScore: number;
  compositionScore: number;
  detectedObjects: string[];
  suggestedImprovements: string[];
  isAppropriate: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, adId, userId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = `
Analyzuj túto fotografiu produktu pre online marketplace a vyhodnoť jej kvalitu.

URL obrázka: ${imageUrl}

Prosím vyhodnoť nasledovné:
1. Celková kvalita fotografie (0-100)
2. Rozlíšenie a ostrosť (0-100)
3. Osvetlenie (0-100)
4. Kompozícia a rámovanie (0-100)
5. Detekované objekty na fotografii
6. Návrhy na zlepšenie
7. Je fotografia vhodná pre marketplace? (bez nevhodného obsahu)

Vráť výsledok v JSON formáte.
`;

    const schema = JSON.stringify({
      qualityScore: 85,
      resolutionScore: 90,
      lightingScore: 75,
      compositionScore: 80,
      detectedObjects: ['produkt', 'pozadie'],
      suggestedImprovements: ['návrh1', 'návrh2'],
      isAppropriate: true,
    });

    const analysis = await generateStructuredOutput<ImageAnalysis>(prompt, schema);

    const endTime = Date.now();

    if (adId) {
      await supabase.from('ai_image_analysis').insert({
        ad_id: adId,
        image_url: imageUrl,
        quality_score: analysis.qualityScore,
        resolution_score: analysis.resolutionScore,
        lighting_score: analysis.lightingScore,
        composition_score: analysis.compositionScore,
        detected_objects: analysis.detectedObjects,
        suggested_improvements: analysis.suggestedImprovements,
        is_appropriate: analysis.isAppropriate,
      });
    }

    if (userId) {
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        feature_type: 'image_analysis',
        response_time_ms: endTime - startTime,
        success: true,
      });
    }

    return NextResponse.json({
      analysis,
      generationTime: endTime - startTime,
    });
  } catch (error: any) {
    console.error('Error analyzing image:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
