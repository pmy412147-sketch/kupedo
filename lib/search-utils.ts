import { SupabaseClient } from '@supabase/supabase-js';
import { ParsedSearchQuery } from './search-parser';

export interface SearchResult {
  ads: any[];
  totalCount: number;
  appliedFilters: ParsedSearchQuery['filters'];
  searchExplanation: string;
}

export async function performEnhancedSearch(
  supabase: SupabaseClient,
  parsed: ParsedSearchQuery,
  limit: number = 50
): Promise<SearchResult> {
  console.log('[EnhancedSearch] Starting search with filters:', JSON.stringify(parsed.filters));
  console.log('[EnhancedSearch] Search terms:', parsed.searchTerms);

  let query = supabase
    .from('ads')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false });

  if (parsed.filters.category) {
    console.log('[EnhancedSearch] Filtering by category:', parsed.filters.category);
    query = query.eq('category_id', parsed.filters.category);
  }

  if (parsed.filters.priceMin !== undefined) {
    console.log('[EnhancedSearch] Price min:', parsed.filters.priceMin);
    query = query.gte('price', parsed.filters.priceMin);
  }

  if (parsed.filters.priceMax !== undefined) {
    console.log('[EnhancedSearch] Price max:', parsed.filters.priceMax);
    query = query.lte('price', parsed.filters.priceMax);
  }

  if (parsed.filters.location) {
    const locationNormalized = parsed.filters.location.toLowerCase();
    console.log('[EnhancedSearch] Filtering by location:', locationNormalized);
    query = query.or(
      `location.ilike.%${locationNormalized}%,postal_code.ilike.%${locationNormalized}%`
    );
  }

  const { data: initialAds, error, count } = await query.limit(200);

  console.log('[EnhancedSearch] Initial query returned:', initialAds?.length || 0, 'ads');

  if (error) {
    console.error('[EnhancedSearch] Error in query:', error);
    return {
      ads: [],
      totalCount: 0,
      appliedFilters: parsed.filters,
      searchExplanation: 'Chyba pri vyhľadávaní',
    };
  }

  if (!initialAds || initialAds.length === 0) {
    console.log('[EnhancedSearch] No initial results, trying fallback search');
    return await performFallbackSearch(supabase, parsed, limit);
  }

  let filteredAds = initialAds;

  if (parsed.filters.roomCount !== undefined) {
    filteredAds = filteredAds.filter(ad => {
      const metadata = ad.metadata || {};
      const title = (ad.title || '').toLowerCase();
      const description = (ad.description || '').toLowerCase();
      const combinedText = `${title} ${description}`;

      if (metadata.rooms !== undefined) {
        return metadata.rooms === parsed.filters.roomCount;
      }

      if (metadata.roomCount !== undefined) {
        return metadata.roomCount === parsed.filters.roomCount;
      }

      const roomCount = parsed.filters.roomCount!;
      const patterns = [
        new RegExp(`\\b${roomCount}\\s*[-\\s]?\\s*izbov`, 'i'),
        new RegExp(`\\b${roomCount}\\s*izbov`, 'i'),
        new RegExp(`\\b${roomCount}\\s*izb[^o]`, 'i'),
      ];

      if (roomCount === 1) {
        patterns.push(/\bgarsónk/i, /\bjednoizbov/i);
      } else if (roomCount === 2) {
        patterns.push(/\bdvojgarsónk/i, /\bdvojizbov/i);
      } else if (roomCount === 3) {
        patterns.push(/\btrojizbov/i, /\btrojizb/i);
      } else if (roomCount === 4) {
        patterns.push(/\bštvoriizbov/i);
      } else if (roomCount === 5) {
        patterns.push(/\bpäťizbov/i);
      }

      return patterns.some(pattern => pattern.test(combinedText));
    });
  }

  if (parsed.filters.propertyType) {
    filteredAds = filteredAds.filter(ad => {
      const metadata = ad.metadata || {};
      const title = (ad.title || '').toLowerCase();
      const description = (ad.description || '').toLowerCase();
      const combinedText = `${title} ${description}`;

      if (metadata.propertyType) {
        return metadata.propertyType.toLowerCase().includes(parsed.filters.propertyType!);
      }

      if (metadata.type) {
        return metadata.type.toLowerCase().includes(parsed.filters.propertyType!);
      }

      return combinedText.includes(parsed.filters.propertyType!);
    });
  }

  if (parsed.filters.condition) {
    filteredAds = filteredAds.filter(ad => {
      const metadata = ad.metadata || {};
      const condition = ad.condition || '';
      const description = (ad.description || '').toLowerCase();

      if (metadata.condition) {
        return metadata.condition.toLowerCase().includes(parsed.filters.condition!.toLowerCase());
      }

      if (condition) {
        return condition.toLowerCase().includes(parsed.filters.condition!.toLowerCase());
      }

      return description.includes(parsed.filters.condition!.toLowerCase());
    });
  }

  if (parsed.searchTerms.length > 0) {
    filteredAds = filteredAds.filter(ad => {
      const searchableText = normalizeForSearch(
        `${ad.title} ${ad.description} ${ad.location}`
      );

      return parsed.searchTerms.every(term => searchableText.includes(term));
    });
  }

  const finalAds = filteredAds.slice(0, limit);

  return {
    ads: finalAds,
    totalCount: filteredAds.length,
    appliedFilters: parsed.filters,
    searchExplanation: buildSearchExplanation(parsed, finalAds.length),
  };
}

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchExplanation(parsed: ParsedSearchQuery, resultCount: number): string {
  const filterParts: string[] = [];

  if (parsed.filters.roomCount) {
    filterParts.push(`${parsed.filters.roomCount}-izbový`);
  }

  if (parsed.filters.propertyType) {
    filterParts.push(parsed.filters.propertyType);
  }

  if (parsed.filters.location) {
    filterParts.push(`v lokalite ${parsed.filters.location}`);
  }

  if (parsed.filters.priceMin && parsed.filters.priceMax) {
    filterParts.push(`za ${parsed.filters.priceMin}€ - ${parsed.filters.priceMax}€`);
  } else if (parsed.filters.priceMax) {
    filterParts.push(`do ${parsed.filters.priceMax}€`);
  } else if (parsed.filters.priceMin) {
    filterParts.push(`od ${parsed.filters.priceMin}€`);
  }

  if (parsed.filters.condition) {
    filterParts.push(parsed.filters.condition);
  }

  if (filterParts.length > 0) {
    return `Našiel som ${resultCount} ${getAdsWord(resultCount)} pre: ${filterParts.join(', ')}`;
  }

  return `Našiel som ${resultCount} ${getAdsWord(resultCount)} pre "${parsed.originalQuery}"`;
}

function getAdsWord(count: number): string {
  if (count === 1) return 'inzerát';
  if (count >= 2 && count <= 4) return 'inzeráty';
  return 'inzerátov';
}

export function generateSearchSuggestions(parsed: ParsedSearchQuery, resultCount: number): string[] {
  const suggestions: string[] = [];

  if (resultCount === 0) {
    if (parsed.filters.priceMax) {
      suggestions.push('Skúste zvýšiť maximálnu cenu');
    }

    if (parsed.filters.roomCount) {
      suggestions.push('Skúste hľadať aj byty s podobným počtom izieb');
    }

    if (parsed.filters.location) {
      suggestions.push('Skúste rozšíriť lokalitu na okolie');
    }

    if (Object.keys(parsed.filters).length > 3) {
      suggestions.push('Skúste odstrániť niektoré filtre pre viac výsledkov');
    }
  }

  return suggestions;
}

async function performFallbackSearch(
  supabase: SupabaseClient,
  parsed: ParsedSearchQuery,
  limit: number
): Promise<SearchResult> {
  console.log('[FallbackSearch] Starting fallback search');

  let fallbackQuery = supabase
    .from('ads')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  if (parsed.filters.category) {
    fallbackQuery = fallbackQuery.eq('category_id', parsed.filters.category);
  }

  if (parsed.filters.priceMax !== undefined) {
    const relaxedMax = parsed.filters.priceMax * 1.2;
    console.log('[FallbackSearch] Relaxing price max to:', relaxedMax);
    fallbackQuery = fallbackQuery.lte('price', relaxedMax);
  }

  if (parsed.filters.location) {
    const locationWords = parsed.filters.location.toLowerCase().split(/[\s-]+/);
    console.log('[FallbackSearch] Searching for location keywords:', locationWords);

    const locationConditions = locationWords
      .map(word => `location.ilike.%${word}%`)
      .join(',');

    fallbackQuery = fallbackQuery.or(locationConditions);
  }

  fallbackQuery = fallbackQuery
    .order('is_boosted', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);

  const { data: fallbackAds, error } = await fallbackQuery;

  console.log('[FallbackSearch] Fallback query returned:', fallbackAds?.length || 0, 'ads');

  if (error || !fallbackAds || fallbackAds.length === 0) {
    return {
      ads: [],
      totalCount: 0,
      appliedFilters: parsed.filters,
      searchExplanation: 'Nenašli sa žiadne výsledky',
    };
  }

  let filteredAds = fallbackAds;

  if (parsed.filters.roomCount !== undefined) {
    console.log('[FallbackSearch] Filtering by room count:', parsed.filters.roomCount);
    filteredAds = filteredAds.filter(ad => {
      const metadata = ad.metadata || {};
      const title = (ad.title || '').toLowerCase();
      const description = (ad.description || '').toLowerCase();
      const combinedText = `${title} ${description}`;

      if (metadata.rooms !== undefined) {
        return metadata.rooms === parsed.filters.roomCount;
      }
      if (metadata.roomCount !== undefined) {
        return metadata.roomCount === parsed.filters.roomCount;
      }

      const roomCount = parsed.filters.roomCount!;
      const patterns = [
        new RegExp(`\\b${roomCount}\\s*[-\\s]?\\s*izbov`, 'i'),
        new RegExp(`\\b${roomCount}\\s+izbov`, 'i'),
        new RegExp(`\\b${roomCount}\\s*izb[^o]`, 'i'),
      ];

      if (roomCount === 1) {
        patterns.push(/\bgarsónk/i, /\bjednoizbov/i);
      } else if (roomCount === 2) {
        patterns.push(/\bdvojgarsónk/i, /\bdvojizbov/i);
      } else if (roomCount === 3) {
        patterns.push(/\btrojizbov/i, /\btrojizb/i);
      } else if (roomCount === 4) {
        patterns.push(/\bštvoriizbov/i);
      } else if (roomCount === 5) {
        patterns.push(/\bpäťizbov/i);
      }

      return patterns.some(pattern => pattern.test(combinedText));
    });
    console.log('[FallbackSearch] After room count filter:', filteredAds.length, 'ads');
  }

  if (parsed.filters.propertyType) {
    filteredAds = filteredAds.filter(ad => {
      const metadata = ad.metadata || {};
      const title = (ad.title || '').toLowerCase();
      const description = (ad.description || '').toLowerCase();
      const combinedText = `${title} ${description}`;

      if (metadata.propertyType) {
        return metadata.propertyType.toLowerCase().includes(parsed.filters.propertyType!);
      }

      if (metadata.type) {
        return metadata.type.toLowerCase().includes(parsed.filters.propertyType!);
      }

      return combinedText.includes(parsed.filters.propertyType!);
    });
  }

  if (parsed.searchTerms.length > 0) {
    filteredAds = filteredAds.filter(ad => {
      const searchableText = normalizeForSearch(
        `${ad.title} ${ad.description} ${ad.location}`
      );

      return parsed.searchTerms.some(term => searchableText.includes(term));
    });
  }

  const finalAds = filteredAds.slice(0, limit);

  return {
    ads: finalAds,
    totalCount: filteredAds.length,
    appliedFilters: parsed.filters,
    searchExplanation: buildSearchExplanation(parsed, finalAds.length),
  };
}
