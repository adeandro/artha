/**
 * Dashboard Screen
 * Shows monthly summary and key statistics
 */

import { BudgetProgressBar } from "@/components/charts/budget-progress-bar";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import {
  useBudgets,
  useCategories,
  useTransactions,
} from "@/hooks/storage/useStorage";
import { formatCurrency } from "@/lib/currency";
import { formatDate, getCurrentMonth, getMonthDateRange } from "@/lib/date";
import { exportTransactionsToExcel } from "@/lib/excel-export";
import { Link } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DashboardScreenComponent = () => {
  const { transactions, loading } = useTransactions();
  const { categories } = useCategories();
  const { year, month } = getCurrentMonth();
  const { start, end } = getMonthDateRange(year, month);
  const [isExporting, setIsExporting] = useState(false);

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
        const categoryName =
          categories.find((c) => c.id === t.category)?.name || t.category;
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = { name: categoryName, amount: 0 };
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
  }, [transactions, start, end, categories]);

  const { budgets } = useBudgets();

  // Prepare data for Pie Chart
  const categoryBreakdown = useMemo(() => {
    const totalExpense = stats.topCategories.reduce(
      (sum, cat) => sum + cat.amount,
      0,
    );
    return stats.topCategories.map((cat) => ({
      name: cat.name,
      amount: cat.amount,
      percentage: totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0,
    }));
  }, [stats.topCategories]);

  // Prepare data for Budget Progress Bars
  const currentMonthBudgets = useMemo(() => {
    return budgets
      .filter((b) => b.year === year && b.month === month)
      .map((budget) => {
        const categoryName =
          categories.find((c) => c.id === budget.categoryId)?.name ||
          budget.categoryId;
        const spent = transactions
          .filter(
            (t) =>
              t.category === budget.categoryId &&
              t.type === "expense" &&
              t.date.startsWith(`${year}-${String(month).padStart(2, "0")}`),
          )
          .reduce((sum, t) => sum + t.amount, 0);

        return { categoryName, limit: budget.limit, spent };
      });
  }, [budgets, year, month, categories, transactions]);

  // Handler untuk export data ke Excel
  const handleExportExcel = async () => {
    if (transactions.length === 0) {
      Alert.alert("Info", Strings.noDataToExport);
      return;
    }

    setIsExporting(true);
    try {
      // Buat mapping dari category ID ke nama
      const categoryMap: Record<string, string> = {};
      categories.forEach((cat) => {
        categoryMap[cat.id] = cat.name;
      });

      // Panggil export function
      await exportTransactionsToExcel(transactions, categoryMap);
      Alert.alert("Sukses", Strings.exportSuccess);
    } catch (error) {
      Alert.alert("Error", Strings.exportFailed);
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
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
            {stats.balance >= 0 ? "" : "-"}
            {formatCurrency(Math.abs(stats.balance))}
          </ThemedText>
        </View>

        {/* Category Pie Chart */}
        {stats.topCategories.length > 0 && (
          <CategoryPieChart
            data={categoryBreakdown}
            total={stats.totalExpense}
          />
        )}

        {/* Budget Progress Bars */}
        {currentMonthBudgets.length > 0 && (
          <BudgetProgressBar items={currentMonthBudgets} />
        )}

        {/* Recent Transactions */}
        {stats.recentTransactions.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Transaksi Terakhir
            </ThemedText>
            <View style={styles.recentTransactionsList}>
              {stats.recentTransactions.map((txn) => {
                const catName =
                  categories.find((c) => c.id === txn.category)?.name ||
                  txn.category;
                return (
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
                        {catName}
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
                );
              })}
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

        {/* Export Button */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.exportButton,
                isExporting && styles.buttonDisabled,
              ]}
              onPress={handleExportExcel}
              disabled={isExporting}
            >
              <ThemedText style={styles.exportButtonText}>
                {isExporting ? Strings.exportingData : Strings.exportExcel}
              </ThemedText>
            </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  expenseCard: {
    backgroundColor: ArthaColors.error,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceNegative: {
    backgroundColor: ArthaColors.error,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
  exportButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: ArthaColors.primaryAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
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

export const DashboardScreen = DashboardScreenComponent;
export default DashboardScreenComponent;
