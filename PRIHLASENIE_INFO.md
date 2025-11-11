# Prihlásenie do Aplikácie

## ⚠️ Google Prihlásenie Dočasne Vypnuté

Google OAuth prihlásenie bolo dočasne odstránené, pretože vyžaduje konfiguráciu v Supabase Admin Console.

## 📧 Prihlásenie cez Email

Momentálne je dostupné **prihlásenie cez email a heslo**.

### Existujúci testovací účet:
- **Email:** `prapavy@gmail.com`
- **Heslo:** *(musíte vedieť alebo vytvoriť nový účet)*

### Vytvorenie nového účtu:
1. Kliknite na "Registrácia"
2. Vyplňte:
   - Meno
   - Email
   - Heslo (min. 6 znakov)
3. Kliknite "Registrovať"
4. Účet bude vytvorený okamžite

## 🔧 Ako Aktivovať Google Prihlásenie

Ak chcete aktivovať Google OAuth prihlásenie, musíte:

### 1. V Supabase Admin Console:
   - Prejdite do **Authentication** → **Providers**
   - Zapnite **Google** provider
   - Nastavte **Authorized Client IDs**
   - Skopírujte **Redirect URL**

### 2. V Google Cloud Console:
   - Vytvorte nový projekt
   - Aktivujte Google+ API
   - Vytvorte OAuth 2.0 Client ID
   - Pridajte Supabase redirect URL do **Authorized redirect URIs**
   - Skopírujte Client ID a Client Secret

### 3. Vložte credentials do Supabase:
   - Vložte Client ID
   - Vložte Client Secret
   - Uložte zmeny

### 4. Aktivujte Google button v kóde:
   V `components/AuthModal.tsx` odkomentujte:
   ```tsx
   <Button
     onClick={handleGoogleSignIn}
     variant="outline"
     className="w-full"
   >
     <Chrome className="mr-2 h-4 w-4" />
     Pokračovať s Google
   </Button>
   ```

## ✅ Čo Funguje

### Email/Password Auth:
- ✅ Registrácia nového účtu
- ✅ Prihlásenie existujúceho účtu
- ✅ Odhlásenie
- ✅ Automatické vytvorenie profilu
- ✅ Session management

### Po prihlásení máte prístup k:
- ✅ Pridávanie inzerátov
- ✅ Upravovanie profilu
- ✅ Obľúbené inzeráty
- ✅ Správy (chat)
- ✅ Moje inzeráty
- ✅ Nastavenia účtu

## 📝 Poznámky

- Email verifikácia je vypnutá pre rýchlejší vývoj
- Po registrácii ste okamžite prihlásení
- Session je uložená v localStorage
- Auto-refresh tokenu funguje automaticky

## 🐛 Riešenie Problémov

### "Email already registered"
- Použite iný email alebo sa prihláste

### "Invalid login credentials"
- Skontrolujte správnosť emailu a hesla
- Heslo musí mať min. 6 znakov

### "User not found"
- Musíte sa najprv zaregistrovať
- Kliknite na "Registrácia" a vytvorte účet
