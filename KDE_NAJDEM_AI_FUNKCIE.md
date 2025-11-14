# 🎯 KDE PRESNE NÁJDEM AI FUNKCIE

## 📍 KROK ZA KROKOM NÁVOD

### 1️⃣ VIZUÁLNE VYHĽADÁVANIE 📸
**Čo robí:** Nahrajte fotku produktu a AI nájde podobné inzeráty

**KDE TO JE:**
```
Cesta: http://localhost:3000/ai-features
Kliknite na: Tab "Nástroje" (Tools)
```

**AKO TO POUŽIŤ:**
1. Otvorte stránku `/ai-features`
2. Kliknite na tab "Nástroje"
3. Uvidíte kartu "Vizuálne vyhľadávanie s AI"
4. Kliknite "Nahrať obrázok"
5. Vyberte fotku produktu
6. AI automaticky:
   - Analyzuje obrázok
   - Zobrazí čo našla
   - Ukáže podobné produkty

**PRÍKLAD:**
- Odfotíte notebook
- AI povie: "MacBook Pro 2023, strieborný, 14 palcov"
- Zobrazí podobné notebooky

---

### 2️⃣ HODNOTENIE KVALITY 🏆
**Čo robí:** AI hodnotí váš inzerát a dá vám skóre 0-100

**KDE TO JE:**
```
Cesta: Akýkoľvek detail inzerátu
URL: http://localhost:3000/inzerat/[id]
```

**AKO TO POUŽIŤ:**
1. Otvorte ľubovoľný inzerát
2. V hlavičke (hneď vedľa názvu) uvidíte badge:
   ```
   ✨ 85/100 - Výborná
   ```
3. Kliknite na badge
4. Zobrazí sa detailné hodnotenie:
   - Popis: X/30
   - Fotografie: X/25
   - Špecifikácie: X/25
   - Cena: X/20
   - + Návrhy na zlepšenie

**PRÍKLAD:**
- Váš inzerát má skóre 65/100
- AI povie: "Pridajte viac fotografií" a "Doplňte technické parametre"
- Po úprave skóre stúpne na 85/100

---

### 3️⃣ TRHOVÁ ANALYTIKA 📊
**Čo robí:** Zobrazuje cenové trendy, populárne kategórie, AI insights

**KDE TO JE:**
```
Cesta: http://localhost:3000/ai-features
Kliknite na: Tab "Analytika"
```

**AKO TO POUŽIŤ:**
1. Otvorte `/ai-features`
2. Kliknite tab "Analytika"
3. Uvidíte 4 karty:
   - Priemerná cena
   - Aktívne inzeráty
   - Aktívni používatelia
   - Zobrazenia
4. Pod kartami sú 3 taby:
   - **Populárne kategórie** - Top 5 s grafmi
   - **Cenové rozpätia** - Distribúcia cien
   - **AI Insights** - Kliknite "Generovať Insights"

**PRÍKLAD:**
- Priemerná cena v kategórii Elektronika: 450€
- Najpopulárnejšia kategória: Mobilné telefóny (245 inzerátov)
- AI Insight: "Ceny smartfónov klesajú o 5% mesačne"

---

### 4️⃣ CENOVÉ ODPORÚČANIA 💰
**Čo robí:** AI navrhne optimálnu cenu pre váš produkt

**KDE TO JE:**
```
API: /api/ai/recommend-price
Alebo v detail inzeráte: PriceTrendChart komponent
```

**AKO TO POUŽIŤ:**

**Varianta A - V detail inzeráte:**
1. Otvorte inzerát
2. Scrollujte dole
3. Uvidíte graf "Cenový trend"
4. Graf ukazuje:
   - Aktuálnu cenu
   - Historické ceny
   - Odporúčanú cenu (zelená čiara)

**Varianta B - Pri vytváraní inzerátu:**
1. Idete pridať inzerát
2. Zadáte kategóriu a popis
3. V API sa automaticky volá:
   ```javascript
   POST /api/ai/recommend-price
   {
     "adData": {...},
     "category": "electronics"
   }
   ```
4. Dostanete: `recommendedPrice: 450`

**PRÍKLAD:**
- Predávate iPhone 13 Pro
- AI povie: "Odporúčaná cena: 650€"
- Základe: podobné telefóny, stav, konkurencia

---

### 5️⃣ POROVNANIE PRODUKTOV 🔍
**Čo robí:** Detailné AI porovnanie až 4 produktov side-by-side

**KDE TO JE:**
```
Cesta: http://localhost:3000/porovnat
```

**AKO TO POUŽIŤ:**
1. Otvorte `/porovnat`
2. Vyhľadajte prvý produkt
3. Kliknite "Pridať na porovnanie"
4. Opakujte pre ďalšie produkty (max 4)
5. AI automaticky vytvorí tabuľku s porovnaním:
   - Cena
   - Stav
   - Špecifikácie
   - Hodnotenie
   - **AI Odporúčanie** - ktorý je najlepší

**PRÍKLAD:**
```
Produkt 1: iPhone 13 - 600€ - Výborný stav
Produkt 2: iPhone 13 - 550€ - Dobrý stav
Produkt 3: iPhone 12 - 450€ - Výborný stav

AI Odporúčanie: "Produkt 2 má najlepší pomer cena/výkon"
```

---

### 6️⃣ PERSONALIZOVANÉ ODPORÚČANIA 🎁
**Čo robí:** AI odporúča produkty na mieru pre vás

**KDE TO JE:**
```
Cesta: Hlavná stránka http://localhost:3000/
Sekcia: "AI Odporúčania" (v dolnej časti)
```

**AKO TO FUNGUJE:**
1. AI sleduje čo si prezeráte
2. Učí sa vaše preferencie
3. Na hlavnej stránke zobrazí sekciu:
   ```
   🎯 Odporúčané pre vás
   ```
4. Uvidíte 4-6 produktov vybraných AI

**PRÍKLAD:**
- Prezerali ste notebooky
- AI vám ukáže:
  - Podobné notebooky
  - Príslušenstvo (myš, taška)
  - Súvisiace produkty

---

## 🗺️ MAPA VŠETKÝCH AI FUNKCIÍ

### Na Hlavnej Stránke (/)
- ✅ AI Chat Assistant (vpravo dole - zelený widget)
- ✅ AI Odporúčania (sekcia dole)
- ✅ Hlasové vyhľadávanie (ikona mikrofónu)
- ✅ **NOVÉ:** 3 karty s odkazmi na AI funkcie

### Detail Inzerátu (/inzerat/[id])
- ✅ Quality Badge (hlavička)
- ✅ Price Trend Chart (graf)
- ✅ Similar Ads (podobné produkty)
- ✅ AI Chat Assistant

### Pridať Inzerát (/pridat-inzerat)
- ✅ AI Description Generator (tlačidlo Sparkles)

### AI Features Hub (/ai-features)
- ✅ Tab "Prehľad" - Všetky funkcie
- ✅ Tab "Analytika" - Market Analytics
- ✅ Tab "Nástroje" - Visual Search
- ✅ Tab "Notifikácie" - Smart Notifications
- ✅ Tab "Výkon" - Performance Insights

### Porovnanie (/porovnat)
- ✅ Product Comparison (až 4 produkty)

---

## 🚀 QUICKSTART - Vyskúšajte za 2 minúty

### TEST 1: Vizuálne vyhľadávanie
```bash
1. Otvorte: http://localhost:3000/ai-features
2. Kliknite: Tab "Nástroje"
3. Kliknite: "Nahrať obrázok"
4. Nahrajte ľubovoľnú fotku produktu
5. Sledujte ako AI analyzuje a nájde podobné!
```

### TEST 2: Quality Scoring
```bash
1. Otvorte: http://localhost:3000/
2. Kliknite na ľubovoľný inzerát
3. Hľadajte badge "✨ X/100" v hlavičke
4. Kliknite naň pre detaily
5. Uvidíte čo treba zlepšiť!
```

### TEST 3: AI Chat
```bash
1. Na ktorejkoľvek stránke
2. Pozrite vpravo dole
3. Zelený widget s Sparkles ikonou
4. Kliknite a opýtajte sa: "Aké sú najlepšie notebooky?"
5. AI odpovie okamžite!
```

### TEST 4: Market Analytics
```bash
1. Otvorte: http://localhost:3000/ai-features
2. Kliknite: Tab "Analytika"
3. V tab "AI Insights" kliknite: "Generovať Insights"
4. AI vytvorí 5-7 konkrétnych trhových odporúčaní!
```

---

## ❓ Časté Otázky

**Q: Prečo nevidím Quality Badge na niektorých inzerátoch?**
A: Badge sa zobrazí po kliknutí na inzerát. Vyžaduje prihlásenie.

**Q: Ako aktivujem AI Chat?**
A: Je automaticky dostupný - zelený widget vpravo dole na každej stránke.

**Q: Kde nájdem cenové odporúčania?**
A: Pri vytváraní inzerátu alebo v grafe na detail stránke inzerátu.

**Q: Funguje to v mobile app?**
A: Čiastočne - API áno, UI komponenty sa dopĺňajú.

---

## 🎯 Prioritné Použitie

### Pre Kupujúcich:
1. **Vizuálne vyhľadávanie** - Nájdite podobné produkty
2. **AI Chat** - Opýtajte sa na čokoľvek
3. **Porovnanie** - Vyberte najlepší produkt

### Pre Predajcov:
1. **Quality Scoring** - Zlepšite inzerát
2. **AI Description** - Profesionálny popis za sekundy
3. **Market Analytics** - Poznajte trh
4. **Performance Insights** - Zvýšte predaj

---

**Všetko funguje a je LIVE! Vyskúšajte teraz! 🚀**
