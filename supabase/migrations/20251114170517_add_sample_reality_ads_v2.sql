/*
  # Pridanie vzorových reality inzerátov pre testovanie

  ## Účel
  Táto migrácia pridáva vzorové 3-izbové byty v Bratislave pre testovanie AI chatbot funkcionality.
  Umožňuje otestovať, či AI chatbot dokáže správne nájsť inzeráty na query ako:
  "ahoj najdi mi byt 3 izbovy bratislava do 250000"

  ## Nové dáta
  1. Testovací používateľ pre vzorové inzeráty (cez auth.users)
  2. 6 vzorových 3-izbových bytov v Bratislave:
     - Rôzne ceny (od 165,000€ do 280,000€)
     - Rôzne časti Bratislavy
     - Kompletné metadata (rooms, propertyType, area)
     - Kvalitné popisy pre text search

  ## Poznámky
  - Všetky inzeráty majú status 'active'
  - Kategória je nastavená na 'reality'
  - Metadata obsahujú štruktúrované informácie o počte izieb
  - Popis obsahuje kľúčové slová pre full-text search
*/

-- Vytvorenie testovacieho používateľa cez auth.users
DO $$
DECLARE
  test_user_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Skontrolovať, či používateľ už existuje
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
    -- Vytvoriť používateľa v auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'sample.ads@kupado.sk',
      crypt('sample_password_123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Vzorové Inzeráty"}',
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Vytvoriť profil
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
    INSERT INTO profiles (id, display_name, email)
    VALUES (
      test_user_id,
      'Vzorové Inzeráty',
      'sample.ads@kupado.sk'
    );
  END IF;
END $$;

-- Pridanie vzorových 3-izbových bytov v Bratislave
INSERT INTO ads (
  id,
  user_id,
  title,
  description,
  category_id,
  price,
  location,
  postal_code,
  status,
  metadata,
  created_at,
  updated_at
) VALUES
-- Byt 1: 3-izbový v Starom Meste - pod 250,000€
(
  'a0000001-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '3-izbový byt v centre Bratislavy',
  'Ponúkam na predaj krásny 3-izbový byt v centre Bratislavy. Byt je po kompletnej rekonštrukcii a nachádza sa v tichej lokalite Starého Mesta. Dispozícia bytu je ideálna pre rodinu - priestranná obývacia izba s kuchynským kútom, dve samostatné spálne, kúpeľňa s vaňou a WC. Byt má balkón s výhľadom do dvora. K bytu patrí pivnica. Výborná občianska vybavenosť, v blízkosti škôlky, školy, obchody, športoviská. Výborná dopravná dostupnosť.',
  'reality',
  220000,
  'Bratislava - Staré Mesto',
  '81101',
  'active',
  '{"rooms": 3, "roomCount": 3, "propertyType": "byt", "area": 75, "floor": 3, "condition": "po rekonštrukcii", "heating": "ústredné", "furnished": false, "balcony": true, "cellar": true, "parking": false}',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),

-- Byt 2: 3-izbový v Petržalke - lacnejší variant
(
  'a0000001-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Priestranný 3-izbový byt Petržalka',
  'Predám 3-izbový byt v Petržalke na ulici Vietnamská. Byt má rozlohu 68 m2 a nachádza sa na 8. poschodí. Dispozícia: obývacia izba, 2 spálne, kuchyňa, kúpeľňa, WC, 2 loggie. Pôvodný stav, vhodný na rekonštrukciu podľa vlastných predstáv. V blízkosti kompletná občianska vybavenosť - obchody, škôlka, škola, lekár, autobusová zastávka. Dobrá investičná príležitosť. Voľný ihneď.',
  'reality',
  180000,
  'Bratislava - Petržalka',
  '85101',
  'active',
  '{"rooms": 3, "roomCount": 3, "propertyType": "byt", "area": 68, "floor": 8, "condition": "pôvodný stav", "heating": "ústredné", "furnished": false, "balcony": true, "cellar": true, "parking": true}',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),

-- Byt 3: 3-izbový v Ružinove - stredná cenová kategória
(
  'a0000001-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  '3-izbový byt s parkovacím miestom, Ružinov',
  'Na predaj 3-izbový byt v tichej lokalite Ružinova. Byt má 72 m2, je čiastočne zrekonštruovaný. Dispozícia: priestranná obývacia izba s kuchynským kútom, dve spálne, kúpeľňa, samostatné WC, komora, lodžia. Plastové okná, nová kúpeľňa, podlahové kúrenie v kúpeľni. K bytu prislúcha pivnica a vyhradené parkovacie miesto. Orientácia bytu juh-východ. Výborná dostupnosť MHD, v okolí škôlka, škola, obchody, parky.',
  'reality',
  235000,
  'Bratislava - Ružinov',
  '82101',
  'active',
  '{"rooms": 3, "roomCount": 3, "propertyType": "byt", "area": 72, "floor": 5, "condition": "čiastočná rekonštrukcia", "heating": "ústredné", "furnished": false, "balcony": true, "cellar": true, "parking": true}',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),

-- Byt 4: 3-izbový v Karlovej Vsi - nad 250,000€
(
  'a0000001-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Kompletne zrekonštruovaný 3-izbový byt, Karlova Ves',
  'Exkluzívna ponuka 3-izbového bytu v Karlovej Vsi. Byt má 80 m2 a prešiel kompletnou rekonštrukciou. Nová kuchyňa na mieru, nové kúpeľne, podlahy, dvere, rozvody. Dispozícia: veľká obývacia izba s kuchyňou, 2 spálne, kúpeľňa s vaňou, samostatné WC s prípravou pre práčku, 2 balkóny. Byt je zariadený, možnosť predaja vrátane zariadenia. Pivnica, možnosť dokúpenia garážového státia v suteréne domu. Výborná lokalita pri Horskom parku.',
  'reality',
  280000,
  'Bratislava - Karlova Ves',
  '84104',
  'active',
  '{"rooms": 3, "roomCount": 3, "propertyType": "byt", "area": 80, "floor": 4, "condition": "kompletná rekonštrukcia", "heating": "ústredné", "furnished": true, "balcony": true, "cellar": true, "parking": false}',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),

-- Byt 5: 3-izbový v Novom Meste - dobrá ponuka pod 250,000€
(
  'a0000001-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Slnečný 3-izbový byt Nové Mesto',
  '3-izbový byt na predaj v Novom Meste, lokalita Ahoj. Byt má 70 m2, nachádza sa na 6. poschodí panelového domu. Byt je svetlý, orientácia juh. Dispozícia: obývacia izba, 2 izby, kuchyňa, kúpeľňa s WC, komora, lodžia. Plastové okná, čiastočná rekonštrukcia kúpeľne. V blízkosti OC Avion, MHD zastávka, škôlka, škola. Byt je vhodný aj na investíciu. Voľný od júna 2025.',
  'reality',
  195000,
  'Bratislava - Nové Mesto',
  '83101',
  'active',
  '{"rooms": 3, "roomCount": 3, "propertyType": "byt", "area": 70, "floor": 6, "condition": "čiastočná rekonštrukcia", "heating": "ústredné", "furnished": false, "balcony": true, "cellar": true, "parking": false}',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
),

-- Byt 6: 3-izbový v Dúbravke - najlacnejší variant
(
  'a0000001-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  '3-izbový byt Dúbravka, výhodná cena',
  'Predaj 3-izbového bytu v Dúbravke. Byt má 65 m2, je v pôvodnom stave, ideálny na rekonštrukciu. Dispozícia: obývacia izba, 2 izby, kuchyňa, kúpeľňa s WC, 2 lodžie. Výhodou bytu je nízka cena a dobrá lokalita s občianskou vybavenosťou. V blízkosti škôlka, škola, obchody, lekár, zastávky MHD. Pokojná lokalita pri lese. Možnosť skorého nasťahovania.',
  'reality',
  165000,
  'Bratislava - Dúbravka',
  '84101',
  'active',
  '{"rooms": 3, "roomCount": 3, "propertyType": "byt", "area": 65, "floor": 4, "condition": "pôvodný stav", "heating": "ústredné", "furnished": false, "balcony": true, "cellar": true, "parking": false}',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
)
ON CONFLICT (id) DO NOTHING;
