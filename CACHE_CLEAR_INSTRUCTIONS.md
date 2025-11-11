# 🔄 Ako Vymazať Cache a Zobraziť Nový Formulár

## ⚠️ Problém
Vidíte starý formulár pre automobily bez všetkých nových polí (výkon, farba, karoséria, VIN...).

## ✅ Riešenie

### **Metóda 1: Hard Refresh (Najrýchlejšie)**

#### Windows/Linux:
- `Ctrl + Shift + R` alebo
- `Ctrl + F5`

#### Mac:
- `Cmd + Shift + R` alebo
- `Cmd + Option + R`

---

### **Metóda 2: Vymazanie Cache v Chrome/Edge**

1. Otvorte DevTools: `F12` alebo `Ctrl + Shift + I`
2. Pravý klik na tlačidlo **Reload** (vedľa URL)
3. Vyberte **"Empty Cache and Hard Reload"**

---

### **Metóda 3: Manuálne vymazanie cache**

#### Chrome/Edge:
1. `Ctrl + Shift + Delete`
2. Vyberte **"Cached images and files"**
3. Časový rozsah: **"All time"** alebo **"Last hour"**
4. Kliknite **"Clear data"**
5. Obnovte stránku: `F5`

#### Firefox:
1. `Ctrl + Shift + Delete`
2. Vyberte **"Cache"**
3. Časový rozsah: **"Everything"**
4. Kliknite **"Clear Now"**
5. Obnovte stránku: `F5`

---

### **Metóda 4: Inkognito/Private režim**

1. Otvorte nové Inkognito okno:
   - Chrome/Edge: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
2. Prejdite na aplikáciu
3. Formulár sa zobrazí správne (cache je vynulovaný)

---

### **Metóda 5: Reštart dev servera**

Ak používate `npm run dev`:
1. Zastavte server: `Ctrl + C`
2. Vymažte Next.js cache:
   ```bash
   rm -rf .next
   ```
3. Reštartujte server:
   ```bash
   npm run dev
   ```
4. Obnovte stránku v prehliadači

---

## ✅ Po vyčistení cache by ste mali vidieť:

### **Špecifikácie vozidla**

#### **Základné údaje:**
- ✅ Značka *
- ✅ Model *
- ✅ Rok výroby *
- ✅ Tachometer (km) *

#### **Technické parametre:**
- ✅ Palivo * (Select dropdown: Benzín, Diesel, Elektro...)
- ✅ Prevodovka * (Select dropdown: Manuál, Automat, Poloautomat)
- ✅ **Výkon (kW)** ← NOVÉ!
- ✅ **Objem motora (cm³)** ← NOVÉ!
- ✅ **Pohon** (Select: Predný, Zadný, 4x4) ← NOVÉ!
- ✅ **Emisná trieda** (Select: Euro 6, 5, 4...) ← NOVÉ!

#### **Karoséria a exteriér:**
- ✅ **Typ karosérie** (Select: Sedan, SUV, Combi...) ← NOVÉ!
- ✅ **Farba** (Select: Biela, Čierna, Sivá...) ← NOVÉ!
- ✅ **Počet sedadiel** (Select: 2-9) ← NOVÉ!
- ✅ **VIN** (17-znakový kód) ← NOVÉ!

---

## 🔍 Ako overiť, že cache je vymazaný?

Po obnovení stránky skontrolujte, či vidíte:

1. **3 sekcie** s podnadpismi:
   - "Základné údaje"
   - "Technické parametre"
   - "Karoséria a exteriér"

2. **Select dropdowny** namiesto text inputov pre:
   - Palivo
   - Prevodovka
   - Pohon
   - Emisná trieda
   - Typ karosérie
   - Farba
   - Počet sedadiel

3. **18 polí celkovo** pre automobily (namiesto starých 6)

---

## 🐛 Ak stále vidíte starý formulár:

1. Skúste všetky metódy vyššie
2. Skontrolujte, či je server spustený (`npm run dev`)
3. Skontrolujte Console v DevTools (`F12`) pre chyby
4. Reštartujte prehliadač kompletne (zavrite všetky okná)
5. Ak nič nepomôže, skúste iný prehliadač

---

## 💡 Tip pre vývojárov:

V DevTools (F12) → Network → ✅ **"Disable cache"**
(kým máte DevTools otvorené, cache je automaticky vypnutý)
