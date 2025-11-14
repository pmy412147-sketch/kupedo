import { NextRequest, NextResponse } from 'next/server';
import { chatWithHistory, ChatMessage } from '@/lib/claude';
import { supabase } from '@/lib/supabase';
import { parseSearchQuery, buildSearchExplanation } from '@/lib/search-parser';
import { performEnhancedSearch, generateSearchSuggestions } from '@/lib/search-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, userId, contextType = 'general' } = body;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'message and userId are required' },
        { status: 400 }
      );
    }

    let conversation: any = null;
    let chatHistory: ChatMessage[] = [];

    if (conversationId) {
      const { data } = await supabase
        .from('ai_chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        conversation = data;
        chatHistory = data.conversation_data || [];
      }
    }

    // Check if user is asking to search for something
    const searchIntent = detectSearchIntent(message);
    let searchResults = null;
    let searchExplanation = '';
    let parsedQuery = null;

    if (searchIntent.isSearch && searchIntent.query) {
      try {
        console.log('[AI Chat] Parsing search query:', searchIntent.query);

        parsedQuery = parseSearchQuery(searchIntent.query);
        console.log('[AI Chat] Parsed filters:', JSON.stringify(parsedQuery.filters));
        console.log('[AI Chat] Search terms:', parsedQuery.searchTerms);
        console.log('[AI Chat] Confidence:', parsedQuery.confidence);

        const searchResult = await performEnhancedSearch(supabase, parsedQuery, 20);
        searchResults = searchResult.ads;
        searchExplanation = searchResult.searchExplanation;

        console.log('[AI Chat] Search results:', searchResults.length, 'ads found');

        if (searchResults.length === 0) {
          const suggestions = generateSearchSuggestions(parsedQuery, 0);
          if (suggestions.length > 0) {
            searchExplanation += '\n\nTipy:\n' + suggestions.map(s => `• ${s}`).join('\n');
          } else {
            searchExplanation = buildNoResultsMessage(parsedQuery);
          }
        } else {
          const topAds = searchResults.slice(0, 3);
          const priceRange = {
            min: Math.min(...topAds.map(ad => ad.price)),
            max: Math.max(...topAds.map(ad => ad.price))
          };
          searchExplanation += `\n\nCenové rozpätie: ${priceRange.min.toLocaleString('sk-SK')}€ - ${priceRange.max.toLocaleString('sk-SK')}€`;
        }
      } catch (error) {
        console.error('[AI Chat] Error searching ads:', error);
        searchResults = [];
        searchExplanation = 'Vyskytla sa chyba pri vyhľadávaní. Prosím, skúste to znova alebo preformulujte váš dotaz.';
      }
    }

    const systemContext = getSystemContext(contextType, searchResults);

    const startTime = Date.now();
    let response: string;

    try {
      // If search results found, provide a detailed response
      if (searchResults && searchResults.length > 0) {
        let responseText = searchExplanation;

        if (parsedQuery) {
          const filterInfo = buildSearchExplanation(parsedQuery);
          responseText = `${filterInfo}\n\nPresmerujem ťa na výsledky...`;
        }

        response = responseText;
      } else if (searchIntent.isSearch && searchResults !== null && searchResults.length === 0) {
        response = searchExplanation || `Bohužiaľ, nenašiel som žiadne inzeráty pre "${searchIntent.query}". Skús to s inými kľúčovými slovami alebo širšou kategóriou.`;
      } else {
        response = await chatWithHistory(
          [
            { role: 'user', content: systemContext },
            { role: 'assistant', content: 'Rozumiem, som pripravený pomôcť.' },
            ...chatHistory,
          ],
          message
        );
      }
    } catch (apiError: any) {
      if (apiError.status === 429 || apiError.message?.includes('preťažená')) {
        return NextResponse.json(
          { error: 'AI je momentálne preťažená. Prosím skúste to o chvíľu.' },
          { status: 503 }
        );
      }
      throw apiError;
    }

    const endTime = Date.now();

    chatHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    );

    if (conversationId && conversation) {
      await supabase
        .from('ai_chat_conversations')
        .update({
          conversation_data: chatHistory,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    } else {
      const { data: newConversation } = await supabase
        .from('ai_chat_conversations')
        .insert({
          user_id: userId,
          conversation_data: chatHistory,
          context_type: contextType,
        })
        .select()
        .single();

      conversation = newConversation;
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      feature_type: 'chat_assistant',
      response_time_ms: endTime - startTime,
      success: true,
      metadata: { context_type: contextType },
    });

    return NextResponse.json({
      response,
      conversationId: conversation?.id,
      timestamp: new Date().toISOString(),
      searchResults: searchResults && searchResults.length > 0 ? searchResults : null,
      searchQuery: searchIntent.isSearch ? searchIntent.query : null,
      shouldRedirect: searchIntent.isSearch && searchResults && searchResults.length > 0,
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

function detectSearchIntent(message: string): { isSearch: boolean; query: string | null } {
  const searchKeywords = [
    'hľadám', 'hladam', 'nájdi', 'najdi', 'ukáž', 'ukaz', 'chcem', 'potrebujem',
    'kúpiť', 'kupit', 'predať', 'predat', 'mám záujem', 'zaujíma ma', 'hľadaj', 'hladaj',
    'ponúkni', 'ponukni', 'ukažte', 'ukazte', 'máš', 'mas', 'nájdeš', 'najdes'
  ];

  const lowerMessage = message.toLowerCase();
  const hasSearchIntent = searchKeywords.some(keyword => lowerMessage.includes(keyword));

  const hasProductKeywords = /\b(byt|dom|auto|mobil|bicykel|noteboook|telefón|telefon|laptop|pc|chata|pozemok|garáž|garaz)\w*/i.test(message);

  if (!hasSearchIntent && !hasProductKeywords) {
    return { isSearch: false, query: null };
  }

  console.log('[DetectSearchIntent] Search intent detected in:', message);

  let cleanQuery = message
    .replace(/^(ahoj|dobr[ýú] de[ňn]|zdravím|čau|nazdar|dobrý večer|dobré ráno|dobré popoludnie|hej|čaute|čaves)[,\s!]*/gi, '')
    .replace(/\b(hľadám|hladam|nájdi|najdi|ukáž|ukaz|chcem|potrebujem|kúpiť|kupit|predať|predat|hľadaj|hladaj|ponúkni|ponukni|ukažte|ukazte|máš|mas|nájdeš|najdes)\b/gi, '')
    .replace(/\b(mi|ma|ti|ta|si|sa|me)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  console.log('[DetectSearchIntent] Cleaned query:', cleanQuery);

  if (!cleanQuery || cleanQuery.length < 3) {
    const hasNumbers = /\d{3,}/.test(message);
    const hasLocation = /bratislava|košice|prešov|žilina|nitra|banská bystrica|trnava/i.test(message);

    if (hasProductKeywords || hasNumbers || hasLocation) {
      cleanQuery = message
        .replace(/^(ahoj|dobr[ýú] de[ňn]|zdravím|čau|nazdar|dobrý večer)[,\s]*/gi, '')
        .replace(/\b(mi|ma|ti|ta|si|sa|me)\b/gi, '')
        .trim();
      console.log('[DetectSearchIntent] Using fallback cleaned query:', cleanQuery);
    }
  }

  return {
    isSearch: hasSearchIntent || hasProductKeywords,
    query: cleanQuery || null
  };
}

function buildNoResultsMessage(parsedQuery: any): string {
  const filters = parsedQuery.filters;
  const messages = [];

  messages.push('Nenašiel som žiadne inzeráty, ktoré by presne zodpovedali vašim kritériám.');

  if (filters.roomCount && filters.priceMax && filters.location) {
    messages.push('\nSkúste:');
    messages.push(`• Zvýšiť maximálnu cenu nad ${filters.priceMax.toLocaleString('sk-SK')}€`);
    messages.push(`• Rozšíriť vyhľadávanie na okolie lokality ${filters.location}`);
    messages.push(`• Hľadať aj ${filters.roomCount - 1}-izbové alebo ${filters.roomCount + 1}-izbové byty`);
  } else if (filters.priceMax) {
    messages.push(`\nSkúste zvýšiť maximálnu cenu alebo vyhľadajte s širšími kritériami.`);
  } else if (filters.location) {
    messages.push(`\nSkúste rozšíriť vyhľadávanie na celú Bratislavu alebo okolie.`);
  } else {
    messages.push('\nSkúste upraviť vaše kritériá alebo použite všeobecnejšie hľadanie.');
  }

  return messages.join('\n');
}

function getSystemContext(contextType: string, searchResults?: any[] | null): string {
  const baseContexts: Record<string, string> = {
    general: `Si užitočný AI asistent pre slovenský online marketplace Kupado.sk.
Pomáhaš používateľom s:
- Nákupom a predajom produktov
- Navigáciou platformy
- Tipmi na lepšie inzeráty
- Všeobecnými otázkami
${searchResults ? '\nKeď používateľ hľadá produkty, informujem ho že som našiel relevantné inzeráty a zobrazia sa pod mojou odpoveďou.' : ''}
Odpovedaj vždy v slovenčine, buď priateľský a nápomocný.`,

    ad_help: `Si AI expert na vytváranie inzerátov pre Kupado.sk.
Pomáhaš používateľom:
- Napísať lepšie popisy
- Vybrať správnu kategóriu
- Nastaviť optimálnu cenu
- Vytvoriť atraktívne nadpisy
Dávaj konkrétne a praktické rady.`,

    buying_guide: `Si AI nákupný poradca pre Kupado.sk.
Pomáhaš kupujúcim:
- Vybrať správny produkt
- Porovnať rôzne možnosti
- Identifikovať podozrivé inzeráty
- Radiť pri vyjednávaní ceny
${searchResults ? '\nKeď používateľ hľadá produkty, informujem ho že som našiel relevantné inzeráty a zobrazia sa pod mojou odpoveďou.' : ''}
Buď objektívny a ochranný voči zákazníkom.`,

    support: `Si AI support agent pre Kupado.sk.
Pomáhaš s:
- Technickými problémami
- Otázkami ohľadom funkcií
- Riešením problémov s inzerátmi
- Vysvetlením pravidiel platformy
Buď trpezlivý a poskytuj jasné inštruktie.`,
  };

  return baseContexts[contextType] || baseContexts.general;
}
