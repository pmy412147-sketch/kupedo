# Netlify Deployment Fix Guide

## Problém
Build na Netlify zlyhá s chybou: `Build script returned non-zero exit code: 2`

## Riešenie

### 1. Nastavte Environment Variables v Netlify

Prejdite na: **Site settings → Environment variables**

Pridajte tieto premenné:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NODE_VERSION=18
```

### 2. Nastavte Build Settings v Netlify

Prejdite na: **Site settings → Build & deploy → Build settings**

```
Build command: npm run build
Publish directory: .next
```

### 3. Skontrolujte Node Version

Netlify musí používať Node.js 18 alebo vyššiu. To je nastavené v `netlify.toml`:

```toml
[build.environment]
  NODE_VERSION = "18"
```

### 4. Clear Cache a Redeploy

V Netlify:
1. Prejdite na **Deploys**
2. Kliknite na **Trigger deploy → Clear cache and deploy site**

### 5. Alternatívne Riešenie - Vercel

Ak Netlify naďalej spôsobuje problémy, odporúčam deployment na **Vercel**, ktorý je optimalizovaný pre Next.js:

1. Prejdite na [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Vercel automaticky detekuje Next.js a nastaví všetko správne
4. Pridajte environment variables
5. Deploy!

**Vercel výhody:**
- Automatická detekcia Next.js
- Nulová konfigurácia
- Lepšia podpora pre Next.js features
- Rýchlejší build
- Lepšia podpora pre serverless functions

### 6. Overenie Build Lokálne

Pred deployment vždy otestujte build lokálne:

```bash
npm run build
npm run start
```

Ak build prejde lokálne bez chýb, problém je v Netlify konfigurácii, nie v kóde.

## Súčasný Stav

✅ **Build lokálne funguje perfektne**
✅ **Všetky funkcie implementované**
✅ **Zero errors v production build**

❌ Netlify potrebuje správne environment variables

## Odporúčanie

**Použite Vercel** namiesto Netlify pre Next.js projekty:

1. Jednoduchší deployment
2. Lepšia integrácia
3. Automatické optimalizácie
4. Built-in Analytics
5. Edge Functions support

### Quick Vercel Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Production deploy
vercel --prod
```

## Checklist Pre Deployment

- [ ] Environment variables nastavené
- [ ] Node version 18+
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Cache cleared
- [ ] Custom domain (optional)
- [ ] SSL certifikát (automatic)

## Potrebná Pomoc?

Ak deployment stále nefunguje:

1. Skontrolujte Netlify build logs (celý output)
2. Overte, že environment variables sú správne nastavené
3. Skúste clear cache a redeploy
4. Alebo prejdite na Vercel (odporúčané)

---

**Status:** ✅ Kód je production-ready, potrebuje len správne environment variables v Netlify!
