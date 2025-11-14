import Anthropic from '@anthropic-ai/sdk';

function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY or NEXT_PUBLIC_ANTHROPIC_API_KEY is not set in environment variables');
  }

  return apiKey;
}

let anthropicInstance: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    anthropicInstance = new Anthropic({
      apiKey: getApiKey(),
    });
  }
  return anthropicInstance;
}

export interface ClaudeConfig {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

const defaultConfig: ClaudeConfig = {
  temperature: 0.7,
  max_tokens: 1024,
  top_p: 0.9,
};

export async function generateText(prompt: string, config?: ClaudeConfig): Promise<string> {
  try {
    const anthropic = getAnthropic();
    const mergedConfig = { ...defaultConfig, ...config };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: mergedConfig.max_tokens || 1024,
      temperature: mergedConfig.temperature,
      top_p: mergedConfig.top_p,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes('rate_limit')) {
      throw new Error('AI je momentálne preťažená. Prosím skúste to o chvíľu.');
    }

    console.error('Error generating text with Claude:', error);
    throw error;
  }
}

export async function generateTextWithRetry(
  prompt: string,
  maxRetries: number = 1,
  config?: ClaudeConfig
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateText(prompt, config);
    } catch (error: any) {
      lastError = error as Error;

      if (error.message?.includes('preťažená') || error.status === 429) {
        throw new Error('AI je momentálne preťažená. Prosím skúste to o chvíľu.');
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Nepodarilo sa vygenerovať text. Skúste to prosím neskôr.');
}

export async function generateStructuredOutput<T>(
  prompt: string,
  schema: string,
  config?: ClaudeConfig
): Promise<T> {
  const fullPrompt = `${prompt}\n\nPlease respond with valid JSON that matches this schema:\n${schema}`;

  try {
    const text = await generateTextWithRetry(fullPrompt, 1, config);
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error('Error generating structured output:', error);
    throw error;
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithHistory(
  messages: ChatMessage[],
  newMessage: string,
  config?: ClaudeConfig
): Promise<string> {
  try {
    const anthropic = getAnthropic();
    const mergedConfig = { ...defaultConfig, ...config };

    const allMessages = [
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: newMessage,
      },
    ];

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: mergedConfig.max_tokens || 1024,
      temperature: mergedConfig.temperature,
      top_p: mergedConfig.top_p,
      messages: allMessages,
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    console.error('Error in chat with history:', error);
    throw error;
  }
}

export async function analyzeImage(
  imageData: string,
  prompt: string,
  config?: ClaudeConfig
): Promise<string> {
  try {
    const anthropic = getAnthropic();
    const mergedConfig = { ...defaultConfig, ...config };

    // Determine if imageData is a URL or base64
    let imageSource: any;

    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      // It's a URL
      imageSource = {
        type: 'image',
        source: {
          type: 'url',
          url: imageData,
        },
      };
    } else {
      // It's base64 data
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const mediaType = imageData.match(/^data:image\/(\w+);base64,/)?.[1] || 'jpeg';

      imageSource = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: `image/${mediaType}`,
          data: base64Data,
        },
      };
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: mergedConfig.max_tokens || 1024,
      temperature: mergedConfig.temperature,
      top_p: mergedConfig.top_p,
      messages: [
        {
          role: 'user',
          content: [
            imageSource,
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    console.error('Error analyzing image with Claude:', error);
    throw error;
  }
}

export const claudePrompts = {
  generateAdDescription: (productInfo: any) => `
Napíš profesionálny, presvedčivý a detailný popis inzerátu pre slovenský online marketplace v slovenčine.

Informácie o produkte:
${JSON.stringify(productInfo, null, 2)}

Štruktúra popisu:
1. Úvodná veta - zaujmi kupujúceho, zvýrazni hlavné prednosti
2. Technické parametre a špecifikácie - vypíš detailne všetky vlastnosti
3. Stav produktu - buď konkrétny a úprimný
4. Dôvod predaja (ak nie je uvedený, vynechaj)
5. Čo je v balení / čo získa kupujúci
6. Informácie o prevzatí a dodaní
7. Výzva k akcii - motivuj ku kontaktu

Požiadavky:
- Popis by mal mať 150-350 slov
- Používaj profesionálnu slovenčinu
- Buď konkrétny a objektívny
- Zvýrazni výhody a hodnotu pre kupujúceho
- Uveď všetky dôležité technické detaily
- Zakončí priateľskou výzvou k akcii
- Nepoužívaj emojis

Príklad kvalitného začiatku:
"Predám iPhone 15 Pro v titanovovej farbe s kapacitou 256GB v stave ako nový. Telefón bol používaný len 3 mesiace, vždy s ochranným krytom a temperovaným sklom..."

Vráť len samotný popis, bez nadpisov alebo dodatočných poznámok.
`,

  generateAdTitle: (productInfo: any) => `
Vytvor atraktívne a pútavé nadpisy pre inzerát v slovenčine.

Informácie o produkte:
${JSON.stringify(productInfo, null, 2)}

Požiadavky:
- Maximálne 80 znakov
- Zahrň značku, model a kľúčovú vlastnosť alebo stav
- Buď konkrétny a výstižný
- Používaj profesionálnu slovenčinu
- Vytvor 3 rôzne varianty (kratší, stredný, dlhší)

Príklady dobrých nadpisov:
- "iPhone 15 Pro 256GB Titán - Ako nový, záruka"
- "BMW X5 3.0d xDrive - Full výbava, TOP stav"
- "Apple MacBook Pro M3 - 16GB RAM, 512GB SSD"

Vráť vo formáte JSON:
{
  "titles": ["nadpis1", "nadpis2", "nadpis3"]
}
`,

  evaluateAdQuality: (adData: any) => `
Vyhodnoť kvalitu inzerátu na stupnici 0-100 bodov.

Dáta inzerátu:
${JSON.stringify(adData, null, 2)}

Hodnoť nasledovné kritériá:
1. Kvalita popisu (0-30 bodov) - gramatika, dĺžka, úplnosť
2. Kvalita fotografií (0-25 bodov) - počet, prítomnosť obrázkov
3. Vyplnené špecifikácie (0-25 bodov) - kompletnosť technických údajov
4. Cenová konkurencieschopnosť (0-20 bodov) - primeranosť ceny

Vráť vo formáte JSON:
{
  "totalScore": 85,
  "breakdown": {
    "description": 25,
    "photos": 20,
    "specifications": 22,
    "pricing": 18
  },
  "suggestions": ["návrh1", "návrh2", "návrh3"],
  "strengths": ["silná stránka1", "silná stránka2"],
  "weaknesses": ["slabá stránka1", "slabá stránka2"]
}
`,

  compareProducts: (products: any[]) => `
Porovnaj nasledujúce produkty a vytvor detailnú analýzu v slovenčine.

Produkty:
${JSON.stringify(products, null, 2)}

Vytvor komplexné porovnanie, ktoré zahŕňa:
1. Hlavné rozdiely v špecifikáciách
2. Porovnanie pomer cena/výkon
3. Stav a história použitia
4. Odporúčanie ktorý produkt je najlepší a prečo
5. Pre koho je každý produkt vhodný

Vráť vo formáte JSON:
{
  "summary": "krátke zhrnutie porovnania",
  "comparison": {
    "specifications": "porovnanie špecifikácií",
    "priceValue": "analýza pomeru ceny a hodnoty",
    "condition": "porovnanie stavu"
  },
  "recommendation": {
    "bestChoice": "index produktu (0, 1, 2...)",
    "reasoning": "dôvod odporúčania"
  },
  "suitability": [
    {"productIndex": 0, "suitableFor": "pre koho je vhodný"},
    {"productIndex": 1, "suitableFor": "pre koho je vhodný"}
  ]
}
`,

  suggestAlternatives: (product: any, category: string) => `
Na základe tohto produktu navrhni 3-5 alternatívnych produktov v slovenčine.

Produkt:
${JSON.stringify(product, null, 2)}

Kategória: ${category}

Navrhni podobné produkty od iných značiek alebo modelov, ktoré by mohli kupujúceho zaujímať.
Pre každý alternatívny návrh uveď:
- Značku a model
- Hlavné rozdiely oproti pôvodnému produktu
- Prečo by mohol byť zaujímavý
- Približné cenové rozmedzie

Vráť vo formáte JSON:
{
  "alternatives": [
    {
      "brand": "značka",
      "model": "model",
      "differences": "hlavné rozdiely",
      "why": "prečo je zaujímavý",
      "priceRange": "cenové rozmedzie"
    }
  ]
}
`,

  recommendPrice: (productInfo: any, similarProducts: any[]) => `
Odporuč optimálnu cenu pre tento produkt v slovenčine.

Produkt:
${JSON.stringify(productInfo, null, 2)}

Podobné produkty na trhu:
${JSON.stringify(similarProducts, null, 2)}

Analyzuj:
1. Ceny podobných produktov
2. Stav a vek produktu
3. Trhové trendy
4. Optimálnu cenu pre rýchly predaj

Vráť vo formáte JSON:
{
  "recommendedPrice": 1250,
  "priceRange": {
    "min": 1000,
    "max": 1500
  },
  "marketAnalysis": "analýza trhu",
  "reasoning": "odôvodnenie odporúčanej ceny",
  "competitiveness": "nízka/stredná/vysoká"
}
`,
};
