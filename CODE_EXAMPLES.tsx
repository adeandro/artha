/**
 * ARTHA CODE EXAMPLES
 *
 * Quick copy-paste examples for common tasks in Artha development
 */

// ============================================================================
// EXAMPLE 1: Adding a New Screen to Dashboard Tab
// ============================================================================

// Create: app/(tabs)/my-screen.tsx

import React, { useMemo , useState } from "react";
import { View, StyleSheet, SafeAreaView , TextInput, TouchableOpacity , SectionList , Modal, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings';

// ============================================================================
// EXAMPLE 2: Using Transactions Hook
// ============================================================================

import { useTransactions , useCategories } from '@/hooks/storage/useStorage';
import { Transaction , TransactionType } from '@/lib/types";

// ============================================================================
// EXAMPLE 3: Filtering Transactions by Month
// ============================================================================


import { getMonthDateRange, getCurrentMonth } from '@/lib/date';

// ============================================================================
// EXAMPLE 4: Creating a Form with Category Selection
// ============================================================================






// ============================================================================
// EXAMPLE 5: PIN Authentication
// ============================================================================

import { useAuth } from '@/context/AuthContext';

// ============================================================================
// EXAMPLE 6: Grouping Transactions by Date (like SectionList)
// ============================================================================


import { formatDate } from '@/lib/date';

// ============================================================================
// EXAMPLE 7: Formatting Currency Display
// ============================================================================

import { formatCurrency, parseCurrency } from '@/lib/currency';

// ============================================================================
// EXAMPLE 8: Creating Reusable Component with Themes
// ============================================================================



// Usage:
// <ActionButton title={Strings.save} onPress={handleSave} variant="primary" />
// <ActionButton title={Strings.delete} onPress={handleDelete} variant="danger" />

// ============================================================================
// EXAMPLE 9: Modal with Form
// ============================================================================



// ============================================================================
// EXAMPLE 10: Safe Navigation with Error Handling
// ============================================================================

import { router } from 'expo-router';


export default function MyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.wrapper}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {Strings.dashboard}
          </ThemedText>
        </View>

        {/* Add content here */}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ArthaColors.gray50,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: ArthaColors.primaryDark,
  },
});

function MyComponent() {
  const {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  // Add a new transaction
  const handleAddTransaction = async () => {
    const newTxn: Transaction = {
      id: Date.now().toString(),
      date: "2024-01-25",
      type: "expense",
      category: "food",
      amount: 50000,
      notes: "Lunch",
    };
    await addTransaction(newTxn);
  };

  // Update existing transaction
  const handleUpdateTransaction = async (id: string) => {
    await updateTransaction(id, {
      amount: 75000,
      notes: "Updated lunch amount",
    });
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  if (loading) {
    return <ThemedText>{Strings.loading}</ThemedText>;
  }

  return (
    <View>
   

}

// ============================================================================
// EXAMPLE 3: Filtering Transactions by Month
// ============================================================================

import { useMemo } from "react";
import { getMonthDateRange, getCurrentMonth } from "@/lib/date";

function Dashboard() {
  const { transactions } = useTransactions();
  const { year, month } = getCurrentMonth();
  const { start, end } = getMonthDateRange(year, month);

  // Filter transactions for current month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date >= start && t.date <= end);
  }, [transactions, start, end]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [monthTransactions]);

  return (
    <View>
      <ThemedText>{formatCurrency(totals.income)}</ThemedText>

import { useState } from "react";
import { TextInput, TouchableOpacity } from "react-native";
import { useCategories } from "@/hooks/storage/useStorage";
import { TransactionType } from "@/lib/types";

function TransactionForm() {
  const { categories } = useCategories();
  const [type, setType] = useState<TransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  // Filter categories by type
  const typeCategories = categories.filter((c) => c.type === type);

  return (
    <View>
      {/* Type Toggle */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 10,
            backgroundColor:
              type === "income"
                ? ArthaColors.primaryAccent
                : ArthaColors.gray200,
            borderRadius: 6,
          }}
          onPress={() => setType("income")}
        >
          <ThemedText>{Strings.income}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 10,
            backgroundColor:
              type === "expense"
                ? ArthaColors.primaryAccent
                : ArthaColors.gray200,
            borderRadius: 6,
          }}
          onPress={() => setType("expense")}
        >
          <ThemedText>{Strings.expense}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <TextInput
        placeholder={Strings.amount}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Category Selection */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {typeCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={{
              padding: 10,
              backgroundColor:
                selectedCategory === cat.id
            <ThemedText>{cat.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// EXAMPLE 5: PIN Authentication
// ============================================================================

import { useAuth } from "@/context/AuthContext";

function SettingsScreen() {
  const { isAuthenticated, logout, setPin } = useAuth();

  const handleChangePin = async (newPin: string) => {
    const success = await setPin(newPin);
    if (success) {
      Alert.alert("Success", Strings.pinSetSuccessfully);
    } else {
      Alert.alert("Error", Strings.errorOccurred);
    }
  };

  const handleLogout = () => {
    logout();
 

      ) : (
        <ThemedText>Not authenticated</ThemedText>
      )}
    </View>
  );
}

// ============================================================================
// EXAMPLE 6: Grouping Transactions by Date (like SectionList)
// ============================================================================

import { SectionList } from "react-native";
import { formatDate } from "@/lib/date";

function TransactionsList() {
  const { transactions } = useTransactions();

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    transactions.forEach((txn) => {
      if (!groups[txn.date]) {
        groups[txn.date] = [];
      }
      groups[txn.date].push(txn);
    });

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Newest first
      .map(([date, txns]) => ({
        title: formatDate(date),
        data: txns,
      }));
  }, [transactions]);

  return (
    <SectionList
       </ThemedText>
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <ThemedText style={{ fontWeight: "bold" }}>{title}</ThemedText>
      )}
    />
  );
}

// ============================================================================
// EXAMPLE 7: Formatting Currency Display
// ============================================================================

import { formatCurrency, parseCurrency } from "@/lib/currency";

function CurrencyExample() {
  // Format for display
  const amount = 1250000;
  const display = formatCurrency(amount); // "Rp 1.250.000"

  // Parse user input
  const userInput = "Rp 1.250.000";
  co    type: "expense",

    amount: numeric, // Store numeric value
    notes: undefined,
  };

  return <ThemedText>Amount: {formatCurrency(transaction.amount)}</ThemedText>;
}

// ============================================================================
// EXAMPLE 8: Creating Reusable Component with Themes
// ============================================================================

import { View, TouchableOpacity } from "react-native";

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export function ActionButton({
  title,
  onPress,
  variant = "primary",
}: ActionButtonProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case "secondary":
        return ArthaColors.gray200;
      case "danger":
        return ArthaColors.error;
      default:
        return ArthaColors.primaryAccent;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "secondary":
        return ArthaColors.gray600;
      case "danger":
        return ArthaColors.white;
      default:
        return ArthaColors.white;
    }
  };


        paddingHorizontal: 16,
o    {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

// Usage:
// <ActionButton title={Strings.save} onPress={handleSave} variant="primary" />
// <ActionButton title={Strings.delete} onPress={handleDelete} variant="danger" />

// ============================================================================
// EXAMPLE 9: Modal with Form
// ============================================================================

import { Modal, Alert } from "react-native";

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, type: TransactionType) => Promise<void>;
}

export function AddCategoryModal({
  visible,
  onClose,
  onAdd,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", Strings.categoryRequired);
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(name, type);
      setName("");
      onClose();
      Alert.alert("Success", Strings.categoryAdded);
    } catch (e) {
      Alert.alert("Error", Strings.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
   

          <ThemedText type="subtitle">{Strings.addCategory}</ThemedText>

          <TextInput
            placeholder={Strings.categoryName}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <ActionButton
              title={Strings.cancel}
              onPress={onClose}
              variant="secondary"
            />
            <ActionButton
              title={Strings.add}
              onPress={handleSubmit}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// EXAMPLE 10: Safe Navigation with Error Handling
// ============================================================================

import { router } from "expo-router";
import { Alert } from "react-native";

async function handleAddTransaction(txn: Transaction) {
  try {
    const { addTransaction } = useTransactions();
    await addTransaction(txn);
    Alert.alert("Success", Strings.savedSuccessfully);
    router.back(); // Go back to dashboard
  } catch (error) {
    Alert.alert("Error", Strings.errorOccurred);
    console.error("Add transaction failed:", error);
  }
}

// ============================================================================
// END OF EXAMPLES
// ============================================================================
