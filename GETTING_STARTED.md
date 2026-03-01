# 🚀 NEXT STEPS - GET ARTHA RUNNING

## Step 1: Install Dependencies (1 minute)

```bash
cd c:\development\Artha
npm install
```

**What it does:**

- Installs all dependencies including AsyncStorage
- Sets up node_modules directory
- Prepares dev environment

**Expected output:**

```
added XXX packages
```

---

## Step 2: Start Development Server (1 minute)

```bash
npm run start
```

**What happens:**

- Expo dev server starts
- Shows QR code in terminal
- Waits for platform selection

**Next, choose your platform:**

### Option A: iOS Simulator

```bash
# Type 'i' in terminal after npm run start
i
```

- Xcode opens (if installed)
- iOS simulator launches
- App loads with PIN screen

### Option B: Android Emulator

```bash
# Type 'a' in terminal
a
```

- Android emulator launches (if running)
- App loads with PIN screen

### Option C: Web Browser

```bash
# Type 'w' in terminal
w
```

- Default browser opens to localhost:19006
- App loads in web viewport

---

## Step 3: Test First Launch (2 minutes)

You'll see the PIN setup screen:

1. **Title:** "Artha" with subtitle "Atur PIN baru Anda"
2. **Numeric Keypad:** 0-9, Delete (⌫) button
3. **PIN Dots:** 6 empty circles

### First PIN Entry:

1. Tap digits to enter 6-digit PIN
2. Can use default `123456` or any 6 digits
3. Dots fill as you type
4. Tap confirm (or wait for ready state)

### Confirm PIN:

1. Second screen: "Konfirmasi PIN"
2. Enter SAME PIN again
3. If matches: Success! Dashboard appears
4. If differs: Error alert, try again

### After Setup:

- Dashboard shows monthly summary
- No transactions yet (empty state)
- Bottom tabs visible (Dashboard, Transaksi, Pengaturan)

---

## Step 4: Test Core Features (5 minutes)

### Test Dashboard

- ✓ See "Dashboard" tab active
- ✓ View total income/expense (both 0)
- ✓ See balance card
- ✓ Floating action button (+) visible

### Test Add Transaction

1. Tap **+** button (FAB)
2. Modal appears with form
3. Toggle between Pemasukan/Pengeluaran
4. Enter amount: `50000`
   - Preview shows: "Rp 50.000"
5. Select category: "Makanan"
6. Date auto-fills (today)
7. Tap **Simpan**
8. Modal closes, returns to dashboard
9. Dashboard updates:
   - "Total Pengeluaran: Rp 50.000"
   - Balance shows -50,000

### Test Transaction History

1. Tap **Transaksi** tab
2. See transaction listed by today's date
3. Shows: "Makanan", "-Rp 50.000" (red)
4. Delete button visible
5. Try month navigation (< >)

### Test Settings

1. Tap **Pengaturan** tab
2. See PIN section with "Ubah PIN" button
3. See categories grouped by type:
   - **Pemasukan:** Gaji, Bonus, Lainnya
   - **Pengeluaran:** Makanan, Transport, etc.
4. See "+" button to add category
5. Try adding new category:
   - Tap "+"
   - Modal appears
   - Type: "Roti Bakar"
   - Select type: Pengeluaran
   - Tap "Tambah"
   - New category appears in list

### Test PIN Change

1. In Settings, tap "Ubah PIN"
2. Modal appears with PIN dots and keypad
3. Enter new 6-digit PIN
4. Confirm screen appears
5. Enter same PIN again
6. Success alert
7. Modal closes

### Test Logout

1. Scroll down in Settings
2. Tap "Keluar" button
3. Alert: "Yakin ingin keluar?"
4. Confirm
5. Returns to PIN login screen

---

## Step 5: Data Persistence Test (2 minutes)

### Close and Reopen App

1. **iOS:** Cmd+W to close simulator
2. **Android:** Close app, then reopen
3. **Web:** Refresh page or close/reopen

### Expected Results

- ✓ PIN login required again
- ✓ Same PIN works (not reset)
- ✓ Transactions still there
- ✓ Categories still there
- ✓ Dashboard shows saved data

---

## Step 6: Verify Code Structure (5 minutes)

### Check File Organization

```bash
# View key directories
ls app/               # Should show: _layout.tsx, add-transaction.tsx, (tabs)/
ls components/        # Should show: pin-entry-screen.tsx, etc.
ls constants/         # Should show: colors.ts, strings.ts, theme.ts
ls lib/              # Should show: types.ts, currency.ts, date.ts, crypto.ts
ls hooks/storage/    # Should show: useStorage.ts
ls context/          # Should show: AuthContext.tsx
```

### Read Documentation

- [ ] Open `ARTHA_README.md` - Feature overview
- [ ] Open `DEVELOPER_GUIDE.md` - Code examples
- [ ] Open `ARCHITECTURE.md` - Design details
- [ ] Open `CODE_EXAMPLES.tsx` - Copy-paste patterns

---

## Step 7: Customization (Optional)

### Change Default PIN

1. Open: `lib/crypto.ts`
2. Find: `getDefaultPinHash()`
3. Change: `hashPin('123456')` to `hashPin('YOUR_PIN')`
4. Save and restart app

### Add New Category

1. Open: `hooks/storage/useStorage.ts`
2. Find: `defaultCategories` array
3. Add: `{ id: 'custom', name: 'My Category', type: 'expense' }`
4. Save and restart app

### Change Colors

1. Open: `constants/colors.ts`
2. Edit: `ArthaColors` object
3. Update any color hex values
4. Save and restart app

---

## Step 8: Build for Distribution (Optional)

### Install Expo CLI

```bash
npm install -g eas-cli
```

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

### Deploy Web

```bash
npm run web
# Then deploy the build output to hosting (Vercel, Netlify, etc.)
```

---

## Troubleshooting

### App Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run start
```

### PIN Screen Stuck

- Close app (Cmd+W on iOS)
- Restart: `npm run start` → `i`

### Transactions Not Showing

- Close app completely
- Restart app
- Verify PIN login works

### Colors Not Applied

- Restart dev server: `npm run start`
- Clear simulator cache if needed

### AsyncStorage Error

- On iOS: Check simulator permissions
- On Android: Check app permissions
- On Web: Check browser localStorage access

---

## Success Checklist ✓

- [ ] Dependencies installed
- [ ] Dev server started
- [ ] App opens on iOS/Android/Web
- [ ] PIN setup works
- [ ] Dashboard displays correctly
- [ ] Can add transactions
- [ ] Transaction history shows
- [ ] Categories manageable
- [ ] PIN change works
- [ ] Data persists on restart
- [ ] Code structure understood
- [ ] Documentation reviewed

---

## Key Files Quick Reference

| File                          | Purpose            |
| ----------------------------- | ------------------ |
| `app/_layout.tsx`             | Root with PIN gate |
| `app/(tabs)/_layout.tsx`      | Tab navigation     |
| `app/(tabs)/dashboard.tsx`    | Main screen        |
| `app/add-transaction.tsx`     | Add form           |
| `constants/colors.ts`         | Color palette      |
| `constants/strings.ts`        | UI text (Bahasa)   |
| `context/AuthContext.tsx`     | Auth state         |
| `hooks/storage/useStorage.ts` | Data hooks         |

---

## Commands Reference

```bash
npm run start       # Start dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Web browser
npm run lint        # Check code quality
npm install         # Install deps
```

---

## Estimated Time to Full Test

- Installation: 2-3 minutes
- First launch: 1 minute
- Core features test: 5-10 minutes
- Data persistence: 2 minutes
- **Total: ~15 minutes** ⏱️

---

## What's Included

✓ PIN security with setup flow  
✓ Monthly dashboard with stats  
✓ Fast transaction entry  
✓ Transaction history & filtering  
✓ Category management  
✓ Settings panel  
✓ Bahasa Indonesia localization  
✓ Artha color palette  
✓ Local-only storage  
✓ Complete documentation

---

## Questions?

Refer to documentation:

- **Setup Issues?** → `SETUP_CHECKLIST.md`
- **Code Patterns?** → `DEVELOPER_GUIDE.md`
- **Architecture?** → `ARCHITECTURE.md`
- **Examples?** → `CODE_EXAMPLES.tsx`
- **Features?** → `ARTHA_README.md`

---

**You're all set! 🎉**

Start with: `npm install && npm run start`

Then choose: `i` (iOS), `a` (Android), or `w` (Web)

Enjoy Artha! 💰
