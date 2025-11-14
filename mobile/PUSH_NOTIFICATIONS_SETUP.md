# 📱 Push Notifikácie - Kompletný Setup Guide

## ✅ Čo je už nakonfigurované

### 1. Expo Project ID
- ✅ **Project ID:** `ff555602-dfe7-47ac-97b0-440c376c1850`
- ✅ Nastavené v `app.json`
- ✅ Nastavené v `notificationService.ts`

### 2. Databáza
- ✅ `push_tokens` tabuľka vytvorená
- ✅ `notification_queue` tabuľka vytvorená
- ✅ RLS polícia nastavená
- ✅ Trigger pre správy aktivovaný

### 3. Edge Function
- ✅ `send-push-notification` edge function nasadená
- ✅ Volá Expo Push Notification Service
- ✅ Spracováva notifikácie pre správy

### 4. Mobilná aplikácia
- ✅ Automatická registrácia push tokenov pri prihlásení
- ✅ Odstránenie tokenov pri odhlásení
- ✅ Notification listeners (navigácia po kliknutí)
- ✅ ChatScreen volá edge function po odoslaní správy

---

## 🚀 Ako aktivovať notifikácie

### Krok 1: Nastav environment variables

Vytvor súbor `mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Poznámka:** Skopíruj hodnoty z `/project/.env` (Supabase projekt)

---

### Krok 2: Build development build

Push notifikácie **NEFUNGUJÚ v Expo Go**. Musíš vytvoriť development build:

```bash
cd mobile

# Pre Android:
eas build --profile development --platform android

# Pre iOS (vyžaduje Apple Developer účet):
eas build --profile development --platform ios
```

**Prečo development build?**
- ✅ Obsahuje všetky native moduly (expo-notifications)
- ✅ Podporuje Expo Push Notifications
- ✅ Môžeš použiť na testovanie

---

### Krok 3: Nainštaluj development build na zariadenie

Po dokončení buildu:

1. Stiahni `.apk` (Android) alebo `.ipa` (iOS)
2. Nainštaluj na zariadenie
3. Spusti aplikáciu

---

### Krok 4: Prihlás sa a testuj

1. **Prihlás sa** v aplikácii
2. **Automaticky** sa zaregistruje push token
3. **Otvor druhé zariadenie** (alebo emulátor)
4. **Pošli správu** medzi používateľmi
5. **Notifikácia** by mala prísť!

---

## 📊 Ako to funguje

### Odoslanie správy → Notifikácia

```
1. Používateľ A pošle správu
   ↓
2. INSERT do messages tabuľky
   ↓
3. Trigger sa spustí
   ↓
4. ChatScreen zavolá edge function
   ↓
5. Edge function nájde push tokens používateľa B
   ↓
6. Pošle request na Expo Push Service
   ↓
7. Expo doručí notifikáciu na zariadenie B
   ↓
8. Používateľ B dostane notifikáciu
   ↓
9. Klikne → Otvorí sa ChatScreen
```

---

## 🔧 Testovanie v Expo Go (obmedzené)

Expo Go **nepodporuje** push notifikácie, ale môžeš otestovať:

```bash
cd mobile
npx expo start
```

**Čo funguje:**
- ✅ Automatická registrácia push tokenov (ale zlyhá)
- ✅ UI a navigácia
- ✅ Správy fungujú

**Čo nefunguje:**
- ❌ Získanie Expo push token (vráti chybu)
- ❌ Prijímanie notifikácií
- ❌ Testovanie notifikácií

---

## 📱 Typy notifikácií

### 1. Nová správa ✅ (Implementované)

**Trigger:** Keď niekto pošle správu

```typescript
{
  title: "Nová správa od user@example.com",
  body: "Ahoj, máš ešte ten produkt?",
  data: {
    type: "message",
    conversationId: "uuid",
    senderId: "uuid"
  }
}
```

**Kliknutie:** Otvorí ChatScreen s konverzáciou

---

### 2. Topovanie skončilo ⚠️ (Nie je implementované)

**Kedy:** Po 7 dňoch od topovania

```typescript
{
  title: "Topovanie skončilo",
  body: "Tvoj inzerát 'iPhone 13 Pro' už nie je topovaný",
  data: {
    type: "ad_boost_expired",
    adId: "uuid"
  }
}
```

**Implementácia:** Potrebuje scheduled job (pg_cron)

---

### 3. Nový záujemca ⚠️ (Nie je implementované)

```typescript
{
  title: "Nový záujemca",
  body: "user@example.com má záujem o tvoj inzerát",
  data: {
    type: "new_interest",
    adId: "uuid",
    conversationId: "uuid"
  }
}
```

---

### 4. Nové hodnotenie ⚠️ (Nie je implementované)

```typescript
{
  title: "Nové hodnotenie",
  body: "Dostali ste 5 hviezdičiek",
  data: {
    type: "review",
    reviewId: "uuid"
  }
}
```

---

## 🐛 Troubleshooting

### Problém: "Push notifications not available in Expo Go"

**Riešenie:** Musíš použiť development build.

```bash
eas build --profile development --platform android
```

---

### Problém: "Failed to get push token"

**Možné príčiny:**
1. Používaš Expo Go (nie je podporované)
2. Nemáš správne nastavený Project ID
3. Nemáš povolenia pre notifikácie

**Riešenie:**
1. Skontroluj `app.json`: `"projectId": "ff555602-dfe7-47ac-97b0-440c376c1850"`
2. Skontroluj `notificationService.ts`: rovnaké Project ID
3. Povoľ notifikácie v nastaveniach zariadenia

---

### Problém: "Notifikácie neprichádzajú"

**Kontrolný zoznam:**
1. ✅ Používaš development build (nie Expo Go)?
2. ✅ Prihlásený používateľ má push token v DB?
   ```sql
   SELECT * FROM push_tokens WHERE user_id = 'your-user-id';
   ```
3. ✅ Edge function je nasadená?
   ```bash
   # Skontroluj v Supabase dashboard → Edge Functions
   ```
4. ✅ Notifikácie sú povolené v nastaveniach zariadenia?
5. ✅ Environment variables sú nastavené v `mobile/.env`?

---

### Problém: "Edge function error"

**Kontrola edge function:**

```bash
# Zavolaj edge function manuálne
curl -X POST https://your-project.supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "title": "Test",
    "body": "Test notification",
    "data": {"type": "test"}
  }'
```

---

## 📚 Ďalšie kroky

### 1. Implementovať notifikácie pre topovanie

Vytvor scheduled job, ktorý beží každý deň:

```sql
-- Needs pg_cron extension
SELECT cron.schedule(
  'check-expired-boosts',
  '0 9 * * *',  -- Každý deň o 9:00
  $$
  SELECT send_boost_expiration_notifications();
  $$
);
```

---

### 2. Pridať notifikácie pre nových záujemcov

Trigger pri vytvorení konverzácie:

```sql
CREATE TRIGGER on_conversation_created
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION notify_ad_owner();
```

---

### 3. Testovať na production build

Pre release do obchodu:

```bash
# Android
eas build --profile production --platform android

# iOS (vyžaduje Apple Developer účet)
eas build --profile production --platform ios
```

---

## 📋 Zhrnutie konfigurácie

| Komponent | Status | Poznámka |
|-----------|--------|----------|
| **Expo Project ID** | ✅ Nastavené | `ff555602-dfe7-47ac-97b0-440c376c1850` |
| **Database tables** | ✅ Vytvorené | `push_tokens`, `notification_queue` |
| **Edge function** | ✅ Nasadené | `send-push-notification` |
| **Message trigger** | ✅ Aktívny | Automaticky volá edge function |
| **Auto registration** | ✅ Implementované | Pri prihlásení |
| **Notification listeners** | ✅ Implementované | V AuthContext + ChatScreen |
| **Development build** | ⚠️ Potrebné | Na testovanie notifikácií |
| **Environment vars** | ⚠️ Potrebné | Vytvor `mobile/.env` |
| **Topovanie notifikácie** | ❌ Nie | Implementovať scheduled job |
| **Záujemca notifikácie** | ❌ Nie | Implementovať trigger |

---

## 🎯 Quick Start Checklist

- [ ] 1. Vytvor `mobile/.env` so Supabase credentials
- [ ] 2. Spusti `eas build --profile development --platform android`
- [ ] 3. Nainštaluj build na zariadenie
- [ ] 4. Prihlás sa v aplikácii
- [ ] 5. Skontroluj v DB, či sa vytvoril push token
- [ ] 6. Pošli správu z druhého zariadenia
- [ ] 7. Skontroluj, či prišla notifikácia

---

## 💡 Dôležité poznámky

1. **Expo Go nepodporuje push notifikácie** - musíš použiť development build
2. **Project ID je kritické** - musí byť rovnaké v `app.json` a `notificationService.ts`
3. **Environment variables** - musia byť nastavené v `mobile/.env`
4. **Development build** - na testovanie stačí development build (bezplatné)
5. **Production build** - pre iOS potrebuješ Apple Developer účet ($99/rok)
6. **Expo Push Service** - je zadarmo a podporuje milióny notifikácií

---

## 📞 Support

Ak máš problémy:

1. Skontroluj konzolu v aplikácii (React Native Debugger)
2. Skontroluj Supabase logs (Dashboard → Logs)
3. Skontroluj edge function logs (Dashboard → Edge Functions → Logs)
4. Testuj edge function manuálne cez curl

---

**Notifikácie sú pripravené na použitie!** 🎉

Stačí vytvoriť development build a testovať.
