# Fix Dashboard & Routing Issues

## Masalah yang Diperbaiki

### 1. **Dashboard Tidak Menampilkan Data Transaksi**
**Root Cause**: 
- Dashboard menggunakan ID kategori sebagai nama kategori dalam perhitungan top categories
- Data tidak di-refresh ketika navigasi kembali ke dashboard dari add-transaction modal

**Solusi**:
- Import `useCategories` di dashboard.tsx
- Mapping category ID ke category name menggunakan `categories.find(c => c.id === t.category)?.name`
- Tambahkan `categories` ke dependency array useMemo agar re-calculate ketika kategori berubah

### 2. **Route Error Setelah Login PIN**
**Root Cause**:
- Tab layout tidak memiliki `initialRouteName`, jadi bisa default ke tab pertama yang tidak cocok
- `useFocusEffect` di useTransactions memiliki empty dependency array, menyebabkan infinite loop atau tidak trigger

**Solusi**:
- Tambahkan `initialRouteName="dashboard"` di Tabs navigator di `app/(tabs)/_layout.tsx`
- Ini memastikan setelah login, langsung masuk ke dashboard tab

### 3. **Dashboard Component Export Issue**
**Root Cause**:
- Component di-export sebagai named export `export const DashboardScreen`, tapi file-based router memerlukan default export

**Solusi**:
- Rename component ke `DashboardScreenComponent` 
- Export sebagai: `export const DashboardScreen = DashboardScreenComponent;`
- Export default: `export default DashboardScreenComponent;`

### 4. **useStorage Hook useFocusEffect Issue**
**Root Cause**:
- useFocusEffect memiliki dependency array kosong `[]`, tidak re-trigger ketika data berubah
- loadTransactions callback tidak ter-include dalam dependency

**Solusi**:
- Update dependency: `useCallback(() => { loadTransactions(); }, [loadTransactions])`
- Ini memastikan ketika screen di-focus, data otomatis reload

### 5. **Recent Transactions Category Display**
**Root Cause**:
- Recent transactions juga menampilkan ID kategori, bukan nama

**Solusi**:
- Mapping category ID ke name: `const catName = categories.find((c) => c.id === txn.category)?.name || txn.category;`

## File yang Diubah

1. **app/(tabs)/dashboard.tsx**
   - Import useCategories
   - Map category ID ke name di topCategories
   - Map category ID ke name di recentTransactions
   - Add categories ke useMemo dependency

2. **app/(tabs)/_layout.tsx**
   - Tambahkan `initialRouteName="dashboard"`

3. **hooks/storage/useStorage.ts**
   - Fix useFocusEffect dependency di useTransactions
   - Fix loadTransactions loading state management

## Testing Checklist

- [ ] Buka app, masuk PIN (setup jika first launch)
- [ ] Verify masuk langsung ke dashboard tab
- [ ] Tambah transaksi expense dengan kategori "Makanan", nominal 50000
- [ ] Verify dashboard total pengeluaran bertambah menjadi 50000
- [ ] Verify top categories menampilkan "Makanan" bukan ID
- [ ] Tambah transaksi income dengan kategori "Gaji", nominal 1000000
- [ ] Verify total pemasukan bertambah menjadi 1000000
- [ ] Verify recent transactions menampilkan nama kategori dengan benar
- [ ] Switch ke tab lain dan kembali ke dashboard
- [ ] Verify data masih sama (tidak hilang saat re-focus)

## Build Notes

```bash
npm run lint      # Check for errors
npm run web       # Test web preview
npm run ios       # Build iOS preview
npm run android   # Build Android preview
```

All fixes ensure:
1. ✅ Data persists correctly in AsyncStorage
2. ✅ Dashboard refreshes on focus
3. ✅ Navigation after PIN setup goes to dashboard
4. ✅ Category names display correctly (not IDs)
5. ✅ Total income/expense updates correctly
