# Rýchly štart - Kupedo Mobile

## ⚠️ DÔLEŽITÉ: Lokálne testovanie

Táto mobilná aplikácia je určená na **lokálne testovanie** na vašom počítači.

### Čo potrebujete:

1. **Váš vlastný počítač** (Windows/Mac/Linux)
2. **Smartfón** s aplikáciou Expo Go
3. **Rovnakú WiFi sieť** pre počítač aj telefón

## 📱 Kroky na spustenie

### 1. Nainštalujte závislosti
```bash
cd mobile
npm install
```

### 2. Nainštalujte Expo Go na telefón

**Android:**
- [Google Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

**iOS:**
- [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)

### 3. Spustite server
```bash
npm start
```

### 4. Pripojte telefón

V termináli sa zobrazí QR kód.

**Android:**
1. Otvorte **Expo Go**
2. Kliknite **"Scan QR code"**
3. Naskenujte QR kód

**iOS:**
1. Otvorte **Kameru**
2. Naskenujte QR kód
3. Kliknite **"Open in Expo Go"**

## 🚀 Alternatíva: Tunnel režim

Ak QR kód nefunguje:
```bash
npm run start:tunnel
```

## 📦 Production build

Pre APK/IPA:
```bash
npm install -g eas-cli
eas build --platform android
```

## Viac info

- [Expo docs](https://docs.expo.dev/)
