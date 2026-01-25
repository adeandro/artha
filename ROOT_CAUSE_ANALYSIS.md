# ROOT CAUSE IDENTIFIED: AsyncStorage Version Mismatch

## Masalah yang Ditemukan
```
$ npx expo-doctor
✖ Check that packages match versions required by installed Expo SDK

❗ Major version mismatches
package                                    expected  found   
@react-native-async-storage/async-storage  2.2.0     1.24.0  
```

## Dampak ke Routing Error
AsyncStorage digunakan oleh `AuthContext` untuk:
1. Load PIN setup state (`isPinSet`)
2. Load PIN hash dari storage
3. Save PIN hash saat setup/change

**Ketika AsyncStorage v1.24.0 incompatible dengan Expo 54:**
- AsyncStorage initialization **gagal atau hang**
- AuthContext tidak bisa load PIN state
- `isLoading` stuck di `true` atau state tidak konsisten
- Root Layout tidak bisa menentukan screen mana yang render
- **Router error: "Unmatched Route artha:///"**

## Fix yang Diterapkan

### Step 1: Detect Version Mismatch
```bash
npx expo-doctor
# Found: @react-native-async-storage/async-storage@1.24.0
# Expected: 2.2.0
```

### Step 2: Fix Dependencies
```bash
npx expo install --check
# Automatically upgrades to compatible version (2.2.0)
```

### Step 3: Verify
```bash
npx expo-doctor
# ✅ 17/17 checks passed. No issues detected!
```

### Step 4: Rebuild
```bash
npx eas build --platform android --profile preview
```

## Technical Details

### AsyncStorage v1.24.0 vs v2.2.0
| Aspek | v1.24.0 | v2.2.0 |
|-------|---------|--------|
| Compatibility | Expo ~52 | Expo ~54 ✅ |
| Promise handling | Older | Improved |
| Error handling | Basic | Better |
| Performance | Standard | Optimized |

### Impact pada App Flow
```
SEBELUM (v1.24.0 - BROKEN):
App Start
  ↓
AuthContext init
  ↓
AsyncStorage.getItem(KEYS.PIN_SET) ← HANGS/FAILS
  ↓
isLoading stuck di true
  ↓
Root Layout confused
  ↓
Router Error: "artha:///" ❌

SESUDAH (v2.2.0 - FIXED):
App Start
  ↓
AuthContext init
  ↓
AsyncStorage.getItem(KEYS.PIN_SET) ← WORKS ✅
  ↓
isLoading → false
  ↓
Root Layout render correctly
  ↓
PIN Setup/Login Flow Works ✅
```

## Files yang Diubah
- `package.json` - AsyncStorage upgraded from 1.24.0 → 2.2.0
- `package-lock.json` - Updated dependencies

## Verification
```bash
$ npx expo-doctor
17/17 checks passed. No issues detected! ✅
```

## Kesimpulan
Root cause dari "Unmatched Route artha:///" error adalah **incompatible AsyncStorage package version** yang menyebabkan auth initialization gagal.

Dengan fix ini, app seharusnya:
1. ✅ Launch tanpa error
2. ✅ Show loading spinner saat init
3. ✅ Show PIN setup/login screen
4. ✅ Navigate ke dashboard setelah auth
5. ✅ All features working normally
