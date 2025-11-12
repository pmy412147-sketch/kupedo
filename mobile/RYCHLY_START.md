# Rýchly štart - Kupedo Mobile

## 1. Nainštalujte Expo Go na telefón

### Android
- Otvorte **Google Play Store**
- Vyhľadajte **"Expo Go"**
- Nainštalujte aplikáciu

### iOS
- Otvorte **App Store**
- Vyhľadajte **"Expo Go"**
- Nainštalujte aplikáciu

## 2. Spustite aplikáciu

```bash
cd mobile
npm install
npm start
```

## 3. Naskenujte QR kód

V termináli sa zobrazí QR kód.

**Android:**
1. Otvorte aplikáciu **Expo Go**
2. Kliknite na **"Scan QR code"**
3. Naskenujte QR kód z terminálu

**iOS:**
1. Otvorte natívnu **Kameru**
2. Naskenujte QR kód
3. Kliknite na notifikáciu **"Open in Expo Go"**

## Problémy?

### Nevidíte QR kód?
```bash
npx expo start --tunnel
```

### Aplikácia sa nespustí?
```bash
npm start -- --clear
```

### Ešte stále problémy?
- Skontrolujte či máte nainštalovanú aplikáciu **Expo Go**
- Uistite sa, že telefón a počítač sú na rovnakej WiFi sieti
- Skúste reštartovať server

## To je všetko!

Aplikácia by sa teraz mala otvoriť na vašom telefóne a môžete začať testovať!
