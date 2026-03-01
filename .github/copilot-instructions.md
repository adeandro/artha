# Artha - AI Coding Instructions

## Project Overview

**Artha** is an Expo-based React Native personal finance app (iOS, Android, web) using file-based routing with `expo-router`. Local-only storage, no backend. Daily income/expense tracking with PIN authentication.

**Stack**: React Native 0.81.5 + React 19 + Expo ~54 + expo-router ~6 + TypeScript 5.9 (strict)

---

## Architecture at a Glance

### Authentication Flow (Authentication Gate)

1. **Entry**: [app/_layout.tsx](app/_layout.tsx) wraps app in `AuthProvider` (React Context)
2. **States** (managed in [context/AuthContext.tsx](context/AuthContext.tsx)):
   - `isLoading`: Checking AsyncStorage for saved PIN hash on startup
   - `isPinSetup`: PIN exists in storage (first launch → false, shows setup screen)
   - `isAuthenticated`: User successfully entered correct PIN (login state)
3. **Key Methods**: `login(pin)` → verifies hash, `setPin(newPin)` → stores hashed PIN, `logout()`
4. **Flow**:
   - **First Launch**: `isPinSetup=false` → show [PinEntryScreen](components/pin-entry-screen.tsx) in "setup" mode → user sets PIN → saved hashed → auto-authenticated
   - **Subsequent Launches**: `isAuthenticated=false` → show PinEntryScreen in "login" mode → verify PIN → if valid, auto-authenticated
   - **Authenticated**: Show main app tabs

### Main App Structure

Once authenticated, [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) renders 3-tab bottom navigation:

- **Dashboard** [app/(tabs)/dashboard.tsx](app/(tabs)/dashboard.tsx): Monthly income/expense summary, top 3 categories, add transaction button
- **Transactions** [app/(tabs)/transactions.tsx](app/(tabs)/transactions.tsx): History list, filter by month, edit/delete individual transactions
- **Settings** [app/(tabs)/settings.tsx](app/(tabs)/settings.tsx): Category CRUD, change PIN

### Data Persistence Layer

[hooks/storage/useStorage.ts](hooks/storage/useStorage.ts) exports three main hooks (all backed by AsyncStorage):

1. **`useTransactions()`**: Load/save [Transaction](lib/types.ts) array
   - Methods: `addTransaction()`, `updateTransaction(id, updates)`, `deleteTransaction(id)`
   - Refreshes on screen focus via `useFocusEffect`
   - Key: `"artha_transactions"`

2. **`useCategories()`**: Load/save [Category](lib/types.ts) array (initialized with defaults in Bahasa Indonesia)
   - Methods: `addCategory()`, `updateCategory(id, updates)`, `deleteCategory(id)`
   - Key: `"artha_categories"`

3. **`usePinStorage()`**: Manage PIN hash and set flag
   - Methods: `getPinHash()`, `setPinHash(hash)`, `isPinSet()`
   - Keys: `"artha_pin_hash"`, `"artha_pin_set"`

---

## Project-Specific Conventions

### Localization & UI Text

- **All UI text must be in Bahasa Indonesia** (not English)
- String literals centralized in [constants/strings.ts](constants/strings.ts) — never hardcode strings
- Example: Import `import { Strings } from "@/constants/strings"`, use `Strings.dashboard`

### Colors & Theming

- Custom color palette defined in [constants/colors.ts](constants/colors.ts):
  - Primary Dark: `#374F4E` (headers)
  - Primary Accent: `#D1801E` (buttons, highlights)
  - Neutral tones: `#EDBD95`, `#DACCC4`, `#AA8552`
- Never hardcode hex colors; use `ArthaColors` export from [constants/colors.ts](constants/colors.ts)
- Example: `tabBarActiveTintColor: ArthaColors.primaryAccent` (see [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx#L15))

### Data Types

Located in [lib/types.ts](lib/types.ts); use these consistently:

```typescript
interface Transaction {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  type: "income" | "expense";
  category: string; // category id
  amount: number; // IDR
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}
```

### PIN & Crypto

- [lib/crypto.ts](lib/crypto.ts) exports `hashPin(pin)`, `verifyPin(pin, hash)`, `getDefaultPinHash()`
- Default test PIN: `"123456"` (hash stored, never plain text)
- Always hash before storing; always verify via crypto functions

---

## Development Workflows

### Commands

```bash
npm run start       # Start dev server (interactive: choose iOS/Android/web)
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Web static output
npm run lint       # ESLint check (flat config: eslint-config-expo/flat)
```

### Code Quality

- **TypeScript**: Strict mode enabled; path alias `@/*` points to workspace root
- **ESLint**: Flat config, ignores `dist/*`
- **Structure**: Always use `@/` imports (not relative paths)

### Testing/Debugging

- On iOS simulator: `cmd + d` → dev menu
- On Android emulator: `cmd + m` → dev menu
- Web: `F12` for browser dev tools
- **Storage debugging**: Use `AsyncStorage` DevTools or inspect keys manually during dev

---

## Cross-Platform & Component Patterns

### Platform-Specific Code

- Use `Platform.select({ ios: ..., android: ..., web: ... })` for platform branching
- File suffix variants: `.web.ts`, `.ios.ts` (e.g., [hooks/use-color-scheme.web.ts](hooks/use-color-scheme.web.ts))
- Example: Web-only color scheme hook has its own implementation

### Components

- **`ThemedText` / `ThemedView`**: Use for automatic light/dark mode (props: `lightColor`, `darkColor`)
- **Icons**: Use SF Symbols names (iOS) via `<IconSymbol>` from [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx)
  - Example: `<IconSymbol name="chart.pie.fill" />` in dashboard tab
- **Haptics**: Tab buttons use `HapticTab` for haptic feedback on press

### Navigation

- Bottom tabs: `<Tabs>` from expo-router; add screens with `<Tabs.Screen>`
- Modals: Use `presentation: 'modal'` in Stack.Screen options
- Links: Use expo-router `<Link>` component (supports nested trigger/preview/menu)

---

## Key Files & Their Responsibilities

| File | Purpose |
|------|---------|
| [app/_layout.tsx](app/_layout.tsx) | Root layout: AuthProvider wrap, auth state gates, Stack nav with modal |
| [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx) | Bottom tab nav (Dashboard, Transactions, Settings) |
| [context/AuthContext.tsx](context/AuthContext.tsx) | Authentication state (pin setup/login/logout) |
| [hooks/storage/useStorage.ts](hooks/storage/useStorage.ts) | AsyncStorage hooks (transactions, categories, PIN) |
| [lib/types.ts](lib/types.ts) | TypeScript interfaces (Transaction, Category, MonthlyStats) |
| [lib/crypto.ts](lib/crypto.ts) | PIN hashing/verification utilities |
| [constants/strings.ts](constants/strings.ts) | All UI text (Bahasa Indonesia) |
| [constants/colors.ts](constants/colors.ts) | Artha color palette (custom, not standard theme) |
| [components/pin-entry-screen.tsx](components/pin-entry-screen.tsx) | Reusable PIN setup/login UI component |

---

## Common Tasks & Patterns

### Adding a New Transaction Field

1. Update `Transaction` interface in [lib/types.ts](lib/types.ts)
2. Update AsyncStorage serialization in [hooks/storage/useStorage.ts](hooks/storage/useStorage.ts) if needed
3. Add string label to [constants/strings.ts](constants/strings.ts)
4. Update form in transaction add/edit screen

### Adding a New Setting

1. Add storage hook in [hooks/storage/useStorage.ts](hooks/storage/useStorage.ts)
2. Add UI to [app/(tabs)/settings.tsx](app/(tabs)/settings.tsx)
3. Add related strings to [constants/strings.ts](constants/strings.ts)

### Debugging Storage Issues

- `useStorage` hooks use `useFocusEffect` to refresh data when screen comes into focus
- If data not updating, check that `useFocusEffect` dependency array is correct
- AsyncStorage keys are prefixed `"artha_"` — search for them in logs/storage
