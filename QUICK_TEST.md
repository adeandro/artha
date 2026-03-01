# ⚡ QUICK REFERENCE - Build & Test

## 🚀 Start Build

```bash
cd c:/development/Artha
npm run lint      # Should have 0 errors
npm run web       # Start web preview
```

## 📱 Alternative Builds
```bash
npm run ios       # iOS simulator (macOS only)
npm run android   # Android emulator
```

---

## ✅ CRITICAL THINGS TO CHECK AFTER BUILD

| Test | Expected | Status |
|------|----------|--------|
| App opens | No crash | ✓ Check |
| PIN setup screen | "Buat PIN Baru" title | ✓ Check |
| Enter PIN | 6 digits with dots | ✓ Check |
| Confirm PIN | Shows confirm screen | ✓ Check |
| Tap Simpan | Alert success shows | ✓ Check |
| **Navigate to Dashboard** | **NOT artha:///** error | ✓ CHECK THIS! |
| Dashboard visible | All 3 tabs visible | ✓ Check |
| Add transaction | FAB (+) button works | ✓ Check |
| After add | Total updates | ✓ Check |
| Category name | Shows "Makanan" not "food" | ✓ Check |

---

## 🔧 If "Unmatched route artha:///" Still Appears

**Check these in order:**

1. **Pin entry redirect path**
   ```
   File: components/pin-entry-screen.tsx (Line 54)
   Should be: router.replace("/(tabs)/dashboard")
   NOT: router.replace("/(tabs)")
   ```

2. **Root layout settings**
   ```
   File: app/_layout.tsx (Line 17)
   Should have:
   export const unstable_settings = {
     anchor: "(tabs)",
     initialRouteName: "index",
   };
   ```

3. **Tab initial route**
   ```
   File: app/(tabs)/_layout.tsx (Line 27)
   Should have: initialRouteName="dashboard"
   ```

4. **Clear cache & rebuild**
   ```bash
   rm -rf .expo
   npm run lint
   npm run web
   ```

---

## 📝 FILES TO REVIEW

- ✅ [COMPLETE_FIX_REPORT.md](COMPLETE_FIX_REPORT.md) - Full technical details
- ✅ [ROUTING_FIX_SUMMARY.md](ROUTING_FIX_SUMMARY.md) - Routing-specific fixes
- ✅ [BUILD_GUIDE.md](BUILD_GUIDE.md) - Build & testing guide
- ✅ [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md) - Data validation

---

## ⏱️ Expected Timeline

| Step | Time |
|------|------|
| Build web | 30-60s |
| Browser opens | 5s |
| App loads | 2-3s |
| PIN entry | <1s per digit |
| Navigate | Instant |
| Test all flows | 5-10 mins |

---

## 🎯 Success Criteria

✅ All tests pass  
✅ No errors in console  
✅ Navigation smooth  
✅ Data persists  
✅ Ready for iOS/Android builds  

**Then**: Ready for production! 🚀
