/**
 * Dashboard Screen
 * Shows monthly summary and key statistics
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { useTransactions } from "@/hooks/storage/useStorage";
import { formatCurrency } from "@/lib/currency";
import { formatDate, getCurrentMonth, getMonthDateRange } from "@/lib/date";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const DashboardScreen = () => {
  const { transactions, loading } = useTransactions();
  const { year, month } = getCurrentMonth();
  const { start, end } = getMonthDateRange(year, month);

  const stats = useMemo(() => {
    const monthTransactions = transactions.filter(
      (t) => t.date >= start && t.date <= end,
    );

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Get top 3 expense categories
    const categoryTotals: Record<string, { name: string; amount: number }> = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = { name: t.category, amount: 0 };
        }
        categoryTotals[t.category].amount += t.amount;
      });

    const topCategories = Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Get 5 most recent transactions
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      topCategories,
      recentTransactions,
    };
  }, [transactions, start, end]);

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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {Strings.dashboard}
          </ThemedText>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {/* Income Card */}
          <View style={[styles.card, styles.incomeCard]}>
            <ThemedText style={styles.cardLabel}>
              {Strings.totalIncome}
            </ThemedText>
            <ThemedText style={styles.cardAmount}>
              {formatCurrency(stats.totalIncome)}
            </ThemedText>
          </View>

          {/* Expense Card */}
          <View style={[styles.card, styles.expenseCard]}>
            <ThemedText style={styles.cardLabel}>
              {Strings.totalExpense}
            </ThemedText>
            <ThemedText style={styles.cardAmount}>
              {formatCurrency(stats.totalExpense)}
            </ThemedText>
          </View>
        </View>

        {/* Balance Card */}
        <View
          style={[
            styles.balanceCard,
            stats.balance >= 0
              ? styles.balancePositive
              : styles.balanceNegative,
          ]}
        >
          <ThemedText style={styles.balanceLabel}>
            {stats.balance >= 0 ? Strings.surplus : Strings.deficit}
          </ThemedText>
          <ThemedText style={styles.balanceAmount}>
            {formatCurrency(Math.abs(stats.balance))}
          </ThemedText>
        </View>

        {/* Top Categories */}
        {stats.topCategories.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {Strings.topCategories}
            </ThemedText>
            <View style={styles.categoriesList}>
              {stats.topCategories.map((cat, index) => (
                <View key={index} style={styles.categoryItem}>
                  <ThemedText style={styles.categoryName}>
                    {cat.name}
                  </ThemedText>
                  <ThemedText style={styles.categoryAmount}>
                    {formatCurrency(cat.amount)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Transactions */}
        {stats.recentTransactions.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Transaksi Terakhir
            </ThemedText>
            <View style={styles.recentTransactionsList}>
              {stats.recentTransactions.map((txn) => (
                <View
                  key={txn.id}
                  style={[
                    styles.recentTransactionItem,
                    txn.type === "income"
                      ? styles.incomeItem
                      : styles.expenseItem,
                  ]}
                >
                  <View style={styles.recentTxnLeft}>
                    <ThemedText style={styles.recentTxnCategory}>
                      {txn.category}
                    </ThemedText>
                    <ThemedText style={styles.recentTxnDate}>
                      {formatDate(txn.date)}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[
                      styles.recentTxnAmount,
                      txn.type === "income"
                        ? styles.incomeAmount
                        : styles.expenseAmount,
                    ]}
                  >
                    {txn.type === "income" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              {Strings.noTransactions}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Add Transaction Button */}
      <Link href="/add-transaction" asChild>
        <TouchableOpacity style={styles.fabButton}>
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ArthaColors.gray50,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: ArthaColors.primaryDark,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  incomeCard: {
    backgroundColor: ArthaColors.success,
  },
  expenseCard: {
    backgroundColor: ArthaColors.error,
  },
  cardLabel: {
    fontSize: 12,
    color: ArthaColors.white,
    marginBottom: 8,
    fontWeight: "600",
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: ArthaColors.white,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: "center",
    backgroundColor: ArthaColors.primaryDark,
  },
  balancePositive: {
    backgroundColor: ArthaColors.primaryDark,
  },
  balanceNegative: {
    backgroundColor: ArthaColors.primaryDark,
  },
  balanceLabel: {
    fontSize: 14,
    color: ArthaColors.neutralLight,
    marginBottom: 8,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: ArthaColors.primaryAccent,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginBottom: 12,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: ArthaColors.primaryAccent,
  },
  categoryName: {
    fontSize: 14,
    color: ArthaColors.gray700,
    flex: 1,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
  },
  recentTransactionsList: {
    gap: 8,
  },
  recentTransactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderLeftWidth: 4,
  },
  incomeItem: {
    borderLeftColor: ArthaColors.success,
  },
  expenseItem: {
    borderLeftColor: ArthaColors.error,
  },
  recentTxnLeft: {
    flex: 1,
  },
  recentTxnCategory: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.gray700,
    marginBottom: 4,
  },
  recentTxnDate: {
    fontSize: 12,
    color: ArthaColors.gray500,
  },
  recentTxnAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  incomeAmount: {
    color: ArthaColors.success,
  },
  expenseAmount: {
    color: ArthaColors.error,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: ArthaColors.gray500,
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ArthaColors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: ArthaColors.primaryAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: ArthaColors.white,
    fontWeight: "bold",
  },
});

export default DashboardScreen;
