/\*\*

- ARTHA ARCHITECTURE OVERVIEW
-
- Data Flow, State Management, and Key Components
  \*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ APP ENTRY POINT │
╚══════════════════════════════════════════════════════════════════════════════╝

app/\_layout.tsx
├─ AuthProvider (Context)
│ └─ Initializes PIN authentication
│ └─ Checks if user is authenticated
│ └─ If not authenticated: Shows PinEntryScreen
│ └─ If authenticated: Shows MainApp (tabs + navigation)
└─ Uses useAuth() hook for state management
\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ AUTHENTICATION FLOW │
╚══════════════════════════════════════════════════════════════════════════════╝

First Launch:

1. AuthContext checks AsyncStorage for PIN_HASH
2. No PIN_HASH found → Show PinEntryScreen in "setup" mode
3. User enters 6-digit PIN
4. User confirms PIN
5. PIN is hashed and saved to AsyncStorage
6. Auth context marks isPinSetup = true
7. User now authenticated, main app shown

Subsequent Launches:

1. AuthContext retrieves PIN_HASH from AsyncStorage
2. Show PinEntryScreen in "login" mode
3. User enters PIN
4. PIN is hashed and compared with stored hash
5. If match: user authenticated, main app shown
6. If no match: PIN rejected, user tries again

Change PIN (from Settings):

1. Show ChangePinModal
2. User enters new PIN (step 1)
3. User confirms new PIN (step 2)
4. New PIN hashed and saved
5. Next login uses new PIN

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ MAIN APP STRUCTURE │
╚══════════════════════════════════════════════════════════════════════════════╝

app/(tabs)/\_layout.tsx - Bottom Tab Navigation
├─ Dashboard Tab (dashboard.tsx)
├─ Transactions Tab (transactions.tsx)
└─ Settings Tab (settings.tsx)

Other Screens:
└─ app/add-transaction.tsx (Modal for adding new transactions)

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ DATA PERSISTENCE LAYER │
╚══════════════════════════════════════════════════════════════════════════════╝

hooks/storage/useStorage.ts provides React hooks for data management:

1. useTransactions()
   - Manages: Transaction[] from AsyncStorage
   - Key: "artha_transactions"
   - Operations: add, update, delete, list
   - Automatically saves to storage on changes
   - Returns: { transactions, loading, addTransaction, updateTransaction, deleteTransaction }

2. useCategories()
   - Manages: Category[] from AsyncStorage
   - Key: "artha_categories"
   - Initializes with default categories if not present
   - Operations: add, update, delete, list
   - Returns: { categories, loading, addCategory, updateCategory, deleteCategory }

3. usePinStorage()
   - Manages: PIN_HASH and PIN_SET flags
   - Keys: "artha_pin_hash", "artha_pin_set"
   - Operations: getPinHash, setPinHash, isPinSet
   - Used by AuthContext for authentication

Storage Structure in AsyncStorage:
{
"artha_transactions": [
{
"id": "1705953600000",
"date": "2024-01-25",
"type": "expense",
"category": "food",
"amount": 50000,
"notes": "Lunch"
},
...
],
"artha_categories": [
{ "id": "salary", "name": "Gaji", "type": "income" },
{ "id": "food", "name": "Makanan", "type": "expense" },
...
],
"artha_pin_hash": "base64_encoded_pin_hash",
"artha_pin_set": "true"
}

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ COMPONENT HIERARCHY │
╚══════════════════════════════════════════════════════════════════════════════╝

PinEntryScreen
├─ Used in: Root layout (auth gate)
├─ Props: mode ('login' | 'setup' | 'change'), onSuccess()
├─ Features: 6-digit PIN entry with numeric keypad
└─ Returns: null on success (triggers auth state change)

Dashboard Screen (dashboard.tsx)
├─ Shows: Monthly summary + top 3 categories
├─ Uses: useTransactions(), getCurrentMonth(), getMonthDateRange()
├─ Calculates: totalIncome, totalExpense, balance (memoized)
├─ Features:
│ ├─ Total income/expense/balance cards
│ ├─ Top 3 expense categories
│ └─ FAB button to add transaction
└─ Re-renders: When transactions change

Transactions Screen (transactions.tsx)
├─ Shows: List of transactions grouped by date
├─ Uses: useTransactions(), month filter
├─ Features:
│ ├─ Month navigation (previous/next)
│ ├─ Sorted by date (newest first)
│ ├─ Delete button per transaction
│ └─ Category and notes display
└─ Re-renders: When transactions change

Settings Screen (settings.tsx)
├─ Sections:
│ ├─ Change PIN (opens modal)
│ ├─ Category management (add/delete/list)
│ └─ Logout button
├─ Modals:
│ ├─ Add Category Modal
│ └─ Change PIN Modal
└─ Uses: useCategories(), useAuth()

Add Transaction Screen (add-transaction.tsx)
├─ Modal: Presented from dashboard FAB or tabs
├─ Fields:
│ ├─ Transaction type (income/expense) - toggle
│ ├─ Amount - numeric input with currency preview
│ ├─ Category - filtered buttons by type
│ ├─ Date - defaults to today
│ └─ Notes - optional text
├─ Validation: Amount required, Category required
├─ On Save: Creates transaction, returns to dashboard
└─ Uses: useTransactions(), useCategories(), date utils

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ STATE MANAGEMENT STRATEGY │
╚══════════════════════════════════════════════════════════════════════════════╝

Pattern: Context API + Custom Hooks (not Redux/Zustand)

AuthContext (context/AuthContext.tsx)
├─ Purpose: Global auth state + PIN management
├─ State:
│ ├─ isAuthenticated (boolean)
│ ├─ isPinSetup (boolean)
│ └─ isLoading (boolean)
├─ Methods:
│ ├─ login(pin: string)
│ ├─ setPin(newPin: string)
│ └─ logout()
└─ Usage: useAuth() hook

Component-Level State
├─ Transaction data: useTransactions() from storage
├─ Categories: useCategories() from storage
├─ UI state: useState() for forms, modals, filters
└─ Calculations: useMemo() for monthly stats

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ UTILITY LIBRARIES │
╚══════════════════════════════════════════════════════════════════════════════╝

lib/currency.ts
├─ formatCurrency(amount: number) → "Rp 1.250.000"
└─ parseCurrency(text: string) → 1250000

lib/date.ts
├─ getTodayDateString() → "2024-01-25"
├─ getMonthDateRange(year, month) → { start, end }
├─ getCurrentMonth() → { year, month }
├─ formatDate(dateString) → "Sen, 25 Jan 2024"
└─ getMonthYear(year, month) → "Januari 2024"

lib/crypto.ts
├─ hashPin(pin: string) → base64_hash
├─ verifyPin(pin: string, hash: string) → boolean
└─ getDefaultPinHash() → hash_of_123456

lib/types.ts
├─ Transaction interface
├─ Category interface
├─ TransactionType type ('income' | 'expense')
└─ MonthlyStats interface

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ LOCALIZATION (Bahasa Indonesia) │
╚══════════════════════════════════════════════════════════════════════════════╝

All UI text is managed in constants/strings.ts

Pattern:

1. Define string constant in Strings object
2. Import Strings from @/constants/strings
3. Use throughout components: <ThemedText>{Strings.addTransaction}</ThemedText>

This enables:

- Centralized text management
- Easy future language switching
- Consistent terminology across app

Common strings:

- Strings.dashboard → "Dashboard"
- Strings.addTransaction → "Tambah Transaksi"
- Strings.totalIncome → "Total Pemasukan"
- Strings.currencyPrefix → "Rp "

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ COLOR SYSTEM │
╚══════════════════════════════════════════════════════════════════════════════╝

constants/colors.ts provides centralized color palette

Primary Colors:

- ArthaColors.primaryDark (#374F4E) → Headers, main UI
- ArthaColors.primaryAccent (#D1801E) → Buttons, highlights

Secondary:

- ArthaColors.secondaryLight (#EDBD95)
- ArthaColors.neutralLight (#DACCC4)
- ArthaColors.neutralAccent (#AA8552)

Semantic:

- ArthaColors.success (#22C55E) → Income, positive
- ArthaColors.error (#EF4444) → Expense, negative
- ArthaColors.warning (#F59E0B) → Alerts

Grayscale:

- ArthaColors.gray50 → Very light backgrounds
- ArthaColors.gray500 → Medium text
- ArthaColors.gray900 → Very dark text

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ PERFORMANCE CONSIDERATIONS │
╚══════════════════════════════════════════════════════════════════════════════╝

1. Memoization
   - Dashboard stats calculation: useMemo
   - Category filtering: useMemo
   - Top 3 categories: useMemo

2. Rendering Optimization
   - Use SectionList for transaction groups (not FlatList)
   - List items should be memoized if list is large
   - Avoid unnecessary re-renders with React.memo()

3. Storage
   - AsyncStorage async operations don't block UI
   - Loading state prevents rendering before data ready
   - All data loaded once on app start

4. Pagination
   - Currently loads all transactions
   - If > 1000 transactions: implement pagination
   - Lazy load historical months on scroll

\*/

/\*
╔══════════════════════════════════════════════════════════════════════════════╗
│ COMMON TASKS │
╚══════════════════════════════════════════════════════════════════════════════╝

Adding a New Feature:

1. Define types in lib/types.ts if needed
2. Add UI strings to constants/strings.ts
3. Create component in components/ or screen in app/
4. Use relevant hooks (useTransactions, useCategories, useAuth)
5. Apply Artha colors from constants/colors.ts
6. Use ThemedText and ThemedView components
7. Test on iOS, Android, and web

Adding a New Screen:

1. Create file in app/ or app/(tabs)/
2. Export default function component
3. Use SafeAreaView wrapper
4. Import and use PinEntryScreen if auth needed
5. Add route to Stack or Tabs in \_layout.tsx

Adding Data to Storage:

1. Use appropriate hook (useTransactions, useCategories)
2. Call add/update/delete method
3. Hook automatically saves to AsyncStorage
4. Component re-renders with new data

Formatting Currency Display:

1. Import: import { formatCurrency } from '@/lib/currency'
2. Use: formatCurrency(1250000) → "Rp 1.250.000"
3. For input parsing: parseCurrency("Rp 1.250.000") → 1250000

\*/
