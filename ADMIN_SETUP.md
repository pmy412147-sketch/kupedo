# Admin Panel Setup - Kupedo.sk

## Ako získať admin prístup

Admin systém je teraz plne implementovaný. Tu je návod, ako nastaviť prvého admin používateľa.

## Krok 1: Vytvorte si účet (ak ešte nemáte)

1. Choďte na https://kupedo.sk
2. Kliknite na "Prihlásiť sa" / "Registrovať sa"
3. Vytvorte si účet s emailom a heslom
4. Zapamätajte si email, ktorý ste použili

## Krok 2: Pridajte admin práva cez Supabase

### Možnosť A: Cez Supabase Dashboard (Odporúčané)

1. Choďte na https://supabase.com/dashboard
2. Prihláste sa a vyberte váš projekt
3. V ľavom menu kliknite na "SQL Editor"
4. Skopírujte a vložte tento SQL príkaz (nahraďte `your-email@example.com` vašim emailom):

```sql
SELECT make_user_admin('your-email@example.com', 'super_admin');
```

5. Kliknite na "Run" alebo stlačte `Ctrl+Enter`
6. Mali by ste vidieť výsledok: `{"success": true, "user_id": "..."}`

### Možnosť B: Priamo cez databázu

Ak preferujete priamy INSERT:

```sql
-- Najprv nájdite user_id pre váš email
SELECT id FROM profiles WHERE email = 'your-email@example.com';

-- Potom pridajte admin záznam (použite user_id z predchádzajúceho príkazu)
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-id-here', 'super_admin');
```

## Krok 3: Prihláste sa do admin panelu

1. Choďte na https://kupedo.sk/admin/login
2. Prihláste sa s emailom a heslom z Kroku 1
3. Budete automaticky presmerovaní na admin dashboard

Alebo:

1. Prihláste sa normálne na hlavnej stránke
2. Choďte priamo na https://kupedo.sk/admin
3. Systém vás automaticky pustí dovnútra (ak máte admin práva)

## Admin Role

Systém podporuje 3 typy admin rolí:

- **super_admin** - Plný prístup, môže pridávať a odoberať iných adminov
- **admin** - Štandardný admin s prístupom k väčšine funkcií
- **moderator** - Obmedzený prístup, hlavne na moderovanie obsahu

## Funkcie admin panelu

V admin paneli máte prístup k:

- **Dashboard** - Prehľad štatistík platformy
- **Inzeráty** - Správa všetkých inzerátov (schvaľovanie, bannovanie, mazanie)
- **Používatelia** - Správa používateľov (bannovannie, úprava mincí)
- **Reporty** - Vyriešenie nahlásených inzerátov
- **Nastavenia** - Systémové nastavenia

## Bezpečnosť

- Všetky admin akcie sú chránené RLS politikami v databáze
- Iba používatelia v tabuľke `admin_users` majú prístup
- Admin layout automaticky kontroluje prístup pri každom načítaní
- Bez admin práv budete presmerovaní na hlavnú stránku

## Problémy?

Ak máte problémy s prihlásením:

1. Uistite sa, že ste správne spustili `make_user_admin()` funkciu
2. Skontrolujte, či sa váš user_id nachádza v tabuľke `admin_users`:
   ```sql
   SELECT * FROM admin_users WHERE user_id IN (
     SELECT id FROM profiles WHERE email = 'your-email@example.com'
   );
   ```
3. Odhláste sa a prihláste sa znova, aby sa načítali nové práva
4. Vyčistite cache prehliadača

## Pridanie ďalších adminov

Keď už máte super_admin prístup, môžete pridať ďalších adminov priamo cez SQL:

```sql
SELECT make_user_admin('another-admin@example.com', 'admin');
```

Alebo vytvorte admin panel stránku pre správu adminov v budúcnosti.
