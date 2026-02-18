/**
 * Monthly Trend Bar Chart Component
 * Shows Income vs Expense trend over 6 months with professional styling
 */

import { ThemedText } from "@/components/themed-text";
import { ArthaColors } from "@/constants/colors";
import { formatCurrency } from "@/lib/currency";
import React, { useState, useEffect } from "react";
import { Dimensions, View, Animated, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyData[];
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: ArthaColors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: ArthaColors.primaryDark,
  },
  chartWrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: ArthaColors.primaryDark,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const labels = data.map((item) => item.month);
  const incomeData = data.map((item) => item.income);
  const expenseData = data.map((item) => item.expense);

  // Normalize to millions for readability
  const normalizedIncome = incomeData.map((val) => val / 1000000);
  const normalizedExpense = expenseData.map((val) => val / 1000000);

  // Color scheme: Emerald for Income, Rose for Expense
  const EMERALD = "#10B981";
  const ROSE = "#F43F5E";

  const chartData = {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        data: normalizedIncome,
        color: () => EMERALD,
        barRadius: 6,
      },
      {
        label: "Pengeluaran",
        data: normalizedExpense,
        color: () => ROSE,
        barRadius: 6,
      },
    ],
  };

  const totalIncome = incomeData.reduce((a, b) => a + b, 0);
  const totalExpense = expenseData.reduce((a, b) => a + b, 0);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <ThemedText style={styles.title}>Tren 6 Bulan</ThemedText>

      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          width={screenWidth - 40}
          height={260}
          yAxisLabel=""
          yAxisSuffix="M"
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            color: () => ArthaColors.primaryDark,
            labelColor: () => ArthaColors.primaryDark,
            barPercentage: 0.65,
            style: {
              borderRadius: 12,
            },
            decimalPlaces: 1,
          }}
          verticalLabelRotation={0}
          showValuesOnTopOfBars={false}
        />
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: EMERALD }]} />
          <ThemedText style={styles.legendLabel}>Pemasukan</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: ROSE }]} />
          <ThemedText style={styles.legendLabel}>Pengeluaran</ThemedText>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Total Pemasukan:</ThemedText>
          <ThemedText style={[styles.statValue, { color: EMERALD }]}>
            {formatCurrency(totalIncome)}
          </ThemedText>
        </View>
        <View style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Total Pengeluaran:</ThemedText>
          <ThemedText style={[styles.statValue, { color: ROSE }]}>
            {formatCurrency(totalExpense)}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
};
