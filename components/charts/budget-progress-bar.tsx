/**
 * Budget Progress Component
 * Shows progress bars for each category budget with color coding
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { formatCurrency } from "@/lib/currency";
import React from "react";
import { View } from "react-native";

interface BudgetProgressItem {
  categoryName: string;
  limit: number;
  spent: number;
}

interface BudgetProgressBarProps {
  items: BudgetProgressItem[];
}

function getProgressColor(percentage: number): string {
  if (percentage < 70) return "#27AE60"; // Green
  if (percentage < 90) return "#F39C12"; // Yellow
  return "#E74C3C"; // Red
}

function getStatusText(percentage: number): string {
  if (percentage > 100) return "Overbudget";
  if (percentage >= 90) return "Hampir habis";
  if (percentage >= 70) return "Segera habis";
  return "OK";
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  items,
}) => {
  if (items.length === 0) {
    return (
      <ThemedView style={{ padding: 16, alignItems: "center" }}>
        <ThemedText style={{ color: "#999" }}>
          Belum ada budget yang diatur
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={{
        padding: 20,
        marginBottom: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <ThemedText style={{ fontSize: 16, fontWeight: "600", marginBottom: 16 }}>
        Budget Kategori
      </ThemedText>

      {items.map((item, index) => {
        const percentage = Math.min((item.spent / item.limit) * 100, 100);
        const backgroundColor = getProgressColor(percentage);
        const status = getStatusText(percentage);
        const exceededBy =
          item.spent > item.limit ? item.spent - item.limit : 0;

        return (
          <ThemedView key={index} style={{ marginBottom: 16 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <ThemedText style={{ fontWeight: "500" }}>
                {item.categoryName}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12,
                  color: backgroundColor,
                  fontWeight: "600",
                }}
              >
                {status}
              </ThemedText>
            </View>

            {/* Amount info */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <ThemedText style={{ fontSize: 12 }}>
                {formatCurrency(item.spent)} dari {formatCurrency(item.limit)}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, fontWeight: "600" }}>
                {percentage.toFixed(0)}%
              </ThemedText>
            </View>

            {/* Progress bar */}
            <View
              style={{
                height: 8,
                backgroundColor: "#e0e0e0",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${percentage}%`,
                  backgroundColor,
                  borderRadius: 4,
                }}
              />
            </View>

            {/* Overbudget warning */}
            {exceededBy > 0 && (
              <ThemedText
                style={{
                  fontSize: 11,
                  color: "#E74C3C",
                  marginTop: 4,
                  fontWeight: "500",
                }}
              >
                Melebihi {formatCurrency(exceededBy)}
              </ThemedText>
            )}
          </ThemedView>
        );
      })}
    </ThemedView>
  );
};
