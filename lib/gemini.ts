import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface GeminiConfig {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

const defaultConfig: GeminiConfig = {
  temperature: 0.7,
  maxOutputTokens: 2048,
  topP: 0.95,
  topK: 40,
};

export function getGeminiModel(modelName: string = 'gemini-2.0-flash-exp', config: GeminiConfig = {}): GenerativeModel {
  const mergedConfig = { ...defaultConfig, ...config };

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: mergedConfig,
  });
}

export async function generateText(prompt: string, config?: GeminiConfig): Promise<string> {
  try {
    const model = getGeminiModel('gemini-2.0-flash-exp', config);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw error;
  }
}

export async function generateTextWithRetry(
  prompt: string,
  maxRetries: number = 3,
  config?: GeminiConfig
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateText(prompt, config);
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to generate text after retries');
}

export async function generateStructuredOutput<T>(
  prompt: string,
  schema: string,
  config?: GeminiConfig
): Promise<T> {
  const fullPrompt = `${prompt}\n\nPlease respond with valid JSON that matches this schema:\n${schema}`;

  try {
    const text = await generateTextWithRetry(fullPrompt, 3, config);
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
  role: 'user' | 'model';
  parts: string;
}

export async function chatWithHistory(
  messages: ChatMessage[],
  newMessage: string,
  config?: GeminiConfig
): Promise<string> {
  try {
    const model = getGeminiModel('gemini-2.0-flash-exp', config);

    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    });

    const result = await chat.sendMessage(newMessage);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error in chat with history:', error);
    throw error;
  }
}

export const geminiPrompts = {
  generateAdDescription: (productInfo: any) => `
Napíš profesionálny a presvedčivý popis inzerátu pre slovenský online marketplace v slovenčine.

Informácie o produkte:
${JSON.stringify(productInfo, null, 2)}

Požiadavky:
- Popis by mal mať 100-300 slov
- Zvýrazni kľúčové vlastnosti a výhody
- Buď konkrétny a objektívny
- Používaj slovenčinu
- Zakončí výzvou k akcii
- Nepoužívaj emojis

Vráť len samotný popis, bez nadpisov alebo dodatočných poznámok.
`,

  generateAdTitle: (productInfo: any) => `
Vytvor catchy a SEO optimalizovaný nadpis pre inzerát v slovenčine.

Informácie o produkte:
${JSON.stringify(productInfo, null, 2)}

Požiadavky:
- Maximálne 50 znakov
- Zahrň značku a model
- Buď konkrétny
- Používaj slovenčinu
- Vytvor 3 varianty

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
