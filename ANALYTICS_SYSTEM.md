# Smart Analytics and Insights System

## ✅ Implementované funkcie

### 1. **Seller Dashboard** (`/dashboard`)
Kompletný dashboard pre predajcov s pokročilými metrikami a štatistikami.

**Funkcie:**
- 📊 **Kľúčové metriky**
  - Celkové zobrazenia
  - Interakcie používateľov
  - Obľúbené položky
  - Priemerná cena
  - Konverzný pomer

- 📈 **Časové rozsahy**
  - Posledných 7 dní
  - Posledných 30 dní
  - Všetko

- 🏆 **Top inzeráty**
  - Zoradené podľa zobrazení
  - Konverzné pomery
  - Detailná štatistika pre každý inzerát

- 📑 **Záložky**
  - Prehľad
  - Výkonnosť
  - Návštevnosť
  - Optimalizácia

### 2. **Price Trend Charts**
Vizualizácia cenových trendov a histórie zmien.

**Funkcie:**
- 📉 Grafické zobrazenie histórie cien
- 💰 Percentuálna zmena ceny
- 📊 Porovnanie začiatočnej a aktuálnej ceny
- 📅 Timeline všetkých zmien
- 🎯 Indikátory rastu/poklesu

**Komponenty:**
- `PriceTrendChart.tsx` - Vizuálny graf s históriou

### 3. **Listing Optimization Suggestions**
Automatické odporúčania na zlepšenie viditeľnosti.

**Odporúčania:**
- 📸 Pridať viac fotografií (optimálne 5+)
- ✍️ Rozšíriť popis (min. 100 znakov)
- 💵 Upraviť cenu podľa trhu
- 🔄 Pravidelné aktualizácie
- 📈 Zlepšiť konverziu

**Algoritmus:**
```typescript
- Analýza počtu obrázkov
- Kontrola dĺžky popisu
- Porovnanie s priemerom kategórie
- Sledovanie konverzného pomeru
- Odporúčania na základe veku inzerátu
```

### 4. **A/B Testing**
Framework pre testovanie variantov nadpisov a popisov.

**Funkcie:**
- 🎯 Testovanie nadpisov
- 📝 Testovanie popisov
- 🖼️ Testovanie obrázkov
- 📊 Automatické určenie víťaza
- 📈 Real-time sledovanie výsledkov

**API:**
```typescript
// Vytvorenie experimentu
createABTest(adId, 'title', variantA, variantB);

// Sledovanie zobrazení
trackABTestView(experimentId, 'a' | 'b');

// Určenie víťaza (min. 100 zobrazení)
determineABTestWinner(experimentId);
```

### 5. **Competitor Analysis**
Analýza podobných inzerátov v kategórii.

**Metriky:**
- 🎯 Skóre podobnosti (0-100)
- 💰 Cenový rozdiel
- 📊 Porovnanie výkonnosti
- 🔍 Identifikácia konkurencie

**Algoritmus:**
```sql
- Nájdenie podobných inzerátov v kategórii
- Výpočet podobnosti na základe ceny
- Ukladanie pre historické porovnanie
- Automatická aktualizácia
```

### 6. **Traffic Source Analytics**
Sledovanie zdrojov návštevnosti.

**Zdroje:**
- 🔗 Direct (priame návštevy)
- 🔍 Google (vyhľadávanie)
- 📱 Facebook, Instagram, Twitter
- 💼 LinkedIn
- 🎥 YouTube
- 🌐 Referral (iné stránky)
- 🏠 Internal (interné odkazy)

**Sledované údaje:**
```typescript
interface ViewData {
  source: string;           // Zdroj návštevy
  referrer: string;         // Odkazujúca URL
  device_type: string;      // desktop/mobile/tablet
  duration: number;         // Čas strávený (sekundy)
  session_id: string;       // Identifikátor relácie
}
```

### 7. **Weekly Performance Reports**
Automatické týždenné reporty cez Edge Function.

**Obsah reportu:**
- 📊 Celkové zobrazenia
- 🎯 Celkové interakcie
- ❤️ Obľúbené položky
- 🏆 Top 3 inzeráty
- 📈 Percentuálna zmena vs. minulý týždeň
- 📉 Trend výkonnosti

**Edge Function:** `weekly-performance-reports`
```bash
# Manuálne spustenie
curl https://YOUR_PROJECT.supabase.co/functions/v1/weekly-performance-reports
```

---

## 📊 Databázová schéma

### `listing_views`
Sledovanie každého zobrazenia inzerátu.

```sql
- id (uuid)
- ad_id (uuid) → ads
- user_id (uuid) → profiles
- session_id (text)
- source (text)
- referrer (text)
- device_type (text)
- duration (integer)
- viewed_at (timestamptz)
```

### `listing_interactions`
Sledovanie interakcií používateľov.

```sql
- id (uuid)
- ad_id (uuid) → ads
- user_id (uuid) → profiles
- session_id (text)
- action_type (text)
  - click_phone
  - click_message
  - save
  - share
  - click_email
- metadata (jsonb)
- created_at (timestamptz)
```

### `price_history`
História zmien cien.

```sql
- id (uuid)
- ad_id (uuid) → ads
- price (numeric)
- changed_by (uuid) → profiles
- changed_at (timestamptz)
```

**Automatické sledovanie:**
- Trigger `trigger_track_price_change` na tabuľke `ads`
- Ukladá každú zmenu ceny

### `listing_experiments`
A/B testovanie.

```sql
- id (uuid)
- ad_id (uuid) → ads
- experiment_type (text)
- variant_a (text)
- variant_b (text)
- variant_a_views (integer)
- variant_b_views (integer)
- variant_a_clicks (integer)
- variant_b_clicks (integer)
- started_at (timestamptz)
- ended_at (timestamptz)
- winner (text)
```

### `competitor_listings`
Analýza konkurencie.

```sql
- id (uuid)
- ad_id (uuid) → ads
- competitor_ad_id (uuid) → ads
- similarity_score (numeric)
- price_difference (numeric)
- analyzed_at (timestamptz)
```

### `performance_reports`
Uložené reporty.

```sql
- id (uuid)
- user_id (uuid) → profiles
- report_type (text)
- period_start (timestamptz)
- period_end (timestamptz)
- total_views (integer)
- total_interactions (integer)
- report_data (jsonb)
- sent_at (timestamptz)
- created_at (timestamptz)
```

---

## 🔒 Bezpečnosť (RLS)

Všetky tabuľky majú Row Level Security:

### `listing_views` & `listing_interactions`
```sql
-- Ktokoľvek môže vytvoriť záznam
INSERT: anon, authenticated → true

-- Iba vlastníci inzerátov môžu vidieť analytics
SELECT: authenticated → WHERE ad_id IN (user's ads)
```

### `price_history`
```sql
SELECT: authenticated → WHERE ad_id IN (user's ads)
INSERT: authenticated → WHERE ad_id IN (user's ads)
```

### `listing_experiments`
```sql
ALL: authenticated → WHERE ad_id IN (user's ads)
```

### `performance_reports`
```sql
SELECT: authenticated → WHERE user_id = auth.uid()
```

---

## 🛠️ API & Použitie

### Sledovanie zobrazení
```typescript
import { trackAdView } from '@/lib/analytics';

// Automatické sledovanie pri načítaní stránky
useEffect(() => {
  const startTime = Date.now();

  trackAdView(adId, userId);

  return () => {
    const duration = (Date.now() - startTime) / 1000;
    if (duration > 3) {
      trackAdView(adId, userId, duration);
    }
  };
}, [adId]);
```

### Sledovanie interakcií
```typescript
import { trackInteraction } from '@/lib/analytics';

// Pri kliku na tlačidlo
const handleClick = async () => {
  await trackInteraction(adId, 'click_message', userId);
  // ... zvyšok logiky
};
```

### Získanie optimalizačných návrhov
```typescript
import { getOptimizationSuggestions } from '@/lib/analytics';

const suggestions = await getOptimizationSuggestions(adId);
```

### A/B testovanie
```typescript
import { createABTest, trackABTestView } from '@/lib/analytics';

// Vytvorenie testu
const experiment = await createABTest(
  adId,
  'title',
  'Original Title',
  'New Improved Title'
);

// Sledovanie zobrazení
trackABTestView(experiment.id, 'a'); // variant A
trackABTestView(experiment.id, 'b'); // variant B
```

### Analýza konkurencie
```typescript
import { analyzeCompetitors } from '@/lib/analytics';

await analyzeCompetitors(adId, categoryId, price);
```

---

## 📈 SQL Funkcie

### `increment_view_count(ad_id uuid)`
Bezpečné inkrementovanie počítadla zobrazení.

```sql
SELECT increment_view_count('ad-uuid-here');
```

### `get_ad_analytics(ad_id uuid, days_back integer)`
Kompletná analytika pre inzerát.

```sql
SELECT get_ad_analytics('ad-uuid-here', 30);
```

Vráti:
```json
{
  "total_views": 150,
  "total_interactions": 23,
  "views_by_source": {
    "direct": 80,
    "google": 50,
    "facebook": 20
  },
  "interactions_by_type": {
    "click_message": 15,
    "save": 8
  },
  "views_by_device": {
    "desktop": 100,
    "mobile": 50
  },
  "avg_duration": 45.5
}
```

### `get_user_analytics_summary(user_id uuid, days_back integer)`
Súhrnná analytika pre používateľa.

```sql
SELECT get_user_analytics_summary(auth.uid(), 30);
```

---

## 🎯 Konverzné pomery

Sledované konverzie:
1. **View → Interaction**: Základná konverzia
2. **View → Save**: Záujem o produkt
3. **View → Message**: Vysoká konverzia
4. **View → Click Phone**: Najvyššia konverzia

**Výpočet:**
```typescript
conversionRate = (interactions / views) * 100
```

---

## 📊 Dashboard URL

Po implementácii je dashboard dostupný na:
```
https://kupado.sk/dashboard
```

**Prístup:**
- Iba pre prihlásených používateľov
- Automaticky presmeruje na homepage ak nie je prihlásený
- Dostupný cez dropdown menu v hlavičke

---

## 🚀 Budúce vylepšenia

### Fáza 2:
- [ ] Email notifikácie pre týždenné reporty
- [ ] PDF export reportov
- [ ] Real-time dashboard updates
- [ ] Porovnanie s priemerom odvetvia
- [ ] AI-powered pricing suggestions
- [ ] Prediktívna analytika
- [ ] Heat mapy kliknutí
- [ ] Video analytics (pre inzeráty s videom)

### Fáza 3:
- [ ] Google Analytics integrácia
- [ ] Facebook Pixel integrácia
- [ ] Custom alerts a notifikácie
- [ ] API pre externe analytické nástroje
- [ ] Mobilná aplikácia s push notifikáciami

---

## ✨ Výhody systému

### Pre predajcov:
✅ Komplexný prehľad výkonnosti
✅ Data-driven rozhodnutia
✅ Zlepšenie viditeľnosti inzerátov
✅ Zvýšenie konverzií
✅ Konkurenčná výhoda

### Pre platformu:
✅ Zvýšená používateľská angažovanosť
✅ Lepšia kvalita inzerátov
✅ Dáta pre zlepšenie platformy
✅ Premium features pre monetizáciu

---

## 📝 Poznámky

1. **Výkon:** Všetky queries sú optimalizované s indexmi
2. **Privacy:** Anonymné sledovanie pre neprihlásených
3. **GDPR:** Kompatibilné s európskymi reguláciami
4. **Škálovateľnosť:** Pripravené na milióny záznamov
5. **Real-time:** Využíva Supabase Realtime pre live updates

---

**Status:** ✅ Plne implementované a funkčné
**Build:** ✅ Úspešný
**Database:** ✅ Migrácie aplikované
**Edge Functions:** ✅ Nasadené
