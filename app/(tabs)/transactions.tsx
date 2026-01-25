/**
 * Transactions History Screen
 * List all transactions with month filter and edit/delete options
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { useTransactions } from "@/hooks/storage/useStorage";
import { formatCurrency } from "@/lib/currency";
import {
  formatDate,
  getCurrentMonth,
  getMonthDateRange,
  getMonthYear,
} from "@/lib/date";
import { Transaction } from "@/lib/types";
import React, { useMemo, useState } from "react";
import {
  Alert,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const TransactionsScreen = () => {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const { start, end } = getMonthDateRange(
    selectedMonth.year,
    selectedMonth.month,
  );

  // Filter transactions for selected month and group by date
  const groupedTransactions = useMemo(() => {
    const monthTxns = transactions
      .filter((t) => t.date >= start && t.date <= end)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Group by date
    const groups: Record<string, Transaction[]> = {};
    monthTxns.forEach((txn) => {
      if (!groups[txn.date]) {
        groups[txn.date] = [];
      }
      groups[txn.date].push(txn);
    });

    return Object.entries(groups).map(([date, txns]) => ({
      title: formatDate(date),
      data: txns,
    }));
  }, [transactions, start, end]);

  const handleDelete = async (id: string) => {
    Alert.alert(Strings.deleteCategory, Strings.confirmDelete, [
      { text: Strings.cancel, style: "cancel" },
      {
        text: Strings.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(id);
            Alert.alert("Success", Strings.deletedSuccessfully);
          } catch (e) {
            Alert.alert("Error", Strings.errorOccurred);
          }
        },
      },
    ]);
  };

  const handlePrevMonth = () => {
    let month = selectedMonth.month - 1;
    let year = selectedMonth.year;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    setSelectedMonth({ year, month });
  };

  const handleNextMonth = () => {
    let month = selectedMonth.month + 1;
    let year = selectedMonth.year;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    setSelectedMonth({ year, month });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.wrapper}>
          <ThemedText>{Strings.loading}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {Strings.transactions}
        </ThemedText>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
          <ThemedText style={styles.navButtonText}>‹</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.monthLabel}>
          {getMonthYear(selectedMonth.year, selectedMonth.month)}
        </ThemedText>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <ThemedText style={styles.navButtonText}>›</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      {groupedTransactions.length > 0 ? (
        <SectionList
          sections={groupedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <ThemedText style={styles.sectionHeader}>{title}</ThemedText>
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            {Strings.noTransactions}
          </ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
};

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onDelete,
}) => {
  const isIncome = transaction.type === "income";

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <ThemedText style={styles.transactionCategory}>
          {transaction.category}
        </ThemedText>
        {transaction.notes && (
          <ThemedText style={styles.transactionNotes}>
            {transaction.notes}
          </ThemedText>
        )}
      </View>
      <View style={styles.transactionActions}>
        <ThemedText
          style={[
            styles.transactionAmount,
            isIncome ? styles.amountIncome : styles.amountExpense,
          ]}
        >
          {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
        </ThemedText>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <ThemedText style={styles.deleteButtonText}>
            {Strings.delete}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: ArthaColors.primaryDark,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ArthaColors.white,
    borderBottomWidth: 1,
    borderBottomColor: ArthaColors.gray200,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: ArthaColors.gray100,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: ArthaColors.primaryDark,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: ArthaColors.gray500,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 8,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: ArthaColors.primaryAccent,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginBottom: 4,
  },
  transactionNotes: {
    fontSize: 12,
    color: ArthaColors.gray500,
  },
  transactionActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  amountIncome: {
    color: ArthaColors.success,
  },
  amountExpense: {
    color: ArthaColors.error,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: ArthaColors.error,
  },
  deleteButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: ArthaColors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: ArthaColors.gray500,
  },
});

export default TransactionsScreen;
