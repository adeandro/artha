/**
 * Settings Screen
 * Category management and PIN change
 */

import { BudgetModal, BudgetModalData } from "@/components/modals/budget-modal";
import { ThemedText } from "@/components/themed-text";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { useAuth } from "@/context/AuthContext";
import {
  useBudgets,
  useCategories,
  useTransactions,
} from "@/hooks/storage/useStorage";
import { formatCurrency } from "@/lib/currency";
import { getCurrentMonth } from "@/lib/date";
import { exportTransactionsToExcel } from "@/lib/excel-export";
import {
  importTransactionsFromExcel,
  validateImportedData,
} from "@/lib/excel-import";
import { Budget, Category, TransactionType } from "@/lib/types";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const SettingsScreen = () => {
  const { categories, addCategory, deleteCategory } = useCategories();
  const { transactions, addTransaction } = useTransactions();
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const { logout } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] =
    useState<TransactionType>("expense");
  const [selectedCategoryForBudget, setSelectedCategoryForBudget] = useState<
    string | null
  >(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", Strings.categoryRequired);
      return;
    }

    try {
      const newCategory: Category = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, "_"),
        name: newCategoryName.trim(),
        type: newCategoryType,
      };
      await addCategory(newCategory);
      setNewCategoryName("");
      setShowAddModal(false);
      Alert.alert("Success", Strings.categoryAdded);
    } catch {
      Alert.alert("Error", Strings.errorOccurred);
    }
  };

  const handleDeleteCategory = (id: string) => {
    Alert.alert(Strings.deleteCategory, Strings.confirmDelete, [
      { text: Strings.cancel, style: "cancel" },
      {
        text: Strings.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(id);
            Alert.alert("Success", Strings.categoryDeleted);
          } catch {
            Alert.alert("Error", Strings.errorOccurred);
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Confirm", "Keluar dari aplikasi?", [
      { text: Strings.cancel, style: "cancel" },
      {
        text: Strings.logout,
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const handleAddBudget = async (budgetData: BudgetModalData) => {
    if (!selectedCategoryForBudget) {
      Alert.alert("Error", "Pilih kategori");
      return;
    }

    try {
      const { year, month } = getCurrentMonth();
      const newBudget: Budget = {
        id: `budget_${Date.now()}`,
        categoryId: selectedCategoryForBudget,
        limit: budgetData.limit,
        year,
        month,
        createdAt: new Date().toISOString(),
        isCustomPeriod: budgetData.isCustomPeriod,
        startDate: budgetData.startDate,
        endDate: budgetData.endDate,
      };

      await addBudget(newBudget);
      setSelectedCategoryForBudget(null);
      setShowAddBudgetModal(false);
      Alert.alert("Success", "Budget berhasil ditambahkan");
    } catch {
      Alert.alert("Error", "Gagal menambahkan budget");
    }
  };

  // Handler untuk export transaksi ke Excel
  const handleExportTransactions = async () => {
    if (transactions.length === 0) {
      Alert.alert("Info", Strings.noDataToExport);
      return;
    }

    setIsExporting(true);
    try {
      const categoryMap: Record<string, string> = {};
      categories.forEach((cat) => {
        categoryMap[cat.id] = cat.name;
      });

      await exportTransactionsToExcel(transactions, categoryMap);
      Alert.alert("Sukses", Strings.exportSuccess);
    } catch (error) {
      Alert.alert("Error", Strings.exportFailed);
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handler untuk import transaksi dari Excel
  const handleImportTransactions = async () => {
    setIsImporting(true);
    try {
      // Step 1: Import data dari Excel
      const result = await importTransactionsFromExcel();

      // Step 2: Check jika berhasil dan ada data
      if (!result.success || result.successCount === 0) {
        const errorMsg =
          result.errors.length > 0 ? result.errors[0] : "Gagal mengimport data";
        Alert.alert("Error", errorMsg);
        return;
      }

      // Step 3: Validate imported data
      const validation = validateImportedData(result.data);
      if (!validation.valid) {
        Alert.alert("Validation Error", validation.errors.join("\n"));
        return;
      }

      // Step 4: Ask user untuk confirm sebelum import
      Alert.alert(
        "Konfirmasi Import",
        `Akan mengimport ${result.successCount} transaksi. ${result.failedCount > 0 ? `${result.failedCount} transaksi gagal.` : ""}`,
        [
          { text: Strings.cancel, style: "cancel" },
          {
            text: "Import",
            style: "default",
            onPress: async () => {
              try {
                // Step 5: Save transaksi ke AsyncStorage
                for (const tx of result.data) {
                  await addTransaction(tx);
                }

                // Success message
                Alert.alert(
                  "Sukses",
                  `Berhasil mengimport ${result.successCount} transaksi`,
                );
              } catch (saveError) {
                Alert.alert("Error", "Gagal menyimpan transaksi ke database");
                console.error("Save failed:", saveError);
              }
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", Strings.importFailed);
      console.error("Import failed:", error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {Strings.settings}
          </ThemedText>
        </View>

        {/* PIN Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {Strings.pin}
          </ThemedText>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowChangePinModal(true)}
          >
            <ThemedText style={styles.buttonText}>
              {Strings.changePin}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {Strings.categoryManagement}
            </ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <ThemedText style={styles.addButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Income Categories */}
          <View style={styles.categoryGroup}>
            <ThemedText style={styles.categoryGroupTitle}>
              {Strings.income}
            </ThemedText>
            {categories
              .filter((c) => c.type === "income")
              .map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onDelete={() => handleDeleteCategory(cat.id)}
                />
              ))}
          </View>

          {/* Expense Categories */}
          <View style={styles.categoryGroup}>
            <ThemedText style={styles.categoryGroupTitle}>
              {Strings.expense}
            </ThemedText>
            {categories
              .filter((c) => c.type === "expense")
              .map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onDelete={() => handleDeleteCategory(cat.id)}
                />
              ))}
          </View>
        </View>

        {/* Budget Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Setting Budget
            </ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddBudgetModal(true)}
            >
              <ThemedText style={styles.addButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Current Budgets */}
          {budgets
            .filter(
              (b) =>
                b.year === getCurrentMonth().year &&
                b.month === getCurrentMonth().month,
            )
            .map((budget) => {
              const categoryName =
                categories.find((c) => c.id === budget.categoryId)?.name ||
                budget.categoryId;
              return (
                <View key={budget.id} style={styles.budgetItem}>
                  <View style={styles.budgetInfo}>
                    <ThemedText style={styles.budgetCategory}>
                      {categoryName}
                    </ThemedText>
                    <ThemedText style={styles.budgetLimit}>
                      {formatCurrency(budget.limit)}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        "Hapus Budget",
                        "Yakin ingin menghapus budget ini?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Hapus",
                            style: "destructive",
                            onPress: () => deleteBudget(budget.id),
                          },
                        ],
                      );
                    }}
                  >
                    <ThemedText style={styles.deleteButtonText}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
              );
            })}
        </View>

        {/* Data & Backup Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {Strings.dataBackup}
          </ThemedText>

          {/* Export Button */}
          <TouchableOpacity
            style={[styles.button, isExporting && styles.buttonDisabled]}
            onPress={handleExportTransactions}
            disabled={isExporting}
          >
            {isExporting ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color={ArthaColors.white} />
                <ThemedText style={styles.buttonText}>
                  {Strings.exportingData}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.buttonText}>
                {Strings.exportExcel}
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Import Button */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.importButton,
              isImporting && styles.buttonDisabled,
            ]}
            onPress={handleImportTransactions}
            disabled={isImporting}
          >
            {isImporting ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color={ArthaColors.white} />
                <ThemedText style={styles.buttonText}>
                  {Strings.importingData}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.buttonText}>
                {Strings.importExcel}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutButtonText}>
              {Strings.logout}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {Strings.about}
          </ThemedText>
          <View style={styles.aboutContent}>
            <ThemedText style={styles.aboutLabel}>{Strings.appName}</ThemedText>
            <ThemedText style={styles.aboutText}>v1.3.2</ThemedText>
            <ThemedText style={[styles.aboutLabel, { marginTop: 12 }]}>
              Author
            </ThemedText>
            <ThemedText style={styles.aboutText}>Ade Ariawan</ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              scrollEnabled={true}
            >
              <View style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  {Strings.addCategory}
                </ThemedText>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.label}>
                    {Strings.categoryName}
                  </ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder={Strings.categoryName}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholderTextColor={ArthaColors.gray300}
                  />
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.label}>{Strings.type}</ThemedText>
                  <View style={styles.typeToggle}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        newCategoryType === "income" && styles.typeButtonActive,
                      ]}
                      onPress={() => setNewCategoryType("income")}
                    >
                      <ThemedText
                        style={[
                          styles.typeButtonText,
                          newCategoryType === "income" &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        {Strings.income}
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        newCategoryType === "expense" &&
                          styles.typeButtonActive,
                      ]}
                      onPress={() => setNewCategoryType("expense")}
                    >
                      <ThemedText
                        style={[
                          styles.typeButtonText,
                          newCategoryType === "expense" &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        {Strings.expense}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowAddModal(false);
                    }}
                  >
                    <ThemedText style={styles.cancelButtonText}>
                      {Strings.cancel}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleAddCategory}
                  >
                    <ThemedText style={styles.saveButtonText}>
                      {Strings.add}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Budget Modal */}
      <BudgetModal
        visible={showAddBudgetModal}
        categoryName={
          categories.find((c) => c.id === selectedCategoryForBudget)?.name || ""
        }
        categoryId={selectedCategoryForBudget || ""}
        onSave={handleAddBudget}
        onCancel={() => {
          setShowAddBudgetModal(false);
          setSelectedCategoryForBudget(null);
        }}
      />

      {/* Change PIN Modal */}
      <Modal visible={showChangePinModal} transparent animationType="slide">
        <ChangePinModal onClose={() => setShowChangePinModal(false)} />
      </Modal>
    </SafeAreaView>
  );
};

interface CategoryRowProps {
  category: Category;
  onDelete: () => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ category, onDelete }) => {
  return (
    <View style={styles.categoryRow}>
      <ThemedText style={styles.categoryRowName}>{category.name}</ThemedText>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <ThemedText style={styles.deleteButtonText}>
          {Strings.delete}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

interface ChangePinModalProps {
  onClose: () => void;
}

const ChangePinModal: React.FC<ChangePinModalProps> = ({ onClose }) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"first" | "confirm">("first");
  const { setPin: savePin } = useAuth();

  const handleDigitPress = (digit: string) => {
    if (step === "first" && pin.length < 6) {
      setPin(pin + digit);
    } else if (step === "confirm" && confirmPin.length < 6) {
      setConfirmPin(confirmPin + digit);
    }
  };

  const handleDelete = () => {
    if (step === "first" && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (step === "confirm" && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (step === "first") {
      if (pin.length !== 6) {
        Alert.alert("Error", Strings.pinMustBe6Digits);
        return;
      }
      setStep("confirm");
    } else {
      if (confirmPin.length !== 6) {
        Alert.alert("Error", Strings.pinMustBe6Digits);
        return;
      }
      if (pin !== confirmPin) {
        Alert.alert("Error", Strings.pinNotMatch);
        setPin("");
        setConfirmPin("");
        setStep("first");
        return;
      }
      const success = await savePin(pin);
      if (success) {
        Alert.alert("Success", Strings.pinSetSuccessfully);
        onClose();
      }
    }
  };

  const currentPin = step === "first" ? pin : confirmPin;
  const isReady =
    (step === "first" && pin.length === 6) ||
    (step === "confirm" && confirmPin.length === 6);

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <ThemedText type="subtitle" style={styles.modalTitle}>
          {Strings.changePin}
        </ThemedText>

        {/* PIN Display */}
        <View style={styles.pinDisplay}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.pinDot,
                i < currentPin.length && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <TouchableOpacity
              key={digit}
              style={styles.key}
              onPress={() => handleDigitPress(digit.toString())}
            >
              <ThemedText style={styles.keyText}>{digit}</ThemedText>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.key}
            onPress={() => handleDigitPress("0")}
          >
            <ThemedText style={styles.keyText}>0</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.key, styles.deleteKey]}
            onPress={handleDelete}
          >
            <ThemedText style={styles.deleteKeyText}>⌫</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>
              {Strings.cancel}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modalButton,
              styles.saveButton,
              !isReady && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isReady}
          >
            <ThemedText style={styles.saveButtonText}>
              {step === "first" ? Strings.confirmPin : Strings.save}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: ArthaColors.primaryAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
  },
  importButton: {
    backgroundColor: ArthaColors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ArthaColors.primaryAccent,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 24,
    color: ArthaColors.white,
    fontWeight: "bold",
  },
  categoryGroup: {
    marginBottom: 16,
  },
  categoryGroupTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: ArthaColors.gray500,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
  },
  categoryRowName: {
    fontSize: 14,
    color: ArthaColors.primaryDark,
    flex: 1,
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
  budgetItem: {
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
  budgetInfo: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 13,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginBottom: 2,
  },
  budgetLimit: {
    fontSize: 12,
    color: ArthaColors.gray600,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: ArthaColors.gray300,
    borderRadius: 8,
    backgroundColor: ArthaColors.white,
    marginTop: 8,
  },
  picker: {
    height: 50,
    color: ArthaColors.primaryDark,
  },
  logoutButton: {
    backgroundColor: ArthaColors.error,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
  },
  aboutContent: {
    backgroundColor: ArthaColors.gray100,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  aboutLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: ArthaColors.gray600,
  },
  aboutText: {
    fontSize: 14,
    color: ArthaColors.gray700,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: ArthaColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginBottom: 8,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
    fontSize: 14,
    color: ArthaColors.primaryDark,
  },
  typeToggle: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: ArthaColors.gray100,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: ArthaColors.primaryAccent,
    borderColor: ArthaColors.primaryAccent,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.gray600,
  },
  typeButtonTextActive: {
    color: ArthaColors.white,
  },
  pinDisplay: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: ArthaColors.gray300,
  },
  pinDotFilled: {
    backgroundColor: ArthaColors.primaryAccent,
    borderColor: ArthaColors.primaryAccent,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  key: {
    width: "28%",
    aspectRatio: 1.2,
    borderRadius: 8,
    backgroundColor: ArthaColors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteKey: {
    backgroundColor: ArthaColors.error,
  },
  keyText: {
    fontSize: 18,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
  },
  deleteKeyText: {
    fontSize: 18,
    fontWeight: "600",
    color: ArthaColors.white,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: ArthaColors.gray200,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.gray600,
  },
  saveButton: {
    backgroundColor: ArthaColors.primaryAccent,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
});

export default SettingsScreen;
