import { NextRequest, NextResponse } from 'next/server';
import { chatWithHistory, ChatMessage } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

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

    const systemContext = getSystemContext(contextType);

    const startTime = Date.now();
    let response: string;

    try {
      response = await chatWithHistory(
        [
          { role: 'user', parts: systemContext },
          { role: 'model', parts: 'Rozumiem, som pripravený pomôcť.' },
          ...chatHistory,
        ],
        message
      );
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
      { role: 'user', parts: message },
      { role: 'model', parts: response }
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
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

function getSystemContext(contextType: string): string {
  const contexts: Record<string, string> = {
    general: `Si užitočný AI asistent pre slovenský online marketplace Kupado.sk.
Pomáhaš používateľom s:
- Nákupom a predajom produktov
- Navigáciou platformy
- Tipmi na lepšie inzeráty
- Všeobecnými otázkami
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
Buď objektívny a ochranný voči zákazníkom.`,

    support: `Si AI support agent pre Kupado.sk.
Pomáhaš s:
- Technickými problémami
- Otázkami ohľadom funkcií
- Riešením problémov s inzerátmi
- Vysvetlením pravidiel platformy
Buď trpezlivý a poskytuj jasné inštruktie.`,
  };

  return contexts[contextType] || contexts.general;
}
