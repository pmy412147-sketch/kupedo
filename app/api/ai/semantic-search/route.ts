import { NextRequest, NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/claude';
import { supabase } from '@/lib/supabase';

interface SearchAnalysis {
  processedQuery: string;
  extractedFilters: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    location?: string;
    condition?: string;
    brand?: string;
  };
  suggestedTerms: string[];
  semanticExpansion: string[];
  intent: 'buy' | 'sell' | 'compare' | 'research';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, userId } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const prompt = `
Analyzuj tento vyhľadávací dotaz na slovenskom marketplace a spracuj ho pre optimálne vyhľadávanie.

Dotaz: "${query}"

Vykonaj:
1. Spracuj dotaz do štandardizovanej formy
2. Extrahuj všetky filtre z prirodzeného jazyka:
   - Kategória produktu
   - Cenové rozpätie (min/max)
   - Lokalita
   - Stav (nový/použitý)
   - Značka/Model
3. Navrhni alternatívne hľadané výrazy (synonymá)
4. Rozšír sémanticky na príbuzné koncepty
5. Zisti intent používateľa (buy/sell/compare/research)

Príklady spracovania:
- "cervene auto do 10000 eur bratislava" -> extrahovať farbu, typ, cenu max, lokalitu
- "lacny iphone" -> extrahovať značku, cenový filter (pod priemer)
- "predaj mobil samsung" -> intent: sell, kategória, značka

Vráť výsledok v JSON formáte po slovensky.
`;

    const schema = JSON.stringify({
      processedQuery: 'spracovaný dotaz',
      extractedFilters: {
        category: 'kategória',
        priceMin: 0,
        priceMax: 10000,
        location: 'lokalita',
        condition: 'stav',
        brand: 'značka',
      },
      suggestedTerms: ['synonymum1', 'synonymum2'],
      semanticExpansion: ['príbuzný pojem1', 'príbuzný pojem2'],
      intent: 'buy',
    });

    const analysis = await generateStructuredOutput<SearchAnalysis>(prompt, schema);

    const endTime = Date.now();

    let searchResults: any[] = [];
    let queryBuilder = supabase
      .from('ads')
      .select('*')
      .eq('status', 'active');

    if (analysis.processedQuery) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${analysis.processedQuery}%,description.ilike.%${analysis.processedQuery}%`
      );
    }

    if (analysis.extractedFilters.priceMin !== undefined) {
      queryBuilder = queryBuilder.gte('price', analysis.extractedFilters.priceMin);
    }

    if (analysis.extractedFilters.priceMax !== undefined) {
      queryBuilder = queryBuilder.lte('price', analysis.extractedFilters.priceMax);
    }

    if (analysis.extractedFilters.location) {
      queryBuilder = queryBuilder.ilike('location', `%${analysis.extractedFilters.location}%`);
    }

    const { data, error } = await queryBuilder.limit(50);

    if (!error && data) {
      searchResults = data;
    }

    await supabase.from('ai_search_queries').insert({
      user_id: userId || null,
      original_query: query,
      processed_query: analysis.processedQuery,
      extracted_filters: analysis.extractedFilters,
      suggested_terms: analysis.suggestedTerms,
      semantic_expansion: analysis.semanticExpansion,
      results_count: searchResults.length,
    });

    if (userId) {
      await supabase.from('ai_usage_logs').insert({
        user_id: userId,
        feature_type: 'semantic_search',
        response_time_ms: endTime - startTime,
        success: true,
      });
    }

    return NextResponse.json({
      analysis,
      results: searchResults,
      generationTime: endTime - startTime,
    });
  } catch (error: any) {
    console.error('Error in semantic search:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to process semantic search' },
      { status: 500 }
    );
  }
}
