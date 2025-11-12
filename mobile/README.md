# Kupedo Mobile App

Mobilná aplikácia pre Kupedo marketplace postavená na React Native a Expo.

## 🚀 Rýchly štart

### Predpoklady

- Node.js 16+
- npm alebo yarn
- Expo Go aplikácia na vašom telefóne ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Inštalácia

1. **Nainštalujte závislosti:**
```bash
cd mobile
npm install
```

2. **Vytvorte `.env` súbor:**
```bash
cp .env.example .env
```

Vyplňte Supabase údaje:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Spustite vývojový server:**
```bash
npm start
```

4. **Naskenujte QR kód:**
- Android: Otvorte Expo Go a naskenujte QR kód
- iOS: Otvorte Kameru a naskenujte QR kód

## 📱 Funkcie

### Základné funkcie
- ✅ Registrácia a prihlásenie
- ✅ Prezeranie inzerátov
- ✅ Vyhľadávanie a filtrovanie
- ✅ Detail inzerátu
- ✅ Pridanie nového inzerátu
- ✅ Real-time chat
- ✅ Obľúbené inzeráty
- ✅ Profil používateľa

### Kategórie
- Elektronika
- Autá
- Nehnuteľnosti
- Oblečenie
- Nábytok
- Šport

## 🏗️ Štruktúra projektu

```
mobile/
├── src/
│   ├── screens/          # Obrazovky aplikácie
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── AdListScreen.tsx
│   │   ├── AdDetailScreen.tsx
│   │   ├── CreateAdScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── contexts/         # React context
│   │   └── AuthContext.tsx
│   ├── lib/             # Utilities
│   │   └── supabase.ts
│   └── components/      # Znovupoužiteľné komponenty
├── App.tsx              # Hlavný vstupný bod
├── app.json            # Expo konfigurácia
├── package.json        # Závislosti
└── README.md          # Tento súbor
```

## 🛠️ Skripty

```bash
npm start        # Spustí Expo dev server
npm run android  # Spustí na Android emulátore
npm run ios      # Spustí na iOS simulátore
npm run web      # Spustí vo webovom prehliadači
```

## 📦 Build pre produkciu

### Android APK

1. Nainštalujte Expo CLI:
```bash
npm install -g eas-cli
```

2. Vytvorte EAS účet a prihláste sa:
```bash
eas login
```

3. Build APK:
```bash
eas build --platform android --profile preview
```

### iOS IPA

```bash
eas build --platform ios --profile preview
```

## 🔧 Konfigurácia

### Supabase
Aplikácia používa Supabase pre:
- Autentifikáciu používateľov
- Databázu inzerátov
- Real-time chat
- Úložisko obrázkov

### Push notifikácie
Push notifikácie sú nakonfigurované cez Expo Notifications.

## 📝 Poznámky

- Aplikácia zdieľa databázu s webovou verziou Kupedo
- Všetky zmeny sú synchrónne medzi platformami
- Real-time chat funguje cez Supabase Realtime

## 🐛 Riešenie problémov

### Aplikácia sa nespustí
```bash
npm start -- --clear
```

### Problémy s QR kódom
- Uistite sa, že telefón a počítač sú na rovnakej WiFi sieti
- Reštartujte Expo dev server

### Chyby buildu
```bash
rm -rf node_modules
npm install
```

## 📱 Kontakt

Pre viac informácií navštívte web: [kupedo.sk](https://kupedo.sk)
