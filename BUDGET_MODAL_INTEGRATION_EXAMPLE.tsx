/**
 * EXAMPLE: Budget Modal Integration in Settings
 * This shows how to use the BudgetModal component in the Settings page
 */

// Example code snippet for app/(tabs)/settings.tsx or appropriate settings page

import { BudgetModal } from "@/components/modals/budget-modal";
import { useState } from "react";
// ... other imports

export const SettingsScreenComponent = () => {
  // State for budget modal
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedBudgetLimit, setSelectedBudgetLimit] = useState<
    number | undefined
  >(undefined);

  // State management
  const { categories } = useCategories();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { year, month } = getCurrentMonth();

  // Handle opening budget modal
  const handleOpenBudgetModal = (categoryId: string, categoryName: string) => {
    const existingBudget = budgets.find(
      (b) =>
        b.categoryId === categoryId && b.year === year && b.month === month,
    );

    setSelectedCategory(categoryName);
    setSelectedCategoryId(categoryId);
    setSelectedBudgetLimit(existingBudget?.limit);
    setBudgetModalVisible(true);
  };

  // Handle saving budget
  const handleSaveBudget = async (limit: number) => {
    const existingBudget = budgets.find(
      (b) =>
        b.categoryId === selectedCategoryId &&
        b.year === year &&
        b.month === month,
    );

    if (existingBudget) {
      // Update existing budget
      await updateBudget(existingBudget.id, { limit });
      Alert.alert("Sukses", Strings.budgetUpdated);
    } else {
      // Create new budget
      const newBudget: Budget = {
        id: `budget_${Date.now()}`,
        categoryId: selectedCategoryId,
        limit,
        year,
        month,
        createdAt: new Date().toISOString(),
      };
      await addBudget(newBudget);
      Alert.alert("Sukses", Strings.budgetAdded);
    }

    setBudgetModalVisible(false);
  };

  // Handle deleting budget
  const handleDeleteBudget = async () => {
    const existingBudget = budgets.find(
      (b) =>
        b.categoryId === selectedCategoryId &&
        b.year === year &&
        b.month === month,
    );

    if (existingBudget) {
      await deleteBudget(existingBudget.id);
      Alert.alert("Sukses", Strings.budgetDeleted);
      setBudgetModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Budget Management Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            📊 {Strings.budgetManagement}
          </ThemedText>

          <ThemedText style={styles.sectionDescription}>
            Atur limit pengeluaran bulanan untuk setiap kategori
          </ThemedText>

          {/* Expense Categories with Budget Buttons */}
          <View style={styles.categoriesList}>
            {categories
              .filter((c) => c.type === "expense")
              .map((category) => {
                const budgetForCategory = budgets.find(
                  (b) =>
                    b.categoryId === category.id &&
                    b.year === year &&
                    b.month === month,
                );

                return (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryBudgetItem}
                    onPress={() =>
                      handleOpenBudgetModal(category.id, category.name)
                    }
                  >
                    <View style={styles.categoryBudgetInfo}>
                      <ThemedText style={styles.categoryBudgetName}>
                        {category.name}
                      </ThemedText>
                      <ThemedText style={styles.categoryBudgetValue}>
                        {budgetForCategory
                          ? formatCurrency(budgetForCategory.limit)
                          : Strings.noBudgetSet}
                      </ThemedText>
                    </View>

                    <ThemedText style={styles.categoryBudgetButton}>
                      {budgetForCategory ? "✏️ Edit" : "➕ Set"}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <ThemedText style={styles.infoTitle}>💡 Tips Anggaran</ThemedText>
          <ThemedText style={styles.infoText}>
            • Anggaran dihitung hanya untuk bulan saat ini (1 sampai akhir
            bulan)
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Anggaran akan otomatis mereset pada tanggal 1 bulan depan
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Pantau progress di Dashboard untuk melihat detail anggaran
          </ThemedText>
        </View>
      </ScrollView>

      {/* Budget Modal */}
      <BudgetModal
        visible={budgetModalVisible}
        categoryName={selectedCategory}
        categoryId={selectedCategoryId}
        currentLimit={selectedBudgetLimit}
        onSave={handleSaveBudget}
        onCancel={() => setBudgetModalVisible(false)}
        onDelete={handleDeleteBudget}
      />
    </SafeAreaView>
  );
};

// Styles example (add to your StyleSheet)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ArthaColors.gray50,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: ArthaColors.primaryDark,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: ArthaColors.gray500,
    marginBottom: 12,
  },
  categoriesList: {
    gap: 10,
  },
  categoryBudgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: ArthaColors.primaryAccent,
  },
  categoryBudgetInfo: {
    flex: 1,
  },
  categoryBudgetName: {
    fontSize: 13,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginBottom: 2,
  },
  categoryBudgetValue: {
    fontSize: 12,
    color: ArthaColors.primaryAccent,
    fontWeight: "700",
  },
  categoryBudgetButton: {
    fontSize: 13,
    fontWeight: "600",
    color: ArthaColors.primaryAccent,
  },
  infoBox: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFBF0",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: ArthaColors.primaryAccent,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: ArthaColors.primaryDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 11,
    color: ArthaColors.gray700,
    lineHeight: 16,
    marginBottom: 4,
  },
});

/**
 * HOOKS REQUIRED (useStorage.ts)
 *
 * Make sure you have these hooks in your useStorage.ts:
 *
 * export const useBudgets = () => {
 *   // Load budgets from AsyncStorage
 *   // Return: { budgets, addBudget, updateBudget, deleteBudget }
 * }
 *
 * Each function should handle AsyncStorage operations for the "artha_budgets" key
 */

/**
 * INTEGRATION CHECKLIST:
 *
 * ✅ Import BudgetModal component
 * ✅ Import required hooks (useCategories, useBudgets, getCurrentMonth)
 * ✅ Import utilities (formatCurrency)
 * ✅ Setup state for modal management
 * ✅ Add budget management section to settings
 * ✅ Handle save/delete budget operations
 * ✅ Connect to AsyncStorage via useBudgets hook
 * ✅ Show budget to user in UI
 * ✅ Filter categories by type="expense"
 * ✅ Display appropriate edit/set button based on budget existence
 * ✅ Add info box with budget tips
 *
 * NAVIGATION:
 * Settings Tab → Budget Management Section → Click Category → Open Modal
 */
