# 🎯 VIZUÁLNY NÁVOD - KDE NÁJDEM AI FUNKCIE

## 📍 MAPA STRÁNOK

```
KUPADO.SK - AI FUNKCIE MAPA
│
├─ 🏠 HLAVNÁ STRÁNKA (http://localhost:3000/)
│  ├─ ✅ AI Chat Assistant (vpravo dole - zelený floating widget)
│  ├─ ✅ AI Odporúčania (sekcia pod inzerátmi)
│  ├─ ✅ Hlasové vyhľadávanie (ikona mikrofónu v search bare)
│  └─ ✅ 3 AI Feature karty (nová sekcia):
│     ├─ 📸 Vizuálne vyhľadávanie → `/ai-features`
│     ├─ 📊 Trhová analytika → `/ai-features`
│     └─ 👁️ Porovnanie produktov → `/porovnat`
│
├─ 🤖 AI FEATURES HUB (http://localhost:3000/ai-features)
│  ├─ Tab: "Prehľad"
│  │  └─ 12 AI feature kariet s popismi
│  ├─ Tab: "Analytika" ✅ TU JE TRHOVÁ ANALYTIKA!
│  │  ├─ 4 štatistické karty (cena, inzeráty, používatelia, zobrazenia)
│  │  ├─ Populárne kategórie (top 5 s grafmi)
│  │  ├─ Cenové rozpätia (distribúcia)
│  │  └─ AI Insights (tlačidlo "Generovať Insights")
│  ├─ Tab: "Nástroje" ✅ TU JE VIZUÁLNE VYHĽADÁVANIE!
│  │  ├─ Tlačidlo "Nahrať obrázok"
│  │  ├─ Tlačidlo "Odfotiť produkt"
│  │  ├─ AI analýza obrázka
│  │  └─ Výsledky podobných produktov (karty)
│  ├─ Tab: "Notifikácie" ✅ SMART NOTIFICATIONS!
│  │  ├─ Filter: Všetky / Neprečítané / Vysoká priorita
│  │  ├─ Notifikácie s prioritami (vysoká/stredná/nízka)
│  │  └─ Tlačidlo "Označiť všetko ako prečítané"
│  └─ Tab: "Výkon" ✅ PERFORMANCE INSIGHTS!
│     ├─ Celkové skóre výkonu (0-100)
│     ├─ 4 metrické karty
│     ├─ AI Odporúčania (tlačidlo "Generovať")
│     ├─ Výkonnostné trendy
│     └─ Rýchle optimalizácie
│
├─ 📄 DETAIL INZERÁTU (http://localhost:3000/inzerat/[id])
│  ├─ ✅ Quality Badge - v hlavičke vedľa názvu
│  │  └─ Kliknite pre detailné hodnotenie
│  ├─ ✅ Price Trend Chart - graf cenových trendov
│  ├─ ✅ Similar Ads - sekcia podobných produktov
│  └─ ✅ AI Chat Assistant - kontextový sprievodca
│
├─ ➕ PRIDAŤ INZERÁT (http://localhost:3000/pridat-inzerat)
│  └─ ✅ AI Description Generator
│     └─ Tlačidlo "Generovať AI popis" (ikona Sparkles ✨)
│        └─ 3-step wizard:
│           1. Základné info
│           2. Kategória a detaily
│           3. Preview a úprava
│
└─ 🔍 POROVNANIE (http://localhost:3000/porovnat)
   └─ ✅ Product Comparison
      ├─ Vyhľadávanie produktov
      ├─ Pridávanie na porovnanie (max 4)
      ├─ Side-by-side tabuľka
      └─ AI hodnotenie a odporúčanie
```

---

## 🎬 SCENÁRE POUŽITIA

### SCENÁR 1: Chcem nájsť podobné produkty podľa fotky

```
KROK 1: Otvorte hlavnú stránku
        URL: http://localhost:3000/

KROK 2: Scrollujte dole a nájdite sekciu "AI Funkcie"
        Uvidíte 3 karty, prvá je "Vizuálne vyhľadávanie"

KROK 3: Kliknite na kartu "Vizuálne vyhľadávanie"
        → Presmeruje na /ai-features

KROK 4: Kliknite na tab "Nástroje"

KROK 5: V sekcii "Vizuálne vyhľadávanie s AI":
        ┌─────────────────────────────────┐
        │ 📸 Vizuálne vyhľadávanie s AI   │
        ├─────────────────────────────────┤
        │ Nahrajte fotografiu produktu    │
        │ a AI nájde podobné inzeráty     │
        │                                 │
        │ [Nahrať obrázok] 📤            │
        │        alebo                    │
        │ [Odfotiť produkt] 📷           │
        └─────────────────────────────────┘

KROK 6: Kliknite "Nahrať obrázok"

KROK 7: Vyberte fotku z počítača

VÝSLEDOK:
✅ AI analyzuje obrázok
✅ Zobrazí: "AI Analýza: MacBook Pro 2023, strieborný..."
✅ Ukáže podobné produkty v kartách
```

---

### SCENÁR 2: Chcem vedieť aké sú cenové trendy

```
KROK 1: Otvorte
        URL: http://localhost:3000/ai-features

KROK 2: Kliknite na tab "Analytika"

VÝSLEDOK - Uvidíte:
┌──────────────────────────────────────────────┐
│  📊 AI Trhová Analytika                      │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │ 450€ │  │ 234  │  │  89  │  │ 1.2K │  │
│  │ Cena │  │ Ads  │  │Users │  │Views │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                              │
│  [Populárne kategórie] [Ceny] [AI Insights] │
│                                              │
│  Elektronika    ████████████ 245           │
│  Nehnuteľnosti  ████████ 189               │
│  Autá           ██████ 156                 │
│                                              │
└──────────────────────────────────────────────┘

KROK 3: Kliknite na tab "AI Insights"

KROK 4: Kliknite tlačidlo [✨ Generovať Insights]

VÝSLEDOK:
✅ AI vygeneruje 5-7 konkrétnych trhových poznatkov
✅ Napríklad: "Ceny telefónov klesajú o 5%"
✅ "Najlepší čas na predaj je víkend"
```

---

### SCENÁR 3: Chcem porovnať produkty

```
KROK 1: Otvorte
        URL: http://localhost:3000/porovnat

KROK 2: Vyhľadajte prvý produkt
        [Search bar: "iPhone 13"] [🔍]

KROK 3: Kliknite "Pridať na porovnanie"

KROK 4: Opakujte pre ďalšie produkty (max 4)

VÝSLEDOK - Tabuľka:
┌────────────────────────────────────────────┐
│  Produkt 1    │ Produkt 2   │ Produkt 3   │
├────────────────────────────────────────────┤
│ iPhone 13 Pro │ iPhone 13   │ iPhone 12   │
│ 650€          │ 550€        │ 450€        │
│ Výborný       │ Dobrý       │ Výborný     │
│ 256GB         │ 128GB       │ 128GB       │
├────────────────────────────────────────────┤
│ 🤖 AI ODPORÚČANIE:                         │
│ Produkt 2 má najlepší pomer cena/výkon    │
└────────────────────────────────────────────┘
```

---

### SCENÁR 4: Chcem zlepšiť kvalitu môjho inzerátu

```
KROK 1: Otvorte váš inzerát
        URL: http://localhost:3000/inzerat/[id]

KROK 2: V hlavičke hľadajte badge:
        ┌──────────────────────────┐
        │ iPhone 13 Pro            │
        │ ✨ 65/100 - Dobrá        │ ← TOTO!
        └──────────────────────────┘

KROK 3: Kliknite na badge "65/100"

VÝSLEDOK - Modal window:
┌────────────────────────────────────┐
│ ✨ Hodnotenie kvality inzerátu     │
├────────────────────────────────────┤
│                                    │
│ Celkové skóre: 65/100             │
│ ████████████░░░░░░░░               │
│                                    │
│ Detailné hodnotenie:               │
│ ✓ Popis: 20/30                    │
│ ✗ Fotografie: 15/25 ⚠️            │
│ ✓ Špecifikácie: 20/25             │
│ ✓ Cena: 18/20                     │
│                                    │
│ 💡 Návrhy na zlepšenie:           │
│ • Pridajte min. 3 fotografie      │
│ • Doplňte technické parametre     │
│ • Rozšírte popis o 100 slov       │
│                                    │
│ [Zavrieť]                         │
└────────────────────────────────────┘
```

---

### SCENÁR 5: Chcem AI napísať popis

```
KROK 1: Otvorte
        URL: http://localhost:3000/pridat-inzerat

KROK 2: Scrollujte k poľu "Popis"

KROK 3: Kliknite tlačidlo "✨ Generovať AI popis"

VÝSLEDOK - 3-step wizard:
┌──────────────────────────────────────┐
│ KROK 1/3: Základné informácie        │
├──────────────────────────────────────┤
│ Produkt: [iPhone 13 Pro]            │
│ Kategória: [Elektronika]            │
│ Stav: [Používané - výborný]         │
│                                      │
│ [Ďalej →]                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ KROK 2/3: Detaily                    │
├──────────────────────────────────────┤
│ Vlastnosti:                          │
│ • [256GB]                            │
│ • [Modrá farba]                      │
│ • [S príslušenstvom]                 │
│                                      │
│ [← Späť] [Generovať →]              │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ KROK 3/3: Preview                    │
├──────────────────────────────────────┤
│ ✅ AI Vygenerovaný popis:            │
│                                      │
│ "Predám iPhone 13 Pro v perfektnom   │
│ stave. Telefón má 256GB úložisko,    │
│ modrú farbu a prichádza s originál.  │
│ balením a káblom. Batéria 98%..."   │
│                                      │
│ [Použiť tento popis] [Generovať znova]│
└──────────────────────────────────────┘
```

---

## 📱 MOBILE APP STATUS

### ✅ ČO FUNGUJE:
- API endpointy (všetky 13)
- Základné screens
- AI Features overview screen (NOVÝ!)

### ⚠️ ČO CHÝBA V MOBILE UI:
- AI Chat widget
- Visual Search UI
- Voice Search
- Quality Badge display
- Market Analytics dashboard
- Performance Insights

**RIEŠENIE:** Používajte WEB verziu - všetko funguje 100%!

---

## 🎯 QUICK LINKS

| Funkcia | URL | Tab/Sekcia |
|---------|-----|------------|
| **Vizuálne vyhľadávanie** | `/ai-features` | Tab "Nástroje" |
| **Trhová analytika** | `/ai-features` | Tab "Analytika" |
| **Performance Insights** | `/ai-features` | Tab "Výkon" |
| **Smart Notifications** | `/ai-features` | Tab "Notifikácie" |
| **Porovnanie produktov** | `/porovnat` | - |
| **Quality Scoring** | `/inzerat/[id]` | Badge v hlavičke |
| **AI Description** | `/pridat-inzerat` | Tlačidlo Sparkles |
| **AI Chat** | Kdekoľvek | Zelený widget vpravo dole |

---

## ✅ CHECKLIST - Vyskúšajte Všetko

```
□ Otvoril som /ai-features
□ Klikol som na tab "Nástroje"
□ Nahrál som obrázok pre vizuálne vyhľadávanie
□ Videl som AI analýzu a podobné produkty

□ Klikol som na tab "Analytika"
□ Videl som štatistické karty
□ Klikol som "Generovať Insights"
□ Dostal som AI odporúčania

□ Otvoril som detail inzerátu
□ Videl som Quality Badge vedľa názvu
□ Klikol som na badge
□ Videl som detailné hodnotenie

□ Otvoril som /porovnat
□ Vyhľadal som produkty
□ Pridal som ich na porovnanie
□ Videl som AI odporúčanie

□ Klikol som na zelený AI Chat widget
□ Opýtal som sa niečo
□ Dostal som odpoveď od AI

□ Pri vytváraní inzerátu som klikol "Generovať AI popis"
□ Prešiel som 3-step wizard
□ Dostal som vygenerovaný profesionálny popis
```

---

## 🆘 POMOC

**Nevidím AI Chat widget?**
→ Je vpravo dole, zelený s ikonou Sparkles

**Nevidím Quality Badge?**
→ Musíte byť prihlásený a otvoriť detail inzerátu

**Kde je Visual Search?**
→ `/ai-features` → Tab "Nástroje"

**Kde je Market Analytics?**
→ `/ai-features` → Tab "Analytika"

**Nefunguje v mobile?**
→ Používajte WEB verziu

---

**VŠETKO FUNGUJE! Teraz už viete kde čo je! 🚀**
