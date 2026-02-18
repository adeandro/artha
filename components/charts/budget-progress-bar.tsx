/**
 * Advanced Budget Progress Component
 * Dynamic colors, remaining balance, days countdown, and overbudget handling
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { formatCurrency } from "@/lib/currency";
import { getDaysRemainingInMonth } from "@/lib/date";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";

interface BudgetProgressItem {
  categoryName: string;
  limit: number;
  spent: number;
  isCustomPeriod?: boolean;
  endDate?: string;
}

interface BudgetProgressBarProps {
  items: BudgetProgressItem[];
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return "#E74C3C"; // Red - Danger/Overbudget
  if (percentage >= 71) return "#F39C12"; // Yellow - Warning
  return "#27AE60"; // Green - Safe
}

function getStatusText(percentage: number): string {
  if (percentage > 100) return "Melebihi Budget";
  if (percentage >= 90) return "Hampir Habis";
  if (percentage >= 71) return "Peringatan";
  return "Aman";
}

function getStatusEmoji(percentage: number): string {
  if (percentage > 100) return "🚨";
  if (percentage >= 90) return "⚠️";
  if (percentage >= 71) return "⚡";
  return "✅";
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  items,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const daysRemaining = getDaysRemainingInMonth();

  if (items.length === 0) {
    return null;
  }

  // Calculate stats
  const totalBudget = items.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
  const overallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <ThemedView
      style={{
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: ArthaColors.white,
        overflow: "hidden",
        shadowColor: ArthaColors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: ArthaColors.primaryDark,
          borderLeftWidth: 4,
          borderLeftColor: ArthaColors.primaryAccent,
        }}
      >
        <ThemedText
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: ArthaColors.white,
            flex: 1,
            letterSpacing: 0.3,
          }}
        >
          📊 Anggaran Bulanan
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 13,
            color: ArthaColors.primaryAccent,
            fontWeight: "700",
            marginLeft: 12,
          }}
        >
          {isCollapsed ? "▶" : "▼"}
        </ThemedText>
      </TouchableOpacity>

      {/* Content */}
      {!isCollapsed && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          {/* Overall Summary - Show only if multiple categories */}
          {items.length > 1 && (
            <View
              style={{
                marginBottom: 14,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: ArthaColors.primaryDark,
                  }}
                >
                  Total Anggaran
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: getProgressColor(overallPercentage),
                  }}
                >
                  {overallPercentage.toFixed(0)}%
                </ThemedText>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(overallPercentage, 100)}%`,
                    backgroundColor: getProgressColor(overallPercentage),
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          )}

          {/* Individual Categories */}
          {items.map((item, index) => {
            const percentage = Math.min((item.spent / item.limit) * 100, 100);
            const overspent = item.spent - item.limit;
            const remaining = item.limit - item.spent;
            const statusText = getStatusText(percentage);
            const statusEmoji = getStatusEmoji(percentage);
            const progressColor = getProgressColor(percentage);

            return (
              <View
                key={index}
                style={{
                  marginBottom: index < items.length - 1 ? 14 : 0,
                  paddingBottom: index < items.length - 1 ? 12 : 0,
                  borderBottomWidth: index < items.length - 1 ? 1 : 0,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                {/* Category Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: ArthaColors.primaryDark,
                      flex: 1,
                    }}
                  >
                    {item.categoryName}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 11,
                      color: progressColor,
                      fontWeight: "700",
                      marginLeft: 8,
                    }}
                  >
                    {statusEmoji} {statusText}
                  </ThemedText>
                </View>

                {/* Amount Info */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 11,
                      color: ArthaColors.gray500,
                    }}
                  >
                    {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: ArthaColors.primaryDark,
                    }}
                  >
                    {percentage.toFixed(0)}%
                  </ThemedText>
                </View>

                {/* Progress Bar */}
                <View
                  style={{
                    height: 6,
                    backgroundColor: "#E5E7EB",
                    borderRadius: 3,
                    overflow: "hidden",
                    marginBottom: 6,
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: progressColor,
                      borderRadius: 3,
                    }}
                  />
                </View>

                {/* Remaining/Overbudget Info */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color:
                        overspent > 0 ? ArthaColors.error : ArthaColors.success,
                    }}
                  >
                    {overspent > 0
                      ? `🔴 Kelebihan ${formatCurrency(overspent)}`
                      : `✅ Sisa ${formatCurrency(remaining)}`}
                  </ThemedText>
                  {item.isCustomPeriod && item.endDate ? (
                    <ThemedText
                      style={{
                        fontSize: 10,
                        color: ArthaColors.gray400,
                        fontWeight: "500",
                      }}
                    >
                      📅 Hingga{" "}
                      {new Date(item.endDate).toLocaleDateString("id-ID")}
                    </ThemedText>
                  ) : daysRemaining > 0 ? (
                    <ThemedText
                      style={{
                        fontSize: 10,
                        color: ArthaColors.gray400,
                        fontWeight: "500",
                      }}
                    >
                      ⏰ {daysRemaining} hari sampai reset
                    </ThemedText>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ThemedView>
  );
};
