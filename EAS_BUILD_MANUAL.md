# 🔨 EAS BUILD PREVIEW - MANUAL SETUP

Karena terminal sedang busy, berikut langkah-langkah untuk build Android preview secara manual:

## Prerequisites

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Login ke Expo account**:
```bash
eas login
```

3. **Verify credentials**:
```bash
eas whoami
```

## Build Command

Jalankan di terminal (PowerShell atau CMD):

```bash
cd c:\development\Artha
eas build -p android --profile preview
```

## Apa yang Akan Terjadi

1. EAS akan validate project configuration
2. Build queue di cloud Expo
3. Android build diproses (waktu: 5-15 menit)
4. APK preview generated
5. Download link diberikan di terminal

## Config yang Sudah Siap

✅ **eas.json** - Profile preview sudah configured:
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

✅ **app.json** - Package name sudah set:
- `com.adeandro.Artha`

✅ **All 4 UI improvements** - Sudah implemented di codebase

## Setelah Build Selesai

1. Klik link download APK dari EAS dashboard
2. Transfer ke Android device/emulator
3. Install APK
4. Jalankan Artha app
5. Verify semua 4 UI improvements:
   - ✅ Red balance card + minus symbol
   - ✅ Large notes textarea (5 lines)
   - ✅ Keyboard-safe category modal
   - ✅ Category icon picker (12 emojis)

## Troubleshooting

### Build gagal dengan "Unauthenticated"
```bash
eas logout
eas login
```

### Build gagal dengan "no profile configured"
Jalankan dengan explicit profile:
```bash
eas build -p android --profile preview --clear-cache
```

### Build stuck
Bisa cancel dengan `Ctrl+C` dan retry setelah beberapa menit

## Alternative: Quick Web Preview (Jika tidak perlu Android)

```bash
cd c:\development\Artha
npm install
npm run web
```

Browser akan buka dengan Artha web preview (semua UI improvements juga visible)

---

**Status**: Siap build! Semua code sudah verified error-free. ✅

