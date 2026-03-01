# Artha - Personal Finance Manager

A simple, fast personal finance management mobile app built with React Native and Expo. Track daily income and expenses locally on your device with no internet or cloud sync required.

## Features

- **Quick Transaction Entry** - Record income/expense in under 10 seconds
- **Monthly Dashboard** - See your total income, expenses, and balance at a glance
- **Transaction History** - Review all transactions with filtering by month
- **Category Management** - Organize transactions with custom categories
- **Local PIN Security** - 6-digit PIN for app access (default: 123456)
- **Bahasa Indonesia** - Full localization in Indonesian language
- **Offline First** - All data stored locally, no internet required

## Getting Started

### Installation

```bash
npm install
```

### Running the App

**Start dev server:**

```bash
npm run start
```

**Run on iOS simulator:**

```bash
npm run ios
```

**Run on Android emulator:**

```bash
npm run android
```

**Run on web:**

```bash
npm run web
```

### Default Credentials

- **Default PIN:** 123456
- On first launch, you'll be prompted to change this PIN to your own

## Project Structure

```
app/
  _layout.tsx              # Root layout with auth gate
  add-transaction.tsx      # Modal for adding transactions
  (tabs)/
    _layout.tsx            # Tab navigation
    dashboard.tsx          # Monthly summary screen
    transactions.tsx       # Transaction history screen
    settings.tsx           # Category & PIN management

components/
  pin-entry-screen.tsx     # PIN entry/setup UI
  themed-text.tsx          # Theme-aware text
  themed-view.tsx          # Theme-aware container
  [...other components]

constants/
  colors.ts                # Artha color palette
  strings.ts               # Bahasa Indonesia strings
  theme.ts                 # App-wide theme

hooks/
  storage/
    useStorage.ts          # AsyncStorage hooks for data persistence
  use-color-scheme.ts      # Theme detection

context/
  AuthContext.tsx          # PIN authentication state

lib/
  types.ts                 # TypeScript interfaces
  currency.ts              # IDR formatting utilities
  crypto.ts                # Simple PIN hashing
  date.ts                  # Date utilities
```

## Data Storage

All data is stored locally using `AsyncStorage`:

- **Transactions** - Array of transaction records with date, amount, category, type
- **Categories** - Pre-defined list of income/expense categories
- **PIN Hash** - Hashed PIN for authentication

### Default Categories

**Income:**

- Gaji (Salary)
- Bonus
- Lainnya (Other)

**Expenses:**

- Makanan (Food)
- Transportasi (Transportation)
- Utilitas (Utilities)
- Hiburan (Entertainment)
- Kesehatan (Healthcare)
- Pendidikan (Education)
- Belanja (Shopping)
- Lainnya (Other)

## Color Palette

- **Primary Dark:** #374F4E - Headers, main UI
- **Primary Accent:** #D1801E - Buttons, highlights
- **Secondary Light:** #EDBD95 - Secondary accents
- **Neutral Light:** #DACCC4 - Backgrounds
- **Neutral Accent:** #AA8552 - Accents

## Development

### Key Technologies

- React Native 0.81.5
- Expo 54.0.32
- TypeScript 5.9.2
- expo-router for file-based routing
- React Context API for state management
- AsyncStorage for local persistence

### Code Style

- Use `@/` path alias for all imports
- Wrap text in `<ThemedText>` for automatic theming
- Use `<ThemedView>` for theme-aware containers
- Always use `Platform.select()` for platform-specific code
- Maintain TypeScript strict mode

### Adding New Categories

Edit the default categories in `hooks/storage/useStorage.ts` in the `useCategories` hook.

### Changing Default PIN

Update `getDefaultPinHash()` in `lib/crypto.ts`:

```typescript
export const getDefaultPinHash = (): string => {
  return hashPin("YOUR_NEW_PIN");
};
```

## Currency Format

All amounts are stored in IDR (Indonesian Rupiah) as integers (no decimals). Display format is "Rp 1.250.000" with thousand separators using dots.

## Performance Notes

- Transaction lists use `SectionList` for efficient rendering
- Monthly calculations are memoized to prevent unnecessary recalculations
- Categories are loaded once on app start
- Images use `expo-image` for optimal performance

## Security Considerations

⚠️ **Note:** The PIN hashing in this app is for local storage only and not cryptographically secure. For a production app handling sensitive financial data, consider:

- Using a proper crypto library
- Implementing biometric authentication (Face ID, Touch ID)
- Adding data encryption
- Regular security audits

## Troubleshooting

### PIN Locked Out

If you forget your PIN, uninstall the app and reinstall. All local data will be lost.

### Transactions Not Showing

- Clear app cache
- Ensure AsyncStorage is accessible
- Check JavaScript console for errors

### Performance Issues

- Clear app cache if experiencing slowdown with 1000+ transactions
- Consider implementing pagination for large lists

## Future Enhancements (Out of Scope)

- Budget tracking and alerts
- Recurring transactions
- Data export (CSV/PDF)
- Multi-device sync
- Charts and analytics
- Receipt photo attachment
- Bank integration
- Cloud backup
