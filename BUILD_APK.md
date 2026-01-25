# Panduan Build APK dengan EAS

## Persyaratan

- Akun Expo (gratis)
- CLI EAS terinstall
- Android Keystore (akan dibuat otomatis oleh EAS)

## Langkah-Langkah Build APK

### 1. Login ke Expo

```bash
npx expo login
```

Masukkan credentials Expo Anda (buat akun gratis di https://expo.dev jika belum punya)

### 2. Setup EAS untuk Project Ini

File `eas.json` sudah dikonfigurasi dengan:

- **preview profile**: Untuk testing sebelum production
- **production profile**: Untuk release final
- Format build: **APK** (installable di Android)

### 3. Build APK

```bash
# Build preview APK (untuk testing)
npx eas build --platform android --profile preview

# Build production APK (untuk release)
npx eas build --platform android --profile production
```

### 4. Download APK

Setelah build selesai:

1. Link download akan ditampilkan di terminal
2. Atau cek di https://expo.dev → Project Anda → Builds
3. Download APK dan install di device/emulator Android

## Setup Keystore (One-Time)

Pada build pertama, EAS akan:

- Membuat Android Keystore otomatis
- Menyimpannya di server EAS (aman & terlindungi)
- Menggunakannya untuk semua build selanjutnya

## Opsi Alternatif untuk Build Local

Jika ingin build di local Windows tanpa EAS:

1. Install Android Studio + Android SDK
2. Setup Java Development Kit (JDK)
3. Jalankan: `eas build --platform android --local`
4. Butuh setup development environment yang kompleks

## Status Konfigurasi EAS

✅ eas.json sudah dikonfigurasi
✅ APK build profile aktif
✅ Ready untuk build via cloud
