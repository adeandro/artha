# Artha Setup & Verification Checklist

## Installation & Setup

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Verify node_modules created successfully
- [ ] Check `.expo/` directory exists

## Verify Dependencies

- [ ] @react-native-async-storage/async-storage v1.21.0+
- [ ] expo ~54.0.32
- [ ] expo-router ~6.0.22
- [ ] react-native 0.81.5
- [ ] typescript 5.9.2
- [ ] All other deps in package.json

## File Structure Verification

### Core Folders

- [ ] `app/` - routing
- [ ] `components/` - UI components
- [ ] `constants/` - colors, strings, theme
- [ ] `hooks/` - custom hooks
- [ ] `lib/` - utilities
- [ ] `context/` - state management
- [ ] `assets/` - images

### Key Files

**App Routing**

- [ ] `app/_layout.tsx` - root layout with auth
- [ ] `app/(tabs)/_layout.tsx` - tab navigation
- [ ] `app/(tabs)/dashboard.tsx`
- [ ] `app/(tabs)/transactions.tsx`
- [ ] `app/(tabs)/settings.tsx`
- [ ] `app/add-transaction.tsx`

**Constants**

- [ ] `constants/colors.ts` - Artha color palette
- [ ] `constants/strings.ts` - Bahasa Indonesia strings
- [ ] `constants/theme.ts` - existing theme

**Utilities & Types**

- [ ] `lib/types.ts` - TypeScript interfaces
- [ ] `lib/currency.ts` - IDR formatting
- [ ] `lib/date.ts` - date utilities
- [ ] `lib/crypto.ts` - PIN hashing

**Hooks & Storage**

- [ ] `hooks/storage/useStorage.ts` - async storage hooks
- [ ] `context/AuthContext.tsx` - authentication

**Components**

- [ ] `components/pin-entry-screen.tsx` - PIN UI
- [ ] `components/themed-text.tsx` - existing
- [ ] `components/themed-view.tsx` - existing

**Documentation**

- [ ] `ARTHA_README.md` - feature overview
- [ ] `DEVELOPER_GUIDE.md` - quick reference
- [ ] `ARCHITECTURE.md` - detailed architecture
- [ ] `.github/copilot-instructions.md` - AI instructions

## Running the App

### Prerequisites

- [ ] iOS: Xcode 14+ (for iOS simulator)
- [ ] Android: Android Studio + emulator setup
- [ ] Web: Modern browser

### Start Development Server

```bash
npm run start
```

- [ ] Choose platform (iOS/Android/web)
- [ ] Wait for compilation to complete

### Test on iOS

```bash
npm run ios
```

- [ ] App opens in iOS simulator
- [ ] PIN entry screen appears
- [ ] Default PIN 123456 works
- [ ] Dashboard loads after PIN
- [ ] Bottom tabs visible (Dashboard, Transactions, Settings)

### Test on Android

```bash
npm run android
```

- [ ] App opens in Android emulator
- [ ] PIN entry works
- [ ] All tabs functional

### Test on Web

```bash
npm run web
```

- [ ] App opens in browser
- [ ] Responsive layout works
- [ ] All features functional

## Initial Feature Testing

### PIN Flow

- [ ] First launch: PIN setup screen appears
- [ ] Accept: Shows "Setup PIN" UI
- [ ] Enter 6 digits
- [ ] Confirm PIN: Shows confirmation screen
- [ ] Confirm with same PIN: Succeeds
- [ ] Confirm with different PIN: Fails with alert
- [ ] First PIN success: Navigate to dashboard

### Dashboard

- [ ] Shows total income, total expense, balance
- [ ] All cards display formatted amounts
- [ ] FAB button visible in bottom-right
- [ ] Month and year label shown
- [ ] Empty state: "No transactions" shown initially

### Add Transaction

- [ ] FAB button opens modal
- [ ] Type toggle (Pemasukan/Pengeluaran) works
- [ ] Amount input accepts numbers
- [ ] Currency preview shows "Rp X.XXX.XXX"
- [ ] Categories filtered by type
- [ ] Date defaults to today
- [ ] Save button adds transaction
- [ ] Modal closes after save
- [ ] Dashboard updates with new transaction

### Transactions Screen

- [ ] Shows list of transactions
- [ ] Grouped by date
- [ ] Sorted newest first
- [ ] Month navigation works (< >)
- [ ] Delete button removes transaction
- [ ] Category and amount displayed correctly
- [ ] Income shows with + (green)
- [ ] Expense shows with - (red)

### Settings Screen

- [ ] Categories list split by income/expense
- [ ] Default categories display
- [ ] Add category button opens modal
- [ ] New category can be added
- [ ] Categories can be deleted
- [ ] Change PIN button opens modal
- [ ] Change PIN flow works (6 digits, confirm)
- [ ] Logout button logs out user

### Data Persistence

- [ ] Close and reopen app
- [ ] PIN not reset (verifies persistent storage)
- [ ] Transactions still present
- [ ] Categories preserved
- [ ] Enter wrong PIN: Shows error
- [ ] Enter correct PIN: Access granted

## Code Quality Checks

### TypeScript

- [ ] No `any` types used
- [ ] All props typed
- [ ] All return types explicit
- [ ] Run: `npx tsc --noEmit` (no errors)

### ESLint

- [ ] Run: `npm run lint`
- [ ] No errors in app/
- [ ] No warnings in critical files

### Imports

- [ ] All imports use `@/` path alias
- [ ] No relative imports (../../)
- [ ] Strings imported from constants/strings
- [ ] Colors imported from constants/colors

### Styling

- [ ] All colors from ArthaColors palette
- [ ] No hardcoded color values
- [ ] Consistent spacing (8px grid)
- [ ] Safe area handling on iOS

## Browser Compatibility (Web)

- [ ] Chrome: All features work
- [ ] Safari: All features work
- [ ] Firefox: All features work
- [ ] Responsive: Works on mobile viewport
- [ ] Keyboard: Enter accepts input

## Performance Baseline

- [ ] App startup: < 3 seconds
- [ ] Dashboard load: < 500ms
- [ ] Transaction list: Smooth scrolling
- [ ] Add transaction: < 500ms save
- [ ] Storage operations: Non-blocking

## Known Limitations (By Design)

- [ ] No backend/cloud sync
- [ ] No offline sync between devices
- [ ] PIN storage is simple hash (not cryptographic)
- [ ] No biometric auth
- [ ] No receipt photos
- [ ] No budget alerts
- [ ] No transaction search

## Next Steps After Verification

1. **Customize (Optional)**
   - [ ] Change default PIN in `lib/crypto.ts`
   - [ ] Add new categories in `hooks/storage/useStorage.ts`
   - [ ] Adjust colors in `constants/colors.ts`

2. **Build**
   - [ ] `eas build --platform ios` (iOS)
   - [ ] `eas build --platform android` (Android)
   - [ ] `npm run web` for web deployment

3. **Deploy**
   - [ ] Test build on physical device
   - [ ] Submit to App Store (iOS)
   - [ ] Submit to Play Store (Android)
   - [ ] Deploy web to hosting

## Troubleshooting

**App won't start**

- [ ] Clear cache: `npm run reset-project`
- [ ] Delete node_modules and reinstall
- [ ] Check Expo version: `npx expo --version`

**AsyncStorage not working**

- [ ] Verify @react-native-async-storage installed
- [ ] Check console for storage permission errors
- [ ] Test on real device if emulator fails

**PIN not saving**

- [ ] Check browser/simulator file system access
- [ ] Verify AsyncStorage initialization
- [ ] Check for storage quota issues

**UI rendering issues**

- [ ] Clear app cache
- [ ] Restart dev server
- [ ] Check for TypeScript errors: `npx tsc --noEmit`

**Transactions disappearing**

- [ ] Verify AsyncStorage operations complete
- [ ] Check for race conditions in add/delete
- [ ] Test with React DevTools

## Support & Maintenance

**Monthly Maintenance**

- [ ] Check for dependency updates
- [ ] Review error logs
- [ ] Test on latest iOS/Android versions

**Bug Reports**

- [ ] Reproduce in clean environment
- [ ] Check browser/device console
- [ ] Document steps and error messages

**Feature Requests**

- [ ] Evaluate against MVP constraints
- [ ] Document required changes
- [ ] Keep scope minimal
