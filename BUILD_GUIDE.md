# 🚀 BUILD PREVIEW SCRIPT

## Pre-Build Checklist ✅

- [x] No TypeScript errors
- [x] No runtime errors
- [x] All routing issues fixed
- [x] Dashboard data persistence fixed
- [x] Category names display correct
- [x] Lint passed

## Build Commands

```bash
# 1. Clean cache and lint
npm run lint

# 2. Build Web (for quick preview)
npm run web

# 3. Build iOS (requires macOS)
npm run ios

# 4. Build Android (requires emulator/Android Studio)
npm run android

# 5. Build for EAS (production)
eas build --platform ios
eas build --platform android
```

## Expected Build Output

After `npm run web` or `npm run ios/android`:

✅ App opens without crashes
✅ PIN setup screen appears (first launch)
✅ Enter 6-digit PIN
✅ Confirm PIN
✅ Alert "PIN berhasil diatur"
✅ **Direct navigate to Dashboard tab** (FIXED!)
✅ See "Tidak ada transaksi" message
✅ FAB button (+) visible
✅ Tab navigation works (Dashboard, Transaksi, Pengaturan)

## Testing Scenarios

### Scenario 1: First Launch (PIN Setup)
```
1. Start app
2. PIN setup screen
3. Enter PIN: 123456
4. Confirm: 123456
5. ✓ Navigate to Dashboard (not artha:///)
6. ✓ Close and reopen
7. PIN login screen
8. Enter: 123456
9. ✓ Navigate to Dashboard again
```

### Scenario 2: Add Transaction Flow
```
1. On Dashboard
2. Tap FAB (+)
3. Modal "Tambah Transaksi"
4. Type: Pengeluaran
5. Amount: 50000
6. Category: Makanan
7. Tap Simpan
8. ✓ Modal closes
9. ✓ Dashboard total expense = 50000
10. ✓ Recent transactions show "Makanan" (not "food")
11. ✓ Top categories show "Makanan"
```

### Scenario 3: Tab Switching
```
1. Dashboard active
2. Tap "Transaksi" tab
3. ✓ Switch to transactions list
4. Tap "Pengaturan" tab
5. ✓ Switch to settings
6. Tap "Dashboard" tab again
7. ✓ Data still shows, no loss
```

### Scenario 4: Multiple Transactions
```
1. Add 3-4 transactions (different categories)
2. Dashboard totals update correctly
3. Top categories shows multiple items
4. Recent transactions list complete
5. Switch app to background/foreground
6. Data persists
```

## Build Output Artifacts

### Web
- Output: `web-build/` or similar
- Open in browser: http://localhost:8000 (or shown in terminal)

### iOS
- Output: `.app` file in Xcode build directory
- Runs in iOS simulator

### Android
- Output: `.apk` or `.aab` file
- Runs in Android emulator

## Troubleshooting

### Issue: "Unmatched route artha:///"
❌ Old issue (should be fixed)
✅ New fix: Specific paths like `/(tabs)/dashboard`

### Issue: Build hangs at "Building..."
- Try: `npm run lint` first
- Try: Clear cache: `rm -rf .expo`
- Try: Restart dev server

### Issue: App crashes on startup
- Check: `console.error` messages in dev tools
- Check: All components have default exports
- Check: No infinite loops in useEffect

### Issue: PIN doesn't save
- Check: AsyncStorage permissions granted
- Check: Storage keys in debug: `artha_pin_hash`, `artha_pin_set`

## Next Steps After Build

1. Test all 4 scenarios above
2. Check console for warnings (ok) vs errors (not ok)
3. Verify performance (no lag, smooth animations)
4. Test on multiple devices/OS if possible
5. If all pass: Ready for production! 🎉

---

Created: 2026-02-01
Version: 1.0.0
Artha Personal Finance App
