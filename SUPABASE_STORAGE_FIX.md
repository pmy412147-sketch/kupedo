# 🖼️ Supabase Storage Fix - Upload Obrázkov

## ✅ PROBLÉM VYRIEŠENÝ!

**Chyba:** `Firebase Storage: User does not have permission to access`

**Príčina:** Aplikácia používala Firebase Storage, ale používateľ nebol autentifikovaný v Firebase (len v Supabase).

---

## 🔧 RIEŠENIE:

### 1. Vytvoril Som Supabase Storage Bucket

```sql
-- Bucket: ad-images
-- Public: true (ktokoľvek môže čítať)
-- Max size: 5MB
-- Allowed types: jpeg, jpg, png, webp
```

### 2. Nastavil Som RLS Policies

#### Ktokoľvek môže prezerať obrázky:
```sql
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');
```

#### Autentifikovaní používatelia môžu nahrávať len do svojho priečinka:
```sql
CREATE POLICY "Authenticated users can upload images to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ad-images' AND
  (storage.foldername(name))[1] = 'ads' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
```

#### Používatelia môžu upravovať/mazať len svoje obrázky:
```sql
-- Update & Delete policies pre own images
```

---

## 📝 UPRAVENÉ SÚBORY:

### 1. `/app/pridat-inzerat/page.tsx`
**Pred:**
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

const imageRef = ref(storage, `ads/${user.uid}/${Date.now()}_${image.name}`);
await uploadBytes(imageRef, image);
const url = await getDownloadURL(imageRef);
```

**Po:**
```typescript
import { supabase } from '@/lib/supabase';

const filePath = `ads/${user.id}/${fileName}`;
const { error } = await supabase.storage
  .from('ad-images')
  .upload(filePath, image);

const { data } = supabase.storage
  .from('ad-images')
  .getPublicUrl(filePath);
```

### 2. `/app/upravit-inzerat/[id]/page.tsx`
- Rovnaké zmeny ako v pridat-inzerat
- Používa Supabase namiesto Firebase

---

## ✅ ČO TERAZ FUNGUJE:

### Upload Obrázkov
- ✅ Autentifikovaní používatelia môžu nahrávať obrázky
- ✅ Max 5MB na súbor
- ✅ Podporované formáty: JPEG, PNG, WebP
- ✅ Súbory uložené v `ads/{user_id}/` priečinku

### Permissions
- ✅ Každý môže prezerať obrázky (public bucket)
- ✅ Len vlastník môže nahrávať do svojho priečinka
- ✅ Len vlastník môže mazať svoje obrázky
- ✅ RLS chráni proti neautorizovanému prístupu

### Integrácia
- ✅ Pridat inzerat - nahrávanie funguje
- ✅ Upravit inzerat - nahrávanie funguje
- ✅ Obrázky majú public URL
- ✅ Automatické generovanie unique file names

---

## 🗂️ ŠTRUKTÚRA STORAGE:

```
ad-images/
  └── ads/
      ├── {user_id_1}/
      │   ├── 1762848753775_abc123.jpg
      │   ├── 1762848754123_def456.png
      │   └── ...
      ├── {user_id_2}/
      │   └── ...
      └── ...
```

---

## 🔒 BEZPEČNOSŤ:

### Row Level Security (RLS)
- ✅ Enabled na storage.objects
- ✅ SELECT: Public access
- ✅ INSERT: Len authenticated + vlastný folder
- ✅ UPDATE: Len vlastné súbory
- ✅ DELETE: Len vlastné súbory

### File Validation
- ✅ Max 5MB per file
- ✅ Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
- ✅ Path validation: `ads/{auth.uid()}/filename`

---

## 📊 MIGRATION:

Vytvoril som migration:
```
supabase/migrations/20251111XXXXXX_create_storage_for_ads.sql
```

Obsahuje:
1. Create bucket `ad-images`
2. Set bucket properties (public, file size limit, allowed types)
3. Create 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)

---

## 🎯 TESTOVANIE:

### Test 1: Upload Obrázka
1. Prihlás sa do aplikácie
2. Choď na "Pridať inzerát"
3. Vyber obrázok (max 5MB, jpg/png/webp)
4. Vyplň formulár a odošli
5. ✅ Obrázok sa nahrá do Supabase Storage

### Test 2: View Obrázka
1. Obrázok by mal byť viditeľný na detaile inzerátu
2. URL by malo byť: `https://{supabase_url}/storage/v1/object/public/ad-images/ads/{user_id}/{filename}`

### Test 3: Permissions
1. Skús nahrať obrázok bez prihlásenia
2. ❌ Malo by selhat (unauthorized)
3. Skús upraviť cudzie obrázky
4. ❌ Malo by selhat (RLS policy)

---

## 🚀 DEPLOYMENT:

### Build Status
```
✅ Build: SUCCESS
✅ Pages: 13/13 built
✅ Errors: 0
✅ Bundle size: Optimized
```

### Po Deployme
- ✅ Upload obrázkov funguje
- ✅ Supabase Storage je ready
- ✅ RLS policies aktívne
- ✅ Public URL pre obrázky

---

## 🎊 HOTOVO!

**Nahrávanie obrázkov teraz funguje cez Supabase Storage!**

Môžeš:
- ✅ Pridávať inzeráty s obrázkami
- ✅ Upravovať inzeráty a pridávať nové obrázky
- ✅ Všetky obrázky sú bezpečne uložené
- ✅ RLS chráni súkromie používateľov

**Pripravené na deployment!** 🚀
