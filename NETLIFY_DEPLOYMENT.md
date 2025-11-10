# Netlify Deployment - Kupado.sk

## Krok 1: Priprava Netlify účtu

1. **Prihláste sa na Netlify**
   - Prejdite na: https://www.netlify.com/
   - Kliknite **Sign up** alebo **Log in**
   - Prihláste sa cez GitHub, GitLab alebo email

## Krok 2: Pripojenie Git repozitára

1. **Nahrajte projekt na Git**

   Ak ešte nemáte projekt na Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <váš-git-url>
   git push -u origin main
   ```

2. **Import do Netlify**
   - V Netlify dashboard kliknite **Add new site**
   - Vyberte **Import an existing project**
   - Vyberte vášho Git providera (GitHub/GitLab/Bitbucket)
   - Povoľte prístup k repozitáru
   - Vyberte váš projekt

## Krok 3: Konfigurácia Build Settings

Netlify by malo automaticky detekovať Next.js, ale overťe tieto nastavenia:

### Build settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`

⚠️ **DÔLEŽITÉ**: Netlify automaticky detekuje Next.js projekt z `netlify.toml` súboru. **NEMUSÍTE** manuálne nastavovať build command ani publish directory - Netlify to spraví za vás!

### Environment Variables:

Pridajte tieto premenné v **Site settings > Environment variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://pgktuyehfwwsjqbvndjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBna3R1eWVoZnd3c2pxYnZuZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTc4MDAsImV4cCI6MjA3Nzk5MzgwMH0.xFC-JqLUFlpvugPdZNaEGDKC_Tivd56uDcwy43ki5bQ
```

## Krok 4: Deploy

1. **Spustite deployment**
   - Kliknite **Deploy site**
   - Netlify automaticky:
     - Nainštaluje dependencies (`npm install`)
     - Spustí build (`npm run build`)
     - Nasadí aplikáciu

2. **Sledujte progress**
   - Môžete sledovať build logs v reálnom čase
   - Build by mal trvať 2-5 minút

## Krok 5: Nastavenie vlastnej domény (voliteľné)

1. **Pridajte vlastnú doménu**
   - V Site settings prejdite na **Domain management**
   - Kliknite **Add custom domain**
   - Zadajte: `kupado.sk` alebo `www.kupado.sk`

2. **Nastavte DNS**

   U vášho domain registrára pridajte tieto DNS záznamy:

   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: <váš-netlify-site>.netlify.app
   ```

3. **SSL certifikát**
   - Netlify automaticky vytvorí Let's Encrypt SSL certifikát
   - HTTPS bude fungovať do 24 hodín

## Krok 6: Supabase Callback URL

Po deploymente **MUSÍTE** pridať Netlify URL do Supabase:

1. **Prejdite do Supabase Dashboard**
   - Authentication > URL Configuration

2. **Pridajte Site URL**
   ```
   https://kupado.sk
   alebo
   https://váš-site.netlify.app
   ```

3. **Pridajte Redirect URLs**
   ```
   https://kupado.sk/**
   https://váš-site.netlify.app/**
   ```

## Automatické Deployments

Po nastavení bude každý push do Git automaticky:
1. Spustiť nový build
2. Otestovať aplikáciu
3. Nasadiť novú verziu

### Branch deployments:
- `main` branch → Production
- Ostatné branches → Preview deployments

## Riešenie problémov

### Problem: Build fails
**Riešenie**: Skontrolujte environment variables v Netlify dashboard

### Problem: "Cannot read environment variables"
**Riešenie**: Uistite sa, že všetky `NEXT_PUBLIC_*` premenné sú nastavené

### Problem: Authentication nefunguje
**Riešenie**: Pridajte Netlify URL do Supabase redirect URLs

### Problem: 404 errors
**Riešenie**: Netlify plugin pre Next.js by mal byť v `netlify.toml`:
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Optimalizácie

### 1. Build Performance
V `netlify.toml` môžete pridať:
```toml
[build.environment]
  NODE_OPTIONS = "--max_old_space_size=4096"
```

### 2. Image Optimization
Netlify automaticky optimalizuje obrázky cez Netlify Image CDN.

### 3. Caching
Next.js automaticky cachuje statické assety pre rýchlejšie načítanie.

## Monitoring

1. **Analytics**
   - Site settings > Analytics
   - Aktivujte Netlify Analytics pre sledovanie návštevnosti

2. **Performance**
   - Netlify automaticky meria Core Web Vitals
   - Lighthouse score sa zobrazí po každom deploye

3. **Logs**
   - Functions logs pre debugging
   - Deploy logs pre build issues

## Cena

- **Starter (Free)**
  - 100 GB bandwidth/mesiac
  - 300 build minút/mesiac
  - Perfektné pre začiatok

- **Pro ($19/mesiac)**
  - 400 GB bandwidth
  - 1000 build minút
  - Pokročilé funkcie

## Podpora

- Netlify dokumentácia: https://docs.netlify.com/
- Next.js na Netlify: https://docs.netlify.com/frameworks/next-js/
- Community forum: https://answers.netlify.com/

---

**Status**: ✅ Projekt je pripravený na deployment
**Odhadovaný čas deployu**: 3-5 minút
**Netlify kompatibilita**: 100%
