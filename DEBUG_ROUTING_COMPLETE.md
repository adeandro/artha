# Debug dan Fix untuk Error "Unmatched Route artha:///"

## Analisis Masalah

Setelah deep investigation, ditemukan 3 root cause:

### 1. **Root Layout Logic Error**
**File:** `app/_layout.tsx`
**Masalah:** 
- Initial state `showPinSetup = false` menyebabkan app render Stack (tabs) sebelum auth ready
- Saat Stack render tapi auth masih loading → routing error "artha:///"

**Fix:** 
- Tunggu `isLoading === false` sebelum render anything
- Gunakan explicit conditions: `if (isLoading)` → `if (!isPinSetup)` → `if (!isAuthenticated)` → tabs

### 2. **Auth State After PIN Setup**
**File:** `context/AuthContext.tsx`
**Masalah:**
- Function `setPin()` set `isPinSetup = true` tapi tidak set `isAuthenticated = true`
- Setelah setup PIN, app masih show login screen (tidak langsung ke tabs)

**Fix:**
- Add `setIsAuthenticated(true)` setelah PIN berhasil di-setup

### 3. **State Re-render Trigger**
**File:** `app/_layout.tsx`
**Masalah:**
- Setelah PIN setup/login sukses, root layout tidak re-render
- PinEntryScreen call `onSuccess()` tapi tidak trigger parent re-render

**Fix:**
- Add `renderKey` state yang di-update setiap kali `isAuthenticated`, `isPinSetup`, atau `isLoading` berubah
- Pass callback `setRenderKey((p) => p + 1)` ke PinEntryScreen `onSuccess`

## Perubahan Kode

### app/_layout.tsx
```typescript
// Sebelum: showPinSetup initial = false (SALAH)
const [showPinSetup, setShowPinSetup] = useState(false);

// Sesudah: Gunakan renderKey untuk force update
const [renderKey, setRenderKey] = useState(0);

useEffect(() => {
  // Force re-render when auth state changes
  setRenderKey((prev) => prev + 1);
}, [isAuthenticated, isPinSetup, isLoading]);

// Kondisi render logic:
if (isLoading) return <LoadingScreen />;      // 1. Tunggu auth init
if (!isPinSetup) return <SetupScreen />;      // 2. Setup PIN
if (!isAuthenticated) return <LoginScreen />; // 3. Login
return <MainApp />;                          // 4. Show tabs
```

### context/AuthContext.tsx
```typescript
const setPin = useCallback(
  async (newPin: string): Promise<boolean> => {
    // ... setup logic ...
    setIsPinSetup(true);
    setIsAuthenticated(true); // ← FIX: Auto-authenticate
    return true;
  },
  [setPinHash],
);
```

## Flow Perbaikan

### Sebelumnya (BROKEN):
```
App Start
  ↓
Root Layout: showPinSetup = false
  ↓
Render Stack (tabs) IMMEDIATELY
  ↓
Auth Context: Still loading... 
  ↓
Router confused: "artha:///" not found ❌
```

### Sesudah (FIXED):
```
App Start
  ↓
Auth Context: isLoading = true
  ↓
Root Layout: if (isLoading) → show spinner
  ↓
Auth init complete: isLoading = false
  ↓
Root Layout: if (!isPinSetup) → show PIN setup
  ↓
User setup PIN
  ↓
Auth Context: isPinSetup = true, isAuthenticated = true
  ↓
Root Layout: render Stack (tabs) ✅
```

## Testing Checklist

- [ ] Download APK baru
- [ ] Uninstall app lama
- [ ] Install APK baru
- [ ] App start → show loading spinner (✅ jangan langsung crash)
- [ ] Spinner → PIN setup screen (✅ clear transition)
- [ ] Setup PIN 6 digit
- [ ] Confirm PIN match
- [ ] After confirm → Dashboard appears (✅ NO MORE ERROR)
- [ ] Try add transaction
- [ ] Logout & test login

## Debug Tips

Jika masih error, coba:
1. `adb logcat | grep -i error` - lihat Android logs
2. Open Expo Go dev menu: shake phone → "View Error"
3. Check browser console if testing on web
4. Clear AsyncStorage: `DELETE ARTHA DATA` setting di phone
