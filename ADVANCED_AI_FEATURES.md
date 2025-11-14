# Advanced AI Features Documentation - Kupado.sk

## 🚀 Nové Pokročilé AI Funkcie

Platforma bola rozšírená o ďalších 6 pokročilých AI funkcií, ktoré posúvajú používateľský zážitok na úplne novú úroveň.

---

## 1. 🤖 AI Chat Asistent

### Prehľad
Floating chat widget s konverzačným AI, ktorý je k dispozícii na všetkých stránkach.

### Funkcie
- **Multi-turn konverzácie** - zachováva kontext celej konverzácie
- **4 kontextové režimy:**
  - `general` - všeobecná pomoc
  - `ad_help` - pomoc pri vytváraní inzerátov
  - `buying_guide` - poradenstvo pri nákupe
  - `support` - technická podpora
- **Minimalizovateľný widget** - nezasahuje do prezerania
- **História konverzácií** - ukladá do databázy
- **Real-time odpovede** - okamžitá AI reakcia

### UI Komponent
`<AIChatAssistant contextType="general" />`

### API Endpoint
`POST /api/ai/chat`

```typescript
Body: {
  message: "Ako vytvoriť dobrý inzerát?",
  conversationId: "uuid-or-null",
  userId: "user-id",
  contextType: "ad_help"
}

Response: {
  response: "AI odpoveď...",
  conversationId: "uuid",
  timestamp: "ISO-date"
}
```

### Použitie
Chat asistent je automaticky pridaný na homepage a je dostupný všetkým prihláseným používateľom. Zobrazuje sa ako floating button v pravom dolnom rohu.

---

## 2. 📸 Image Analysis (AI Analýza Fotografií)

### Prehľad
AI vyhodnocuje kvalitu produktových fotografií a navrhuje zlepšenia.

### Funkcie
- **Kvalitné skóre (0-100)** - celkové hodnotenie fotky
- **Detailný rozpis:**
  - Rozlíšenie a ostrosť (0-100)
  - Osvetlenie (0-100)
  - Kompozícia (0-100)
- **Detekcia objektov** - čo je na fotografii
- **Návrhy na zlepšenie** - konkrétne tipy
- **Content moderation** - kontrola vhodnosti

### API Endpoint
`POST /api/ai/analyze-image`

```typescript
Body: {
  imageUrl: "https://...",
  adId: "uuid",
  userId: "user-id"
}

Response: {
  analysis: {
    qualityScore: 85,
    resolutionScore: 90,
    lightingScore: 75,
    compositionScore: 80,
    detectedObjects: ["mobil", "ruka", "stôl"],
    suggestedImprovements: [
      "Pridajte viac svetla",
      "Zamerajte sa bližšie na produkt"
    ],
    isAppropriate: true
  }
}
```

### Použitie v UI
```typescript
// Pri uploade obrázkov
const analyzeImage = async (imageUrl) => {
  const response = await fetch('/api/ai/analyze-image', {
    method: 'POST',
    body: JSON.stringify({ imageUrl, adId, userId })
  });
  const { analysis } = await response.json();

  if (analysis.qualityScore < 50) {
    alert('Fotografia má nízku kvalitu. Skúste pridať lepšiu.');
  }
};
```

---

## 3. 🛡️ Fraud Detection (Detekcia Podvodov)

### Prehľad
AI automaticky skenuje inzeráty na podozrivé vzory a potenciálne podvody.

### Funkcie
- **Risk Score (0-100)** - rizikové skóre
- **Risk Levels:**
  - `low` - nízke riziko
  - `medium` - stredné riziko
  - `high` - vysoké riziko (flagged)
  - `critical` - kritické riziko (okamžité flagovanie)
- **Detekcia vzorov** - identifikuje podozrivé vzory
- **Suspicious indicators** - konkrétne podozrivé znaky
- **Admin review queue** - fronty na manuálnu kontrolu

### Čo AI sleduje
- Nerealisticky nízke ceny
- Zlá gramatika alebo preklepy
- Chybajúce detaily
- Požiadavky na platbu mimo platformy
- Podozrivé kontaktné údaje
- Nesúlad medzi opisom a fotografiami
- Urgentné požiadavky na okamžitú akciu

### API Endpoint
`POST /api/ai/detect-fraud`

```typescript
Body: {
  adData: {
    title: "...",
    description: "...",
    price: 1200,
    images: [...],
    ...
  },
  adId: "uuid"
}

Response: {
  analysis: {
    riskScore: 75,
    riskLevel: "high",
    detectedPatterns: [
      "Nízka cena vzhľadom na trhové hodnoty",
      "Chýbajúce kontaktné údaje"
    ],
    suspiciousIndicators: [
      "Požiadavka na platbu mimo platformy",
      "Urgentný jazyk"
    ],
    reasoning: "Inzerát vykazuje viacero znakov...",
    recommendations: [
      "Overte totožnosť predajcu",
      "Požadujte video verifikáciu"
    ]
  }
}
```

### Automatické Flagovanie
Inzeráty s `high` alebo `critical` risk level sú automaticky flagované a čakajú na admin review.

### Admin Interface
Admini môžu v dashboarde vidieť všetky flagované inzeráty a rozhodnúť o schválení/zamietnutí.

---

## 4. 🏷️ Auto-Tagging (Automatické Tagov anie)

### Prehľad
AI automaticky generuje relevantné tagy a kľúčové slová pre lepšie SEO a vyhľadávanie.

### Funkcie
- **5-10 hlavných tagov** - výstižné označenia produktu
- **5-8 kategóriových keywords** - špecifické pre kategóriu
- **10-15 search keywords** - optimalizované pre vyhľadávanie
- **Confidence scores** - dôveryhodnosť každého tagu (0-1)
- **Bez diakritiky** - lepšie pre SEO
- **Synonymá** - alternatívne názvy

### API Endpoint
`POST /api/ai/generate-tags`

```typescript
Body: {
  adData: {
    title: "iPhone 15 Pro Max 256GB",
    description: "Nový Apple iPhone...",
    category: "mobily",
    price: 1200
  },
  adId: "uuid",
  userId: "user-id"
}

Response: {
  tags: {
    tags: [
      "iphone",
      "apple",
      "smartphone",
      "ios",
      "256gb"
    ],
    categoryKeywords: [
      "mobil",
      "telefon",
      "smartfon",
      "mobilny telefon"
    ],
    searchKeywords: [
      "iphone 15",
      "apple mobil",
      "novy iphone",
      "smartfon apple",
      "ios telefon",
      "256gb telefon"
    ],
    confidenceScores: {
      "iphone": 0.98,
      "apple": 0.95,
      "smartphone": 0.90
    }
  }
}
```

### Použitie
Tagy sa automaticky generujú pri vytvorení inzerátu a používajú sa na zlepšenie vyhľadávania.

---

## 5. 🔍 Semantic Search (Sémantické Vyhľadávanie)

### Prehľad
Pokročilé vyhľadávanie s natural language processing - používateľ môže vyhľadávať prirodzeným jazykom.

### Funkcie
- **Natural language queries** - "červené auto do 10000 eur bratislava"
- **Automatická extrakcia filtrov:**
  - Kategória
  - Cenové rozpätie
  - Lokalita
  - Stav
  - Značka/Model
- **Synonymá** - rozpoznáva "mobil" = "telefón"
- **Sémantické rozšírenie** - príbuzné koncepty
- **Intent detection** - buy/sell/compare/research
- **Query suggestions** - alternatívne hľadania

### API Endpoint
`POST /api/ai/semantic-search`

```typescript
Body: {
  query: "lacny iphone do 500 eur bratislava",
  userId: "user-id"
}

Response: {
  analysis: {
    processedQuery: "iphone",
    extractedFilters: {
      category: "mobily",
      priceMax: 500,
      location: "bratislava",
      brand: "apple"
    },
    suggestedTerms: [
      "iphone",
      "apple telefon",
      "ios mobil"
    ],
    semanticExpansion: [
      "smartphone apple",
      "mobilny telefon ios",
      "apple device"
    ],
    intent: "buy"
  },
  results: [...ads matching query...],
  generationTime: 1500
}
```

### Príklady spracovania
- "červené auto do 10000" → farba: červená, typ: auto, cena max: 10000
- "predaj mobil samsung" → intent: sell, kategória: mobily, značka: samsung
- "lacny iphone" → značka: apple, model: iphone, cenový filter: pod priemer

### Implementácia do Search
```typescript
// V SearchWithSuggestions komponente
const handleSemanticSearch = async (query) => {
  const response = await fetch('/api/ai/semantic-search', {
    method: 'POST',
    body: JSON.stringify({ query, userId })
  });

  const { analysis, results } = await response.json();

  // Aplikuj extrahované filtre
  applyFilters(analysis.extractedFilters);

  // Zobraz výsledky
  setResults(results);

  // Zobraz suggestions
  setSuggestions(analysis.suggestedTerms);
};
```

---

## 6. ⭐ Personalized Recommendations (Personalizované Odporúčania)

### Prehľad
AI generuje personalizované odporúčania produktov na základe správania používateľa.

### Funkcie
- **5 typov odporúčaní:**
  - `similar_viewed` - podobné ako ste videli
  - `similar_favorited` - podobné ako máte v obľúbených
  - `price_match` - vo vašom cenovom rozpätí
  - `category_interest` - z kategórií čo vás zaujímajú
  - `collaborative` - collaborative filtering
- **Match score (0-1)** - % zhody s preferenciami
- **Reasoning** - vysvetlenie prečo odporúčané
- **Click tracking** - sledovanie interakcií
- **Auto-refresh** - automatické obnovenie (7 dní)

### API Endpoint
`GET /api/ai/recommendations?userId={id}&limit={count}`

```typescript
Response: {
  recommendations: [
    {
      id: "rec-uuid",
      recommended_ad_id: "ad-uuid",
      recommendation_type: "category_interest",
      score: 0.85,
      reasoning: "Based on your favorite categories",
      ads: {
        id: "ad-uuid",
        title: "iPhone 15 Pro",
        price: 1200,
        location: "Bratislava",
        images: [...]
      }
    }
  ],
  cached: false
}
```

### UI Komponent
`<AIRecommendations />`

Zobrazuje sa automaticky na homepage pre prihlásených používateľov.

### Algoritmus
1. Analyzuje obľúbené kategórie používateľa
2. Sleduje históriu prezeraných inzerátov
3. Vyhodnocuje search queries
4. Zohľadňuje cenové preferencie
5. Collaborative filtering s podobnými používateľmi

---

## 📊 Nové Databázové Tabuľky

### ai_chat_conversations
```sql
- id: UUID
- user_id: relácia na používateľa
- conversation_data: JSONB pole správ
- context_type: typ kontextu (general/ad_help/...)
- last_message_at: timestamp
- created_at: timestamp
```

### ai_image_analysis
```sql
- id: UUID
- ad_id: relácia na inzerát
- image_url: URL obrázka
- quality_score: celkové skóre (0-100)
- resolution_score: rozlíšenie (0-100)
- lighting_score: svetlo (0-100)
- composition_score: kompozícia (0-100)
- detected_objects: JSONB pole objektov
- suggested_improvements: JSONB pole návrhov
- is_appropriate: boolean
- analyzed_at: timestamp
```

### ai_recommendations
```sql
- id: UUID
- user_id: relácia na používateľa
- recommended_ad_id: relácia na inzerát
- recommendation_type: typ odporúčania
- score: decimal (0-1)
- reasoning: text
- user_interacted: boolean
- created_at: timestamp
- expires_at: timestamp (7 dní)
```

### ai_fraud_detection
```sql
- id: UUID
- ad_id: relácia na inzerát (UNIQUE)
- risk_score: skóre (0-100)
- risk_level: low/medium/high/critical
- detected_patterns: JSONB pole vzorov
- suspicious_indicators: JSONB pole indikátorov
- flagged_for_review: boolean
- reviewed_by: relácia na admina
- review_status: pending/approved/rejected/flagged
- review_notes: text
- analyzed_at: timestamp
- reviewed_at: timestamp
```

### ai_auto_tags
```sql
- id: UUID
- ad_id: relácia na inzerát
- generated_tags: JSONB pole tagov
- category_keywords: JSONB pole keywords
- search_keywords: JSONB pole search terms
- confidence_scores: JSONB objekt skóre
- user_approved: boolean
- generated_at: timestamp
```

### ai_search_queries
```sql
- id: UUID
- user_id: relácia na používateľa
- original_query: text
- processed_query: text
- extracted_filters: JSONB objekt filtrov
- suggested_terms: JSONB pole termínov
- semantic_expansion: JSONB pole expansion
- results_count: integer
- user_clicked_result: boolean
- created_at: timestamp
```

---

## 🔧 Database Functions

### generate_user_recommendations()
Generuje personalizované odporúčania na základe user správania.

```sql
SELECT * FROM generate_user_recommendations('user-id', 10);
```

### calculate_fraud_risk_score()
Vypočíta risk score pre inzerát.

```sql
SELECT calculate_fraud_risk_score('ad-id');
```

### cleanup_expired_ai_data()
Čistí expirované AI dáta (konverzácie, odporúčania, queries).

```sql
SELECT cleanup_expired_ai_data();
```

---

## ⚙️ Integrácia do Existujúceho Kódu

### Homepage
```typescript
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { AIRecommendations } from '@/components/AIRecommendations';

// V komponente
<AIRecommendations />
<AIChatAssistant contextType="general" />
```

### Pridanie Inzerátu
```typescript
// Po vytvorení inzerátu
await fetch('/api/ai/generate-tags', {
  method: 'POST',
  body: JSON.stringify({ adData, adId, userId })
});

await fetch('/api/ai/detect-fraud', {
  method: 'POST',
  body: JSON.stringify({ adData, adId })
});
```

### Upload Fotografií
```typescript
// Po uploade každej fotky
await fetch('/api/ai/analyze-image', {
  method: 'POST',
  body: JSON.stringify({ imageUrl, adId, userId })
});
```

### Search Bar
```typescript
// Pri zadaní search query
const handleSearch = async (query) => {
  const response = await fetch('/api/ai/semantic-search', {
    method: 'POST',
    body: JSON.stringify({ query, userId })
  });
  const { analysis, results } = await response.json();
  // Použij analysis.extractedFilters
};
```

---

## 📈 Metriky a Analytics

### Sledované Metriky
- **Chat Usage** - počet konverzácií, priemerná dĺžka
- **Image Analysis** - priemerné quality score, top improvements
- **Fraud Detection** - počet flagovaných, false positive rate
- **Auto-tagging** - adoption rate, tag accuracy
- **Semantic Search** - query success rate, filter extraction accuracy
- **Recommendations** - click-through rate, conversion rate

### Admin Dashboard Rozšírenia
- Prehľad fraud detection s risk levels
- Top searched terms z semantic search
- Recommendation performance metrics
- Image analysis statistics
- Chat conversation insights

---

## 🚀 Performance Optimalizácie

### Caching Strategy
- **Recommendations:** 7 dní cache
- **Image analysis:** permanentné uloženie
- **Fraud detection:** permanentné uloženie
- **Auto-tags:** permanentné uloženie
- **Chat conversations:** 30 dní retention
- **Search queries:** 90 dní retention

### Background Jobs
- Automatický cleanup expirovaných dát
- Batch generation odporúčaní
- Fraud detection scanning

---

## 💰 Náklady

### Odhad pri Free Tier (1,500 req/deň)
- Chat: ~200 konverzácií/deň
- Image Analysis: ~300 analýz/deň
- Fraud Detection: ~500 skenov/deň
- Auto-tagging: ~300 generácií/deň
- Semantic Search: ~200 queries/deň

### Celkom: ~1,500 AI requestov denne = **ZADARMO**

### Pri väčšom trafficu
10,000 requestov mesačne = ~$5-10 mesačne

---

## ✅ Checklist

- [x] AI Chat Asistent implementovaný
- [x] Image Analysis vytvorená
- [x] Fraud Detection systém aktívny
- [x] Auto-tagging funkčný
- [x] Semantic Search implementovaný
- [x] Personalized Recommendations vytvorené
- [x] Databázové tabuľky a funkcie
- [x] UI komponenty integrované
- [x] API endpoints testované
- [x] Build úspešný

---

**Verzia:** 2.0.0
**Posledná aktualizácia:** November 2025
**Status:** ✅ Production Ready
