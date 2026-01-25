# Fix untuk Error "Unmatched Route"

## Masalah yang Terjadi

Ketika app pertama kali dibuka, muncul error:

```
Unmatched Route Page could not be found.
artha:///
```

## Root Cause

Flow authentication tidak konsisten, menyebabkan routing tidak tahu harus render screen apa.

## Fix yang Dilakukan

1. **Perbaiki `app/_layout.tsx`:**
   - Tambah `ActivityIndicator` saat app loading (state lebih jelas)
   - Perbaiki logic `useEffect` untuk set initial state berdasarkan auth status
   - Gunakan conditional rendering yang lebih reliable

2. **Logika yang diperbaiki:**
   - Jika `isLoading` → tampilkan loading spinner
   - Jika `!isPinSetup` atau `!isAuthenticated` → tampilkan PIN screen
   - Jika keduanya true → tampilkan main app (tabs routing)

## Langkah Selanjutnya

1. Download APK baru dari:
   https://expo.dev/accounts/adeandro/projects/Artha/builds/e84a6f27-ac17-496e-a4a7-9214c5cda4af

2. Uninstall app lama di HP

3. Install APK baru

4. Test:
   - App should show loading spinner saat start
   - Kemudian show PIN setup/login screen
   - Setelah PIN verified → dashboard tampil normal

## Jika masih error

- Clear app cache: Settings → Apps → Artha → Storage → Clear Cache
- Coba uninstall & install ulang
- Buka terminal dan cek logs: `npx expo start` (di dev mode)
