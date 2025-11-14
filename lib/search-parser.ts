export interface ParsedSearchQuery {
  originalQuery: string;
  cleanQuery: string;
  filters: {
    category?: string;
    propertyType?: string;
    roomCount?: number;
    priceMin?: number;
    priceMax?: number;
    location?: string;
    condition?: string;
    offerType?: string;
  };
  searchTerms: string[];
  confidence: number;
}

const SLOVAK_STOP_WORDS = [
  'a', 'ale', 'alebo', 'ani', 'až', 'bez', 'či', 'do', 'for', 'i', 'k', 'kde',
  'ktorý', 'ktorá', 'ktoré', 'na', 'od', 'po', 'pod', 'pre', 'pri', 's', 'so',
  'v', 'vo', 'z', 'zo', 'za', 'o', 'nad', 'medzi', 'cez', 'pred'
];

const ROOM_COUNT_PATTERNS = [
  { pattern: /(\d+)\s*[-\s]?\s*izbov[ýáéíóúyě]/gi, type: 'numeric' },
  { pattern: /garsónk[aáu]/gi, rooms: 1 },
  { pattern: /dvojgarsónk[aáu]/gi, rooms: 2 },
  { pattern: /jednoizbov[ýáéíóúy]/gi, rooms: 1 },
  { pattern: /dvojizbov[ýáéíóúy]/gi, rooms: 2 },
  { pattern: /trojizbov[ýáéíóúy]/gi, rooms: 3 },
  { pattern: /štvoriizbov[ýáéíóúy]/gi, rooms: 4 },
  { pattern: /päťizbov[ýáéíóúy]/gi, rooms: 5 },
];

const PROPERTY_TYPE_PATTERNS = [
  { pattern: /\bbyt\w*/gi, type: 'byt' },
  { pattern: /\bdom\w*/gi, type: 'dom' },
  { pattern: /\bpozemok\w*/gi, type: 'pozemok' },
  { pattern: /\bgará[žz]\w*/gi, type: 'garž' },
  { pattern: /\bchata\w*/gi, type: 'chata' },
  { pattern: /\bchalupa\w*/gi, type: 'chalupa' },
  { pattern: /\bapartmán\w*/gi, type: 'apartmán' },
  { pattern: /\bmezonet\w*/gi, type: 'mezonet' },
  { pattern: /\bloft\w*/gi, type: 'loft' },
];

const OFFER_TYPE_PATTERNS = [
  { pattern: /\bpredaj\w*/gi, type: 'predaj' },
  { pattern: /\bprenájom\w*/gi, type: 'prenájom' },
  { pattern: /\bkúp[ait]\w*/gi, type: 'kúpa' },
  { pattern: /\bvýmen[aáu]\w*/gi, type: 'výmena' },
];

const CONDITION_PATTERNS = [
  { pattern: /\bnovostavb[aáu]\w*/gi, condition: 'novostavba' },
  { pattern: /\brekonštrukci[aáeu]\w*/gi, condition: 'rekonštrukcia' },
  { pattern: /\bpôvodn[ýáéíóúy]\w*\s*stav\w*/gi, condition: 'pôvodný stav' },
  { pattern: /\bvýstavb[aeě]\w*/gi, condition: 'vo výstavbe' },
  { pattern: /\bprojekt\w*/gi, condition: 'projekt' },
];

const SLOVAK_CITIES = [
  'bratislava', 'košice', 'prešov', 'žilina', 'nitra', 'banská bystrica',
  'trnava', 'martin', 'trenčín', 'poprad', 'prievidza', 'zvolen', 'považská bystrica',
  'nové zámky', 'michalovce', 'spišská nová ves', 'komárno', 'levice', 'humenné',
  'petržalka', 'karlova ves', 'ružinov', 'vrakuňa', 'podunajské biskupice',
  'nové mesto', 'staré mesto', 'devínska nová ves', 'lamač', 'dúbravka'
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function extractRoomCount(query: string): number | undefined {
  for (const pattern of ROOM_COUNT_PATTERNS) {
    if (pattern.type === 'numeric') {
      const match = pattern.pattern.exec(query);
      if (match && match[1]) {
        const rooms = parseInt(match[1]);
        if (rooms >= 1 && rooms <= 10) {
          return rooms;
        }
      }
      pattern.pattern.lastIndex = 0;
    } else if (pattern.rooms) {
      if (pattern.pattern.test(query)) {
        pattern.pattern.lastIndex = 0;
        return pattern.rooms;
      }
      pattern.pattern.lastIndex = 0;
    }
  }
  return undefined;
}

function extractPropertyType(query: string): string | undefined {
  for (const pattern of PROPERTY_TYPE_PATTERNS) {
    if (pattern.pattern.test(query)) {
      pattern.pattern.lastIndex = 0;
      return pattern.type;
    }
    pattern.pattern.lastIndex = 0;
  }
  return undefined;
}

function extractOfferType(query: string): string | undefined {
  for (const pattern of OFFER_TYPE_PATTERNS) {
    if (pattern.pattern.test(query)) {
      pattern.pattern.lastIndex = 0;
      return pattern.type;
    }
    pattern.pattern.lastIndex = 0;
  }
  return undefined;
}

function extractCondition(query: string): string | undefined {
  for (const pattern of CONDITION_PATTERNS) {
    if (pattern.pattern.test(query)) {
      pattern.pattern.lastIndex = 0;
      return pattern.condition;
    }
    pattern.pattern.lastIndex = 0;
  }
  return undefined;
}

function extractPriceRange(query: string): { min?: number; max?: number } {
  const priceRange: { min?: number; max?: number } = {};

  const maxPatterns = [
    /do\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi,
    /max\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi,
    /maximálne\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi,
  ];

  const minPatterns = [
    /od\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi,
    /min\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi,
    /minimálne\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi,
  ];

  const rangePattern = /(\d+)\s*(\d{3})?\s*[-až]\s*(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi;

  const rangeMatch = rangePattern.exec(query);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1] + (rangeMatch[2] || ''));
    const max = parseInt(rangeMatch[3] + (rangeMatch[4] || ''));
    if (min > 0) priceRange.min = min;
    if (max > 0) priceRange.max = max;
    return priceRange;
  }

  for (const pattern of maxPatterns) {
    const match = pattern.exec(query);
    if (match) {
      const price = parseInt(match[1] + (match[2] || ''));
      if (price > 0) {
        priceRange.max = price;
        break;
      }
    }
    pattern.lastIndex = 0;
  }

  for (const pattern of minPatterns) {
    const match = pattern.exec(query);
    if (match) {
      const price = parseInt(match[1] + (match[2] || ''));
      if (price > 0) {
        priceRange.min = price;
        break;
      }
    }
    pattern.lastIndex = 0;
  }

  return priceRange;
}

function extractLocation(query: string): string | undefined {
  const normalizedQuery = normalizeText(query);

  for (const city of SLOVAK_CITIES) {
    const normalizedCity = normalizeText(city);
    if (normalizedQuery.includes(normalizedCity)) {
      return city;
    }
  }

  const locationPattern = /\b(?:v|vo)\s+([a-záčďéěíľĺňóôŕřšťúůýž\s]+?)(?:\s+(?:do|od|za|s|so|pri|nad|pod)|$)/gi;
  const match = locationPattern.exec(query);
  if (match && match[1]) {
    const location = match[1].trim();
    if (location.length >= 3 && !SLOVAK_STOP_WORDS.includes(location.toLowerCase())) {
      return location;
    }
  }

  return undefined;
}

function determineCategory(filters: ParsedSearchQuery['filters']): string | undefined {
  if (filters.propertyType) {
    return 'reality';
  }
  return undefined;
}

function cleanQueryForSearch(query: string, filters: ParsedSearchQuery['filters']): string {
  let cleaned = query;

  cleaned = cleaned.replace(/(\d+)\s*[-\s]?\s*izbov[ýáéíóúyě]\w*/gi, '');
  cleaned = cleaned.replace(/garsónk[aáu]\w*/gi, '');
  cleaned = cleaned.replace(/dvojgarsónk[aáu]\w*/gi, '');

  cleaned = cleaned.replace(/\b(jednoizbov|dvojizbov|trojizbov|štvoriizbov|päťizbov)[ýáéíóúy]\w*/gi, '');

  cleaned = cleaned.replace(/do\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi, '');
  cleaned = cleaned.replace(/od\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi, '');
  cleaned = cleaned.replace(/(\d+)\s*(\d{3})?\s*[-až]\s*(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi, '');
  cleaned = cleaned.replace(/max\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi, '');
  cleaned = cleaned.replace(/min\s+(\d+)\s*(\d{3})?\s*(?:eur|€)?/gi, '');

  cleaned = cleaned.replace(/\b(predaj|prenájom|kúpa|výmena)\w*/gi, '');
  cleaned = cleaned.replace(/\b(novostavb|rekonštrukci|pôvodn|výstavb|projekt)\w*/gi, '');

  cleaned = cleaned.replace(/\b(?:v|vo|na|z|zo|od|do|pri|nad|pod)\s+/gi, ' ');

  cleaned = cleaned.replace(/[,\.;:!?]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();

  return cleaned;
}

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const originalQuery = query;
  const lowerQuery = query.toLowerCase();

  const filters: ParsedSearchQuery['filters'] = {};

  const roomCount = extractRoomCount(lowerQuery);
  if (roomCount !== undefined) {
    filters.roomCount = roomCount;
  }

  const propertyType = extractPropertyType(lowerQuery);
  if (propertyType) {
    filters.propertyType = propertyType;
  }

  const offerType = extractOfferType(lowerQuery);
  if (offerType) {
    filters.offerType = offerType;
  }

  const condition = extractCondition(lowerQuery);
  if (condition) {
    filters.condition = condition;
  }

  const priceRange = extractPriceRange(lowerQuery);
  if (priceRange.min !== undefined) {
    filters.priceMin = priceRange.min;
  }
  if (priceRange.max !== undefined) {
    filters.priceMax = priceRange.max;
  }

  const location = extractLocation(lowerQuery);
  if (location) {
    filters.location = location;
  }

  const category = determineCategory(filters);
  if (category) {
    filters.category = category;
  }

  const cleanQuery = cleanQueryForSearch(query, filters);

  const searchTerms = cleanQuery
    .split(/\s+/)
    .filter(term => term.length > 2 && !SLOVAK_STOP_WORDS.includes(term.toLowerCase()))
    .map(term => normalizeText(term));

  const extractedFilterCount = Object.keys(filters).length;
  const confidence = Math.min(extractedFilterCount * 0.2 + 0.3, 1.0);

  return {
    originalQuery,
    cleanQuery,
    filters,
    searchTerms,
    confidence,
  };
}

export function buildSearchExplanation(parsed: ParsedSearchQuery): string {
  const parts: string[] = [];

  if (parsed.filters.roomCount) {
    parts.push(`${parsed.filters.roomCount}-izbový`);
  }

  if (parsed.filters.propertyType) {
    parts.push(parsed.filters.propertyType);
  }

  if (parsed.filters.location) {
    parts.push(`v ${parsed.filters.location}`);
  }

  if (parsed.filters.priceMin && parsed.filters.priceMax) {
    parts.push(`cena ${parsed.filters.priceMin}€ - ${parsed.filters.priceMax}€`);
  } else if (parsed.filters.priceMax) {
    parts.push(`do ${parsed.filters.priceMax}€`);
  } else if (parsed.filters.priceMin) {
    parts.push(`od ${parsed.filters.priceMin}€`);
  }

  if (parsed.filters.condition) {
    parts.push(parsed.filters.condition);
  }

  if (parsed.filters.offerType) {
    parts.push(parsed.filters.offerType);
  }

  if (parts.length === 0) {
    return `Hľadám: "${parsed.originalQuery}"`;
  }

  return `Hľadám: ${parts.join(', ')}`;
}
