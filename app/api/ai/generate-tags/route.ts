import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

interface TagsResponse {
  tags: string[];
  categoryKeywords: string[];
  searchKeywords: string[];
  confidenceScores: Record<string, number>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adData, adId, userId } = body;

    if (!adData) {
      return NextResponse.json(
        { error: 'adData is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = `
Vygeneruj relevantné tagy a kľúčové slová pre tento inzerát na slovenskom marketplace.

Údaje inzerátu:
Nadpis: ${adData.title}
Popis: ${adData.description}
Kategória: ${adData.category}
Cena: ${adData.price}€

Vygeneruj:
1. 5-10 hlavných tagov - krátke, výstižné označenia produktu
2. 5-8 kategóriových kľúčových slov - špecifické pre danú kategóriu
3. 10-15 search keywords - slová, ktoré ľudia používajú pri vyhľadávaní
4. Skóre dôveryhodnosti pre každý tag (0-1)

Požiadavky:
- Všetky v slovenčine
- Bez diakritiky v tagoch (lepšie pre SEO)
- Relevantné pre vyhľadávanie
- Zahrň synonymá a alternatívne názvy
- Zahrň značku a model ak je uvedený

Vráť výsledok v JSON formáte.
`;

    const schema = JSON.stringify({
      tags: ['tag1', 'tag2'],
      categoryKeywords: ['keyword1', 'keyword2'],
      searchKeywords: ['search1', 'search2'],
      confidenceScores: {
        tag1: 0.95,
        tag2: 0.87,
      },
    });

    const result = await generateStructuredOutput<TagsResponse>(prompt, schema);

    const endTime = Date.now();

    if (adId) {
      const { data: existing } = await supabase
        .from('ai_auto_tags')
        .select('id')
        .eq('ad_id', adId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('ai_auto_tags')
          .update({
            generated_tags: result.tags,
            category_keywords: result.categoryKeywords,
            search_keywords: result.searchKeywords,
            confidence_scores: result.confidenceScores,
          })
          .eq('ad_id', adId);
      } else {
        await supabase.from('ai_auto_tags').insert({
          ad_id: adId,
          generated_tags: result.tags,
          category_keywords: result.categoryKeywords,
          search_keywords: result.searchKeywords,
          confidence_scores: result.confidenceScores,
        });
      }
    }

    if (userId) {
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        feature_type: 'auto_tagging',
        response_time_ms: endTime - startTime,
        success: true,
      });
    }

    return NextResponse.json({
      tags: result,
      generationTime: endTime - startTime,
    });
  } catch (error: any) {
    console.error('Error generating tags:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to generate tags' },
      { status: 500 }
    );
  }
}
