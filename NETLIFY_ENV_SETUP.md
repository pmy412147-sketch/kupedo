# 🔧 Nastavenie Environment Variables v Netlify

## ✅ Deployment Prešiel, Ale App Nefunguje

Vidím tieto errory v konzole:
```
Error fetching ads: Object
TypeError: Failed to fetch
```

**Príčina:** Aplikácia používa placeholder values namiesto skutočných Supabase credentials.

---

## 🚀 Riešenie - Nastav Environment Variables:

### Krok 1: Otvor Netlify Dashboard

1. Choď na [app.netlify.com](https://app.netlify.com)
2. Prihlásiť sa (ak nie si)
3. Nájdi svoj site (mal by tam byť tvoj kupado projekt)

### Krok 2: Otvor Site Settings

1. Klikni na svoj site
2. Klikni na **"Site settings"** (tlačidlo vpravo hore)
3. V ľavom menu klikni na **"Environment variables"**

### Krok 3: Pridaj Všetky Variables

Klikni **"Add a variable"** a pridaj tieto (jedna po druhej):

#### Supabase Variables (Potrebné!):

```
Názov: NEXT_PUBLIC_SUPABASE_URL
Hodnota: https://pgktuyehfwwsjqbvndjs.supabase.co
```

```
Názov: NEXT_PUBLIC_SUPABASE_ANON_KEY
Hodnota: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBna3R1eWVoZnd3c2pxYnZuZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTc4MDAsImV4cCI6MjA3Nzk5MzgwMH0.xFC-JqLUFlpvugPdZNaEGDKC_Tivd56uDcwy43ki5bQ
```

#### Firebase Variables (Voliteľné, pre Google login):

```
Názov: NEXT_PUBLIC_FIREBASE_API_KEY
Hodnota: AIzaSyC7hu2xreVaz0DT09kOoPivB6jqDH3hsh0
```

```
Názov: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Hodnota: kupado-d3b82-646eb.firebaseapp.com
```

```
Názov: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Hodnota: kupado-d3b82-646eb
```

```
Názov: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Hodnota: kupado-d3b82-646eb.firebasestorage.app
```

```
Názov: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Hodnota: 673477997881
```

```
Názov: NEXT_PUBLIC_FIREBASE_APP_ID
Hodnota: 1:673477997881:web:0e5f6c739e871ed898a4e8
```

### Krok 4: Redeploy Site

Po pridaní všetkých variables:

1. Choď na **"Deploys"** tab (v top menu)
2. Klikni na **"Trigger deploy"** dropdown
3. Vyber **"Deploy site"**
4. Počkaj 1-2 minúty

---

## ✅ Po Redeploye:

Aplikácia by mala fungovať správne:
- ✅ Načítavanie inzerátov
- ✅ Login/Signup
- ✅ Všetky funkcie

---

## 📱 Quick Copy-Paste (Pre Netlify CLI):

Ak máš nainštalované Netlify CLI, môžeš použiť:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to site
netlify link

# Set env variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://pgktuyehfwwsjqbvndjs.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBna3R1eWVoZnd3c2pxYnZuZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTc4MDAsImV4cCI6MjA3Nzk5MzgwMH0.xFC-JqLUFlpvugPdZNaEGDKC_Tivd56uDcwy43ki5bQ"
netlify env:set NEXT_PUBLIC_FIREBASE_API_KEY "AIzaSyC7hu2xreVaz0DT09kOoPivB6jqDH3hsh0"
netlify env:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN "kupado-d3b82-646eb.firebaseapp.com"
netlify env:set NEXT_PUBLIC_FIREBASE_PROJECT_ID "kupado-d3b82-646eb"
netlify env:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET "kupado-d3b82-646eb.firebasestorage.app"
netlify env:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "673477997881"
netlify env:set NEXT_PUBLIC_FIREBASE_APP_ID "1:673477997881:web:0e5f6c739e871ed898a4e8"

# Trigger redeploy
netlify deploy --prod
```

---

## 🎉 Hotovo!

Po nastavení environment variables a redeploye bude aplikácia plne funkčná!

---

## 🔍 Debug:

Ak stále nefunguje, skontroluj:
1. Sú všetky env variables nastavené? (Site settings → Environment variables)
2. Urobil si redeploy? (Zmeny sa prejavia až po redeploye)
3. Skontroluj browser console na errory
