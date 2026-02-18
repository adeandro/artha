/**
 * Premium Donut Chart Component
 * Pixel-perfect financial visualization with interactive elements
 */

import { ThemedText } from "@/components/themed-text";
import { ArthaColors } from "@/constants/colors";
import { formatCurrency } from "@/lib/currency";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

interface CategoryBreakdown {
  name: string;
  percentage: number;
  amount: number;
}

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
  total: number;
  compact?: boolean;
}

// Fixed color map - consistent colors per category
const CATEGORY_COLORS: Record<string, string> = {
  // Income categories
  Gaji: "#22C55E",
  Bonus: "#84CC16",
  "Lainnya (Pemasukan)": "#10B981",

  // Expense categories
  Makanan: "#FF6B6B",
  Transportasi: "#4ECDC4",
  Utilitas: "#45B7D1",
  Hiburan: "#FF8C42",
  Kesehatan: "#26C485",
  Pendidikan: "#FFE66D",
  Belanja: "#DA70D6",
  Lainnya: "#4D96FF",
};

function getColorForCategory(categoryName: string): string {
  // Check if category exists in mapping
  if (CATEGORY_COLORS[categoryName]) {
    return CATEGORY_COLORS[categoryName];
  }

  // Fallback: generate consistent color based on category name
  const colorPalette = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FF8C42",
    "#26C485",
    "#FFE66D",
    "#DA70D6",
    "#4D96FF",
    "#22C55E",
    "#84CC16",
    "#10B981",
  ];

  // Use hash of category name to pick a color consistently
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = ((hash << 5) - hash) + categoryName.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const colorIndex = Math.abs(hash) % colorPalette.length;
  return colorPalette[colorIndex];
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 0,
    backgroundColor: ArthaColors.white,
    overflow: "hidden",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: ArthaColors.primaryAccent,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: ArthaColors.white,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  chartContainer: {
    backgroundColor: ArthaColors.white,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  donutWrapper: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 280,
    justifyContent: "center",
    alignItems: "center",
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: ArthaColors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  centerValue: {
    fontSize: 18,
    fontWeight: "900",
    color: ArthaColors.primaryAccent,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  legendSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: ArthaColors.white,
    borderTopWidth: 1,
    borderTopColor: "#E8ECEF",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: ArthaColors.primaryDark,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    minWidth: "48%",
  },
  legendItemActive: {
    backgroundColor: "#EBF5FB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendContent: {
    flex: 1,
  },
  legendName: {
    fontSize: 11,
    fontWeight: "700",
    color: ArthaColors.primaryDark,
    marginBottom: 1,
  },
  legendAmount: {
    fontSize: 9,
    fontWeight: "500",
    color: "#888",
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: "900",
    color: ArthaColors.primaryAccent,
    marginLeft: 6,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E8ECEF",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: ArthaColors.white,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#888",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "900",
    color: ArthaColors.primaryAccent,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#AAA",
    fontWeight: "500",
  },
});

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  total,
  compact = false,
}) => {
  const screenWidth = Dimensions.get("window").width;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Filter and sort data
  const validData = data
    .filter((item) => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  if (validData.length === 0) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          {!compact && (
            <View style={styles.headerGradient}>
              <ThemedText style={styles.title}>💰 Pengeluaran</ThemedText>
              <ThemedText style={styles.subtitle}>
                Analisis per kategori
              </ThemedText>
            </View>
          )}
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Tidak ada pengeluaran untuk ditampilkan
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  }

  const topCategory = validData[0];
  const avgPercentage = (100 / validData.length).toFixed(1);

  // Chart sizing
  const chartSize = Math.min(screenWidth - 64, 280);
  const radiusOuter = chartSize / 2;
  const radiusInner = radiusOuter * 0.65; // 60-70% for donut hole
  const centerX = radiusOuter;
  const centerY = radiusOuter;

  // Generate donut segments
  let cumulativePercentage = 0;
  const segments = validData.map((item, index) => {
    const startAngle = (cumulativePercentage / 100) * 360 - 90;
    const endAngle =
      ((cumulativePercentage + item.percentage) / 100) * 360 - 90;
    cumulativePercentage += item.percentage;

    const color = getColorForCategory(item.name);
    const path = createDonutSegmentPath(
      centerX,
      centerY,
      radiusOuter,
      radiusInner,
      startAngle,
      endAngle,
    );

    return {
      name: item.name,
      color,
      path,
      percentage: item.percentage,
      amount: item.amount,
    };
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        {/* Header - Hidden in compact mode */}
        {!compact && (
          <View style={styles.headerGradient}>
            <ThemedText style={styles.title}>💰 Pengeluaran</ThemedText>
            <ThemedText style={styles.subtitle}>
              Analisis per kategori
            </ThemedText>
          </View>
        )}

        {/* Donut Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.donutWrapper}>
            <Svg
              width={chartSize}
              height={chartSize}
              viewBox={`0 0 ${chartSize} ${chartSize}`}
            >
              {segments.map((segment, index) => (
                <Path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  opacity={
                    selectedCategory === null ||
                    selectedCategory === segment.name
                      ? 1
                      : 0.3
                  }
                />
              ))}
            </Svg>

            {/* Center Display */}
            <View style={styles.centerLabel}>
              <ThemedText style={styles.centerLabelText}>Total</ThemedText>
              <ThemedText style={styles.centerValue} numberOfLines={1}>
                {formatCurrency(total)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendSection}>
          <ThemedText style={styles.sectionTitle}>Detail Kategori</ThemedText>
          <View style={styles.legendContainer}>
            {validData.map((item, index) => {
              const isSelected = selectedCategory === item.name;
              const color = getColorForCategory(item.name);

              return (
                <Pressable
                  key={index}
                  onPress={() =>
                    setSelectedCategory(isSelected ? null : item.name)
                  }
                  style={({ pressed }) => [
                    styles.legendItem,
                    isSelected && styles.legendItemActive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: color,
                      },
                    ]}
                  />
                  <View style={styles.legendContent}>
                    <ThemedText style={styles.legendName} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <ThemedText style={styles.legendAmount} numberOfLines={1}>
                      {formatCurrency(item.amount)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.legendPercent}>
                    {item.percentage.toFixed(0)}%
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>Kategori</ThemedText>
            <ThemedText style={styles.statValue}>{validData.length}</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>Tertinggi</ThemedText>
            <ThemedText style={styles.statValue}>
              {topCategory?.percentage.toFixed(0)}%
            </ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>Rata-rata</ThemedText>
            <ThemedText style={styles.statValue}>{avgPercentage}%</ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * Generate SVG path for donut segment with rounded corners
 */
function createDonutSegmentPath(
  cx: number,
  cy: number,
  radiusOuter: number,
  radiusInner: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const startAngle = (startAngleDeg * Math.PI) / 180;
  const endAngle = (endAngleDeg * Math.PI) / 180;

  // Outer arc points
  const x1 = cx + radiusOuter * Math.cos(startAngle);
  const y1 = cy + radiusOuter * Math.sin(startAngle);
  const x2 = cx + radiusOuter * Math.cos(endAngle);
  const y2 = cy + radiusOuter * Math.sin(endAngle);

  // Inner arc points
  const x3 = cx + radiusInner * Math.cos(endAngle);
  const y3 = cy + radiusInner * Math.sin(endAngle);
  const x4 = cx + radiusInner * Math.cos(startAngle);
  const y4 = cy + radiusInner * Math.sin(startAngle);

  // Large arc flag
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

  const path = [
    `M ${x1} ${y1}`,
    `A ${radiusOuter} ${radiusOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${radiusInner} ${radiusInner} 0 ${largeArc} 0 ${x4} ${y4}`,
    `Z`,
  ].join(" ");

  return path;
}
