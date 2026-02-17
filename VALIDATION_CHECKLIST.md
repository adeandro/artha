/**
 * VALIDATION CHECKLIST - Dashboard & Routing Fixes
 * 
 * Sebelum merasa puas, pastikan semua item berikut berhasil:
 */

// ============================================================
// 1. PIN AUTHENTICATION FLOW
// ============================================================
✓ First Launch:
  - App menampilkan loading spinner saat checking PIN
  - Tidak ada PIN di storage → tampilkan PinEntryScreen mode "setup"
  - User masuk PIN 6 digit, confirm
  - PIN tersimpan (hashed) di AsyncStorage: "artha_pin_hash"
  - Ukuran di localStorage: "artha_pin_set" = "true"
  - App auto-authenticate dan **langsung masuk ke DASHBOARD tab**

✓ Subsequent Launches:
  - App cek PIN di storage
  - Tampilkan PinEntryScreen mode "login"
  - User masuk PIN yang benar
  - App auto-authenticate dan **langsung masuk ke DASHBOARD tab**
  - Tab navigation menampilkan 3 tab: Dashboard, Transaksi, Pengaturan

// ============================================================
// 2. DASHBOARD TAB VERIFICATION
// ============================================================
✓ First Time (No Transactions):
  - Total Pemasukan: 0 IDR
  - Total Pengeluaran: 0 IDR
  - Saldo/Balance: 0 IDR
  - Tidak ada kategori teratas (hidden state)
  - Pesan "Tidak ada transaksi"
  - FAB button (+) untuk tambah transaksi visible

✓ Add Income:
  - Klik FAB (+) → modal "Tambah Transaksi" terbuka
  - Select type: PEMASUKAN
  - Amount: 1000000
  - Category: Gaji
  - Date: auto-today
  - Notes: (optional)
  - Klik Simpan
  - Modal close, kembali ke dashboard
  - Dashboard refresh otomatis:
    * Total Pemasukan: 1.000.000 IDR ✓
    * Recent transactions list menampilkan "Gaji" (BUKAN ID) ✓

✓ Add Expense:
  - Klik FAB (+)
  - Select type: PENGELUARAN
  - Amount: 150000
  - Category: Makanan
  - Klik Simpan
  - Dashboard refresh:
    * Total Pengeluaran: 150.000 IDR ✓
    * Top Categories menampilkan "Makanan" (BUKAN ID) ✓
    * Balance: 850.000 IDR ✓

// ============================================================
// 3. DATA PERSISTENCE
// ============================================================
✓ After transaction, close dan buka app kembali:
  - PIN login tampil
  - Login dengan PIN
  - Dashboard menampilkan data transaksi yang sama
  - Total income/expense tidak hilang

✓ Switch tab dan kembali:
  - Dashboard menampilkan data sama
  - useFocusEffect trigger, data refresh (jika ada perubahan dari tab lain)

// ============================================================
// 4. CATEGORY NAMES DISPLAY (CRITICAL FIX)
// ============================================================
✓ Top Categories section:
  - Menampilkan nama kategori: "Makanan", "Transportasi", dll
  - BUKAN menampilkan ID: "food", "transport"

✓ Recent Transactions list:
  - Menampilkan nama kategori, bukan ID
  - Contoh: "Gaji ·  Hari Ini" (BUKAN "salary · Hari Ini")

// ============================================================
// 5. ROUTE NAVIGATION
// ============================================================
✓ After PIN setup → auto to Dashboard (initialRouteName="dashboard")
✓ Click tab → switch dengan benar
✓ Modal add-transaction → kembali ke dashboard dengan router.back()
✓ No "route not found" errors
✓ No navigation loop atau infinite loading

// ============================================================
// 6. STORAGE KEYS VERIFICATION (Debug)
// ============================================================
Via Chrome DevTools / React Native DevTools:

Expected AsyncStorage keys:
  - "artha_transactions": [{"id":"...", "date":"2026-01-31", "type":"expense", "category":"food", "amount":150000}]
  - "artha_categories": [{"id":"salary","name":"Gaji","type":"income"}, ...]
  - "artha_pin_hash": (hashed value)
  - "artha_pin_set": "true"

// ============================================================
// COMMAND TO RUN BUILD
// ============================================================

# Lint check (no errors, only warnings ok)
npm run lint

# Web preview
npm run web

# iOS preview (requires Mac)
npm run ios

# Android preview (requires emulator/Android Studio)
npm run android

// ============================================================
// EXPECTED RESULTS AFTER BUILD
// ============================================================

✓ No TypeScript errors
✓ No runtime errors in console
✓ All transactions visible on dashboard
✓ Totals calculate correctly
✓ Category names display (not IDs)
✓ Navigation flow works: PIN → Dashboard → Tab switch → Add transaction
✓ Data persists after app restart
✓ useFocusEffect triggers on tab focus
✓ Modal closes and returns to dashboard correctly

// ============================================================
// IF ISSUES PERSIST
// ============================================================

Problem: Total tidak bertambah
Checklist:
  - [ ] Dashboard me-import useCategories? ✓
  - [ ] addTransaction dipanggil dengan data yang benar?
  - [ ] AsyncStorage save berhasil (check console)?
  - [ ] useFocusEffect trigger ketika kembali ke dashboard?

Problem: Route error setelah PIN
Checklist:
  - [ ] app/_layout.tsx anchor=(tabs) correct?
  - [ ] app/(tabs)/_layout.tsx initialRouteName="dashboard"?
  - [ ] dashboard.tsx di-export sebagai default?

Problem: Category menampilkan ID
Checklist:
  - [ ] dashboard.tsx import useCategories?
  - [ ] categories.find(c => c.id === txn.category) implemented?
  - [ ] All recent transaction rendering updated?

// ============================================================
*/
