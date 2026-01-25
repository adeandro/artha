# Artha - AI Coding Instructions

## Project Overview

**Artha** is an Expo-based React Native cross-platform mobile app (iOS, Android, web) using file-based routing with `expo-router`.

**Key Technologies:**

- React Native 0.81.5 + React 19.1.0
- Expo ~54.0.32 with React Compiler experiments enabled
- expo-router ~6.0.22 for file-based routing (like Next.js)
- TypeScript 5.9.2 (strict mode)
- New React Native Architecture enabled (`newArchEnabled: true`)

## Architecture & File Structure

### App Routing

- **`app/` directory**: File-based routing system; directory structure defines routes
  - `app/_layout.tsx`: Root layout using `<Stack>` navigator
  - `app/(tabs)/`: Route group defining bottom-tab navigation
  - `app/(tabs)/index.tsx`: Home screen
  - `app/(tabs)/explore.tsx`: Explore screen
  - `app/modal.tsx`: Modal screen
- Route groups `(tabs)` group related routes; parentheses hide from URL slug

### Component Patterns

- **Themed Components**: Prefer `ThemedText` and `ThemedView` over raw React Native components
  - Props accept `lightColor` and `darkColor` for light/dark mode overrides
  - Located in [components/](components/)
- **Custom Hooks**: Use `useThemeColor()` and `useColorScheme()` for appearance
  - `useColorScheme` is re-exported from react-native for platform parity
  - Platform-specific versions exist (`.web.ts` suffix for web-only variants)
- **Styling**: StyleSheet API with constants in [constants/theme.ts](constants/theme.ts)

### Theme System

- Centralized color definitions in [constants/theme.ts](constants/theme.ts) for light and dark modes
- `Colors` export includes: `text`, `background`, `tint`, `icon`, `tabIconDefault`, `tabIconSelected`
- Platform-specific fonts defined via `Fonts` object with fallbacks (iOS, Android, web variants)

## Development Workflows

### Build & Run Commands

```bash
npm install                    # Install dependencies
npm run start                  # Start dev server (choose platform interactively)
npm run android               # Run on Android emulator
npm run ios                   # Run on iOS simulator
npm run web                   # Run on web (static output)
npm run lint                  # Run expo lint (ESLint configured)
npm run reset-project         # Reset to blank app (moves starter to app-example/)
```

### Developer Tools

- **iOS**: `cmd + d` to open dev menu
- **Android**: `cmd + m` to open dev menu
- **Web**: `F12` for browser dev tools

### Code Quality

- ESLint config: `eslint-config-expo/flat` (flat config format)
- Ignores: `dist/*` directory
- TypeScript: strict mode enabled; path alias `@/*` points to project root

## Critical Patterns & Conventions

### Cross-Platform Code

- Use `Platform.select({ ios: ..., android: ..., web: ... })` for platform-specific behavior
- Platform-specific hook variants: suffix files with `.web.ts` or `.ios.ts` as needed
- Example: [hooks/use-color-scheme.web.ts](hooks/use-color-scheme.web.ts) is web-specific

### Component Composition

- Always wrap text in `<ThemedText>` to respect theme automatically
- Use `<ThemedView>` for theme-aware containers
- Icon components use SF Symbols names on iOS, fallback names on Android/web

### Navigation & Linking

- Use `expo-router` `<Link>` component for navigation (supports nested `<Link.Trigger>`, `<Link.Preview>`, `<Link.Menu>`)
- Bottom tab navigation via `<Tabs>` with `tabBarButton: HapticTab` for haptic feedback
- Modal screens use `presentation: 'modal'` option in Stack.Screen

### Image Assets

- Use `expo-image` Image component (newer replacement for react-native Image)
- Assets located in [assets/images/](assets/images/)
- Exports: icon, splash-icon, android-icon-foreground/background/monochrome, favicon, etc.

## External Dependencies & Integration Points

- **Navigation**: @react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/elements
- **Animations**: react-native-reanimated, react-native-worklets
- **Haptics**: expo-haptics (integrated with HapticTab component)
- **Vector Icons**: @expo/vector-icons (SF Symbols via expo-symbols)
- **Layout**: react-native-safe-area-context, react-native-screens

## Important Project Configuration

- `app.json` defines Expo config with typed routes enabled (`experiments.typedRoutes: true`)
- React Compiler enabled (`experiments.reactCompiler: true`) — new optimization feature
- Status bar auto-styled via `expo-status-bar`
- Adaptive splash screen and adaptive icon system for Android
- Web output is static (`web.output: "static"`)

## Conventions to Follow

1. **Always use path alias**: Import from `@/` rather than relative paths
2. **Theme awareness**: Check [constants/theme.ts](constants/theme.ts) before hardcoding colors
3. **Component props**: Follow ThemedComponent patterns (`lightColor`, `darkColor` optional props)
4. **Platform handling**: Use `Platform.select()` or platform-specific file variants; don't import platform-specific modules directly
5. **TypeScript**: Maintain strict mode; use proper types for all props and exports

---

## Artha Personal Finance App - Specific Architecture

### App Purpose

Personal finance management for daily income/expense tracking with local-only storage. No backend, no cloud sync, no authentication.

### Color Palette (Custom)

- **Primary Dark**: #374F4E (headers, main UI)
- **Primary Accent**: #D1801E (buttons, highlights)
- **Secondary Light**: #EDBD95
- **Neutral Light**: #DACCC4
- **Neutral Accent**: #AA8552

Override theme constants in [constants/colors.ts](constants/colors.ts).

### Localization

All UI text must be in **Bahasa Indonesia**. String literals stored in [constants/strings.ts](constants/strings.ts).

### Data Models

- **Transaction**: `{ id, date, type ('income' | 'expense'), category, amount, notes }`
- **Category**: `{ id, name, type ('income' | 'expense') }`
- **PIN**: Hashed locally; default `123456`

Storage: `AsyncStorage` for simple key-value; consider `expo-sqlite` for complex queries.

### Navigation Structure

Bottom Tab Navigation (3 tabs):

- `dashboard`: Monthly summary + quick transaction add button
- `transactions`: History, edit, delete; month filter
- `settings`: Category management, PIN change

### Key Screens

1. **PIN Entry** (`_layout.tsx` auth gate): Shown before any screen on cold start
2. **Dashboard** (`app/(tabs)/dashboard.tsx`): Total income, expenses, balance, top 3 categories
3. **Add Transaction Modal**: Quick form (< 10 sec workflow)
4. **Transaction History**: Sortable by date, editable
5. **Category Management**: CRUD operations
6. **PIN Change**: Force on first login, optional later

### State Management

Simple approach: Context API + custom hooks in [hooks/](hooks/). No Redux/Zustand required for MVP.

### Performance Notes

- Use `useMemo` for category filtering and monthly calculations
- Lazy load transaction lists with pagination if > 1000 items
- Minimize re-renders with `memo()` on list item components
