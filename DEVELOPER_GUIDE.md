/\*\*

- ARTHA QUICK START GUIDE
-
- This file documents key patterns and quick reference for developers
  \*/

// ============= IMPORTING COLORS =============
import { ArthaColors } from '@/constants/colors';

// Use colors from the palette:
// - ArthaColors.primaryDark (#374F4E)
// - ArthaColors.primaryAccent (#D1801E)
// - ArthaColors.success (green for income)
// - ArthaColors.error (red for expense)

// ============= USING THEMED COMPONENTS =============
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Always use ThemedText instead of Text
<ThemedText type="title">Title</ThemedText>
<ThemedText type="subtitle">Subtitle</ThemedText>
<ThemedText type="default">Regular text</ThemedText>
<ThemedText type="defaultSemiBold">Bold text</ThemedText>

// ============= LOCALIZATION =============
import { Strings } from '@/constants/strings';

// All UI text must use Strings constants
<ThemedText>{Strings.dashboard}</ThemedText>
<ThemedText>{Strings.addTransaction}</ThemedText>

// ============= CURRENCY FORMATTING =============
import { formatCurrency, parseCurrency } from '@/lib/currency';

// Format amount for display (IDR with Rp prefix and thousand separators)
const displayAmount = formatCurrency(1250000); // "Rp 1.250.000"

// Parse user input to number
const numericAmount = parseCurrency('Rp 1.250.000'); // 1250000

// ============= DATE UTILITIES =============
import { getTodayDateString, formatDate, getMonthYear } from '@/lib/date';

// Get today in YYYY-MM-DD format
const today = getTodayDateString();

// Format date for display
const formatted = formatDate('2024-01-25', 'id'); // "Sen, 25 Jan 2024"

// Get month-year display
const monthYear = getMonthYear(2024, 1); // "Januari 2024"

// ============= STORAGE HOOKS =============
import { useTransactions, useCategories, usePinStorage } from '@/hooks/storage/useStorage';

// Use transactions
const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

// Use categories (pre-loaded with defaults)
const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

// PIN operations
const { getPinHash, setPinHash, isPinSet } = usePinStorage();

// ============= AUTHENTICATION =============
import { useAuth } from '@/context/AuthContext';

// Check auth state
const { isAuthenticated, isPinSetup, login, setPin, logout } = useAuth();

// Login
const success = await login('123456');

// Change PIN
const success = await setPin('654321');

// ============= CREATING NEW TRANSACTIONS =============
import { Transaction, TransactionType } from '@/lib/types';

const { addTransaction } = useTransactions();

const newTransaction: Transaction = {
id: Date.now().toString(),
date: '2024-01-25',
type: 'expense' as TransactionType,
category: 'food',
amount: 50000,
notes: 'Lunch at restaurant',
};

await addTransaction(newTransaction);

// ============= CALCULATING MONTHLY STATS =============
const { transactions } = useTransactions();
const { year, month } = getCurrentMonth();
const { start, end } = getMonthDateRange(year, month);

const monthTransactions = transactions.filter(
t => t.date >= start && t.date <= end
);

const totalIncome = monthTransactions
.filter(t => t.type === 'income')
.reduce((sum, t) => sum + t.amount, 0);

const totalExpense = monthTransactions
.filter(t => t.type === 'expense')
.reduce((sum, t) => sum + t.amount, 0);

// ============= NAVIGATION =============
import { Link, router } from 'expo-router';

// Navigate to add transaction

<Link href="/add-transaction" asChild>
  <TouchableOpacity>
    <ThemedText>Add</ThemedText>
  </TouchableOpacity>
</Link>

// Programmatic navigation
router.back();
router.push('/(tabs)/dashboard');

// ============= TYPE DEFINITIONS =============
// Common types from lib/types.ts:

interface Transaction {
id: string;
date: string; // ISO format YYYY-MM-DD
type: TransactionType; // 'income' | 'expense'
category: string;
amount: number; // in IDR
notes?: string;
}

interface Category {
id: string;
name: string;
type: TransactionType;
}

// ============= STYLING GUIDELINES =============
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: ArthaColors.gray50,
paddingHorizontal: 16,
},
button: {
paddingVertical: 12,
borderRadius: 6,
backgroundColor: ArthaColors.primaryAccent,
alignItems: 'center',
},
buttonText: {
fontSize: 14,
fontWeight: '600',
color: ArthaColors.white,
},
});

// ============= PLATFORM-SPECIFIC CODE =============
import { Platform } from 'react-native';

// Use Platform.select() for platform-specific behavior
const toolName = Platform.select({
ios: 'cmd + d',
android: 'cmd + m',
web: 'F12',
});

// Or use file variants: hooks/use-color-scheme.web.ts

// ============= COMMON PATTERNS =============

// Safe area
import { SafeAreaView } from 'react-native';

export default function MyScreen() {
return (
<SafeAreaView style={styles.container}>
{/_ Content _/}
</SafeAreaView>
);
}

// Loading state
const { transactions, loading } = useTransactions();

if (loading) {
return <ThemedText>{Strings.loading}</ThemedText>;
}

// Empty state
if (transactions.length === 0) {
return <ThemedText>{Strings.noTransactions}</ThemedText>;
}

// Memoized calculations
import { useMemo } from 'react';

const stats = useMemo(() => {
// Expensive calculation here
return {
total: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
};
}, [monthTransactions]);
