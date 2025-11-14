# AI Features Documentation - Kupado.sk

## Prehľad

Vaša platforma je teraz vybavená kompletným súborom AI funkcií využívajúcich Google Gemini API. Tieto funkcie transformujú používateľský zážitok a poskytujú inteligentné nástroje pre predajcov aj kupujúcich.

---

## 🚀 Implementované AI Funkcie

### 1. AI Asistent na Vytváranie Inzerátov

**Umiestnenie:** `/pridat-inzerat` - tlačidlo "Pomôcť s AI"

**Funkcie:**
- Automatické generovanie profesionálnych popisov produktov
- Vytvorenie 3 variantov nadpisov optimalizovaných pre SEO
- Wizard interface s 3 krokmi
- Úprava vygenerovaného textu pred použitím

**API Endpoint:** `/api/ai/generate-description`, `/api/ai/generate-title`

**Použitie:**
```typescript
// Generovanie popisu
POST /api/ai/generate-description
Body: {
  productInfo: {
    productName: "iPhone 15 Pro",
    brand: "Apple",
    condition: "new",
    keyFeatures: "256GB, titanium",
    ...
  },
  userId: "user-id"
}

// Odpoveď
{
  description: "Profesionálny popis...",
  generationTime: 2500
}
```

---

### 2. Hodnotenie Kvality Inzerátu

**Funkcie:**
- AI vyhodnotenie kvality na škále 0-100 bodov
- Detailný rozpis podľa kategórií:
  - Popis (max 30 bodov)
  - Fotografie (max 25 bodov)
  - Špecifikácie (max 25 bodov)
  - Cena (max 20 bodov)
- Konkrétne návrhy na zlepšenie
- Zvýraznenie silných a slabých stránok

**API Endpoint:** `/api/ai/evaluate-quality`

**Použitie:**
```typescript
POST /api/ai/evaluate-quality
Body: {
  adData: {
    title: "...",
    description: "...",
    images: [...],
    price: 1200,
    ...
  },
  userId: "user-id",
  adId: "ad-id"
}

// Odpoveď
{
  evaluation: {
    totalScore: 85,
    breakdown: {
      description: 25,
      photos: 20,
      specifications: 22,
      pricing: 18
    },
    suggestions: ["Pridajte ešte 2 fotky", ...],
    strengths: ["Detailný popis", ...],
    weaknesses: ["Chýbajú technické údaje", ...]
  }
}
```

**UI Komponent:** `<AdQualityBadge />`

---

### 3. Inteligentné Porovnávanie Produktov

**Umiestnenie:** `/porovnat`

**Funkcie:**
- Porovnanie až 4 produktov súčasne
- AI analýza špecifikácií, pomeru cena/výkon a stavu
- Odporúčanie najlepšej voľby s odôvodnením
- Informácie o vhodnosti pre rôzne typy kupujúcich
- Cache system pre rýchlejšie opakované porovnania

**API Endpoint:** `/api/ai/compare-products`

**Použitie:**
```typescript
POST /api/ai/compare-products
Body: {
  products: [
    { id: "1", title: "...", price: 1200, ... },
    { id: "2", title: "...", price: 1500, ... }
  ],
  userId: "user-id",
  category: "auto"
}

// Odpoveď
{
  comparison: {
    summary: "Komplexné zhrnutie...",
    comparison: {
      specifications: "Porovnanie špecifikácií...",
      priceValue: "Analýza pomeru ceny...",
      condition: "Porovnanie stavu..."
    },
    recommendation: {
      bestChoice: 0,
      reasoning: "Dôvod výberu..."
    },
    suitability: [...]
  },
  cached: false
}
```

**UI Komponent:** `<ProductComparison />`

---

### 4. Navrhnutie Alternatívnych Produktov

**Funkcie:**
- Návrh 3-5 podobných produktov od iných značiek
- Vysvetlenie rozdielov oproti pôvodnému produktu
- Odôvodnenie zaujímavosti alternatívy
- Cenové rozmedzie

**API Endpoint:** `/api/ai/suggest-alternatives`

---

### 5. Inteligentné Cenové Odporúčania

**Funkcie:**
- Analýza podobných produktov na trhu
- Odporúčanie optimálnej ceny pre rýchly predaj
- Cenové rozmedzie (min-max)
- Trhová analýza a reasoning
- Hodnotenie konkurencieschopnosti (nízka/stredná/vysoká)

**API Endpoint:** `/api/ai/recommend-price`

**Použitie:**
```typescript
POST /api/ai/recommend-price
Body: {
  productInfo: {
    title: "iPhone 15 Pro",
    condition: "new",
    ...
  },
  similarProducts: [
    { price: 1200, ... },
    { price: 1300, ... }
  ],
  userId: "user-id",
  category: "mobily"
}

// Odpoveď
{
  recommendation: {
    recommendedPrice: 1250,
    priceRange: { min: 1100, max: 1400 },
    marketAnalysis: "Trh je...",
    reasoning: "Odôvodnenie...",
    competitiveness: "medium"
  }
}
```

---

## 📊 Admin Dashboard

**Umiestnenie:** `/admin/ai-dashboard`

**Funkcie:**
- Celkové štatistiky AI využitia
- Graf requestov podľa funkcií
- Úspešnosť requestov (%)
- Priemerný čas odpovede
- Odhadované náklady
- Cache štatistiky (hits, úspory tokenov)
- Posledných 100 AI requestov s detailmi

**Prístup:** Len pre administrátorov

---

## 💾 Databázová Schéma

### ai_generated_content
Úložisko AI vygenerovaného obsahu
- `id` - UUID
- `user_id` - relácia na používateľa
- `ad_id` - relácia na inzerát
- `content_type` - typ obsahu (description/title/suggestions)
- `generated_text` - vygenerovaný text
- `input_data` - vstupné dáta (JSONB)
- `model_used` - použitý AI model
- `tokens_used` - počet použitých tokenov
- `generation_time_ms` - čas generovania
- `accepted` - či bol obsah akceptovaný
- `created_at` - timestamp

### ad_quality_scores
Hodnotenia kvality inzerátov
- `id` - UUID
- `ad_id` - relácia na inzerát (UNIQUE)
- `user_id` - relácia na používateľa
- `total_score` - celkové skóre (0-100)
- `description_score` - skóre popisu (0-30)
- `photos_score` - skóre fotografií (0-25)
- `specifications_score` - skóre špecifikácií (0-25)
- `pricing_score` - skóre ceny (0-20)
- `suggestions` - návrhy na zlepšenie (JSONB)
- `strengths` - silné stránky (JSONB)
- `weaknesses` - slabé stránky (JSONB)

### ai_comparisons
Porovnania produktov
- `id` - UUID
- `user_id` - relácia na používateľa
- `ad_ids` - pole ID inzerátov
- `category` - kategória
- `comparison_data` - data porovnania (JSONB)
- `summary` - zhrnutie
- `best_choice` - index najlepšej voľby
- `recommendation_reasoning` - odôvodnenie
- `expires_at` - expirácia (7 dní)

### ai_usage_logs
Logy AI použitia
- `id` - UUID
- `user_id` - relácia na používateľa
- `feature_type` - typ funkcie
- `model_used` - použitý model
- `tokens_used` - počet tokenov
- `response_time_ms` - čas odpovede
- `success` - úspešnosť
- `error_message` - chybová správa
- `metadata` - dodatočné dáta (JSONB)

### ai_cache
Cache AI odpovedí
- `id` - UUID
- `cache_key` - unikátny kľúč
- `feature_type` - typ funkcie
- `input_hash` - hash vstupu
- `cached_response` - cachovaná odpoveď (JSONB)
- `tokens_saved` - ušetrené tokeny
- `hit_count` - počet hitov
- `expires_at` - expirácia
- `last_accessed_at` - posledný prístup

### price_analysis
Cenové analýzy
- `id` - UUID
- `ad_id` - relácia na inzerát
- `user_id` - relácia na používateľa
- `category` - kategória
- `recommended_price` - odporúčaná cena
- `price_range_min` - minimálna cena
- `price_range_max` - maximálna cena
- `market_analysis` - trhová analýza
- `reasoning` - odôvodnenie
- `competitiveness` - konkurencieschopnosť
- `similar_products_analyzed` - počet analyzovaných produktov
- `expires_at` - expirácia (7 dní)

---

## 🔒 Bezpečnosť

- **RLS Policies:** Všetky tabuľky majú Row Level Security
- **Autentifikácia:** Používatelia môžu pristupovať len k vlastným dátam
- **Admin prístup:** Admini majú full prístup pre moderation
- **API Rate Limiting:** Implementované v middleware
- **Validácia vstupov:** Všetky API endpointy validujú vstupy

---

## ⚡ Optimalizácie

### Cache System
- **Inteligentné cachovanie:** Identické requesty sa cachujú
- **TTL Policy:**
  - Kvalitné skóre: 24 hodín
  - Popisy: 7 dní
  - Porovnania: 7 dní
- **Cache cleanup:** Automatické čistenie expired záznamov

### Background Jobs
- Asynchrónne spracovanie AI taskov
- Retry mechanizmus pri zlyhaniach
- Prioritizácia user-facing requestov

### Performance
- Response time monitoring
- Token usage tracking
- Error rate alerting

---

## 💰 Náklady a Kvóty

### Google Gemini Free Tier
- **1,500 requestov denne** - ZADARMO
- **15 requestov za minútu**
- **1 milión tokenov za minútu**

### Odhad nákladov pri prekročení free tier
- **Vstupné tokeny:** $0.10 per 1M tokenov
- **Výstupné tokeny:** $0.40 per 1M tokenov

### Priemerné použitie
- Generovanie popisu: ~500-800 tokenov
- Generovanie nadpisov: ~200-300 tokenov
- Hodnotenie kvality: ~400-600 tokenov
- Porovnanie produktov: ~800-1200 tokenov

**Príklad:** 10,000 generácií mesačne = ~$2-5 mesačne

---

## 🎯 Best Practices

### Pre vývojárov
1. Vždy používaj cache pre opakované requesty
2. Implementuj error handling a fallbacks
3. Monitoruj usage cez Admin Dashboard
4. Optimalizuj prompty pre lepšie výsledky
5. Používaj retry mechanizmus pri zlyhaní

### Pre používateľov
1. Vyplňte čo najviac informácií pre lepšie AI výsledky
2. Upravte vygenerovaný text podľa potreby
3. Sledujte quality score a implementujte návrhy
4. Využívajte comparison tool pri výbere produktu

---

## 🔧 Konfigurácia

### Environment Variables
```bash
# V .env súbore
GOOGLE_GEMINI_API_KEY=your-api-key-here
```

### Gemini Client Configuration
```typescript
// lib/gemini.ts
const defaultConfig = {
  temperature: 0.7,
  maxOutputTokens: 2048,
  topP: 0.95,
  topK: 40,
};
```

---

## 📈 Metriky Success

### Sledované metriky
- **Adoption Rate:** % používateľov využívajúcich AI funkcie
- **Quality Improvement:** Priemer quality score pred/po AI
- **Time Saved:** Čas ušetrený pri tvorbe inzerátov
- **Conversion Rate:** % inzerátov s AI vs. bez AI, ktoré sa predali
- **User Satisfaction:** Feedback od používateľov

---

## 🚀 Budúce Vylepšenia

### Plánované funkcie
1. **AI Chat Asistent** - In-platform chatbot pre pomoc
2. **Automatické tagovanie** - AI automaticky pridá relevantné tagy
3. **Image Recognition** - AI vyhodnotí kvalitu a relevantnosť fotografií
4. **Fraud Detection** - AI detekcia podozrivých inzerátov
5. **Personalizované odporúčania** - AI odporúčania produktov pre používateľov
6. **Sentiment Analysis** - Analýza recenzií a správ
7. **Price Prediction** - Predikcia optimálnej ceny na základe trendov

---

## 📞 Support

Pre problémy s AI funkciami:
1. Skontrolujte Admin Dashboard pre chyby
2. Overte API kľúč v .env súbore
3. Skontrolujte database migrations
4. Pozrite logs v `ai_usage_logs` tabuľke

---

## ✅ Checklist Pre Spustenie

- [x] Nainštalovaný `@google/generative-ai` package
- [x] Nastavený `GOOGLE_GEMINI_API_KEY` v `.env`
- [x] Spustené database migrations
- [x] API routes otestované
- [x] UI komponenty integrované
- [x] Admin dashboard prístupný
- [x] Cache system funguje
- [x] Build prebehol úspešne

---

**Verzia:** 1.0.0
**Posledná aktualizácia:** November 2025
**Status:** ✅ Production Ready
