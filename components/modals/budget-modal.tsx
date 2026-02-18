/**
 * Budget Modal Component
 * Modal for setting/editing budget limits for expense categories
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { formatCurrency } from "@/lib/currency";
import React, { useEffect, useState } from "react";
import {
  Alert,
  DatePickerAndroid,
  DatePickerIOS,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface BudgetModalData {
  limit: number;
  isCustomPeriod?: boolean;
  startDate?: string; // ISO format
  endDate?: string; // ISO format
}

interface BudgetModalProps {
  visible: boolean;
  categoryName: string;
  categoryId: string;
  currentLimit?: number;
  currentIsCustomPeriod?: boolean;
  currentStartDate?: string;
  currentEndDate?: string;
  onSave: (data: BudgetModalData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  visible,
  categoryName,
  categoryId,
  currentLimit,
  currentIsCustomPeriod,
  currentStartDate,
  currentEndDate,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [budgetInput, setBudgetInput] = useState<string>(
    currentLimit ? currentLimit.toString() : "",
  );
  const [isCustomPeriod, setIsCustomPeriod] = useState(
    currentIsCustomPeriod || false,
  );
  const [startDate, setStartDate] = useState(
    currentStartDate || new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    currentEndDate || new Date().toISOString().split("T")[0],
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setBudgetInput(currentLimit ? currentLimit.toString() : "");
      setIsCustomPeriod(currentIsCustomPeriod || false);
      setStartDate(currentStartDate || new Date().toISOString().split("T")[0]);
      setEndDate(currentEndDate || new Date().toISOString().split("T")[0]);
    }
  }, [
    visible,
    currentLimit,
    currentIsCustomPeriod,
    currentStartDate,
    currentEndDate,
  ]);

  const formatDateDisplay = (dateString: string) => {
    // Format YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleStartDatePress = async () => {
    if (Platform.OS === "android") {
      try {
        const [year, month, day] = startDate.split("-");
        const {
          action,
          year: selectedYear,
          month: selectedMonth,
          day: selectedDay,
        } = await DatePickerAndroid.open({
          date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
        });
        if (action === DatePickerAndroid.dateSetAction) {
          const newDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
          setStartDate(newDate);
        }
      } catch ({ code }: any) {
        console.warn("Cannot open date picker.", code);
      }
    } else {
      setShowStartDatePicker(true);
    }
  };

  const handleEndDatePress = async () => {
    if (Platform.OS === "android") {
      try {
        const [year, month, day] = endDate.split("-");
        const {
          action,
          year: selectedYear,
          month: selectedMonth,
          day: selectedDay,
        } = await DatePickerAndroid.open({
          date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
        });
        if (action === DatePickerAndroid.dateSetAction) {
          const newDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
          setEndDate(newDate);
        }
      } catch ({ code }: any) {
        console.warn("Cannot open date picker.", code);
      }
    } else {
      setShowEndDatePicker(true);
    }
  };

  const handleSave = () => {
    if (!budgetInput.trim()) {
      Alert.alert("Error", "Masukkan nominal anggaran");
      return;
    }

    const limit = parseInt(budgetInput.replace(/\D/g, ""), 10);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert("Error", "Nominal harus lebih dari 0");
      return;
    }

    if (isCustomPeriod) {
      if (endDate < startDate) {
        Alert.alert(
          "Error",
          "Tanggal akhir harus sama atau setelah tanggal mulai",
        );
        return;
      }
    }

    const data: BudgetModalData = {
      limit,
      isCustomPeriod,
      ...(isCustomPeriod && { startDate, endDate }),
    };

    onSave(data);
    setBudgetInput("");
  };

  const handleDelete = () => {
    Alert.alert("Konfirmasi", `Hapus anggaran untuk ${categoryName}?`, [
      { text: "Batal", onPress: () => {} },
      {
        text: "Hapus",
        onPress: () => {
          onDelete?.();
          setBudgetInput("");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {currentLimit ? Strings.editBudget : Strings.setBudget}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{categoryName}</ThemedText>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <ThemedText style={styles.label}>{Strings.budgetLimit}</ThemedText>

          {/* Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.currencyPrefix}>Rp</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={ArthaColors.gray400}
              keyboardType="number-pad"
              value={budgetInput}
              onChangeText={(text) => setBudgetInput(text)}
            />
          </View>

          {/* Period Type Toggle */}
          <ThemedText style={styles.label}>Tipe Periode Anggaran</ThemedText>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isCustomPeriod && styles.toggleButtonActive,
              ]}
              onPress={() => setIsCustomPeriod(false)}
            >
              <ThemedText
                style={[
                  styles.toggleButtonText,
                  !isCustomPeriod && styles.toggleButtonTextActive,
                ]}
              >
                Bulanan
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isCustomPeriod && styles.toggleButtonActive,
              ]}
              onPress={() => setIsCustomPeriod(true)}
            >
              <ThemedText
                style={[
                  styles.toggleButtonText,
                  isCustomPeriod && styles.toggleButtonTextActive,
                ]}
              >
                Custom
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Custom Date Range (only show if custom period selected) */}
          {isCustomPeriod && (
            <View style={styles.customDateSection}>
              <ThemedText style={styles.dateLabel}>Tanggal Mulai</ThemedText>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleStartDatePress}
              >
                <ThemedText style={styles.datePickerButtonText}>
                  {formatDateDisplay(startDate)}
                </ThemedText>
              </TouchableOpacity>

              <ThemedText style={[styles.dateLabel, { marginTop: 16 }]}>
                Tanggal Akhir
              </ThemedText>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleEndDatePress}
              >
                <ThemedText style={styles.datePickerButtonText}>
                  {formatDateDisplay(endDate)}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Current Budget Display */}
          {currentLimit && (
            <View style={styles.currentBudgetBox}>
              <ThemedText style={styles.currentBudgetLabel}>
                Anggaran Saat Ini
              </ThemedText>
              <ThemedText style={styles.currentBudgetValue}>
                {formatCurrency(currentLimit)}
              </ThemedText>
            </View>
          )}

          {/* Info Text */}
          <View style={styles.infoBox}>
            <ThemedText style={styles.infoText}>
              💡{" "}
              {isCustomPeriod
                ? "Anggaran akan berlaku untuk periode yang dipilih"
                : "Anggaran akan otomatis mereset pada tanggal 1 setiap bulan"}
            </ThemedText>
          </View>

          {/* iOS Date Picker for Start Date */}
          {Platform.OS === "ios" && showStartDatePicker && (
            <View style={styles.iosDatePickerContainer}>
              <View style={styles.iosDatePickerHeader}>
                <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                  <ThemedText style={styles.iosDatePickerDoneText}>
                    Selesai
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <DatePickerIOS
                date={new Date(startDate)}
                onDateChange={(date) => {
                  const iso = date.toISOString().split("T")[0];
                  setStartDate(iso);
                }}
                mode="date"
              />
            </View>
          )}

          {/* iOS Date Picker for End Date */}
          {Platform.OS === "ios" && showEndDatePicker && (
            <View style={styles.iosDatePickerContainer}>
              <View style={styles.iosDatePickerHeader}>
                <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                  <ThemedText style={styles.iosDatePickerDoneText}>
                    Selesai
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <DatePickerIOS
                date={new Date(endDate)}
                onDateChange={(date) => {
                  const iso = date.toISOString().split("T")[0];
                  setEndDate(iso);
                }}
                mode="date"
              />
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {currentLimit && onDelete && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <ThemedText style={styles.deleteButtonText}>
                {Strings.deleteBudget}
              </ThemedText>
            </TouchableOpacity>
          )}

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <ThemedText style={styles.cancelButtonText}>
                {Strings.cancel}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <ThemedText style={styles.saveButtonText}>
                {Strings.save}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: ArthaColors.primaryDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: ArthaColors.gray500,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: ArthaColors.white,
    maxHeight: "80%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: ArthaColors.gray500,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: ArthaColors.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ArthaColors.primaryAccent,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "700",
    color: ArthaColors.primaryAccent,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: ArthaColors.primaryDark,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.gray100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ArthaColors.gray300,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: ArthaColors.primaryAccent,
    borderColor: ArthaColors.primaryAccent,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: ArthaColors.gray600,
  },
  toggleButtonTextActive: {
    color: ArthaColors.white,
  },
  customDateSection: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.gray50,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ArthaColors.primaryAccent,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: ArthaColors.gray500,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: ArthaColors.primaryAccent,
    justifyContent: "center",
  },
  datePickerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    textAlign: "center",
  },
  currentBudgetBox: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.gray50,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentBudgetLabel: {
    fontSize: 11,
    color: ArthaColors.gray500,
    marginBottom: 4,
    fontWeight: "600",
  },
  currentBudgetValue: {
    fontSize: 16,
    fontWeight: "700",
    color: ArthaColors.primaryAccent,
  },
  infoBox: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFBF0",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: ArthaColors.primaryAccent,
  },
  infoText: {
    fontSize: 12,
    color: ArthaColors.gray700,
    lineHeight: 18,
  },
  iosDatePickerContainer: {
    backgroundColor: ArthaColors.white,
    borderTopWidth: 1,
    borderTopColor: ArthaColors.gray300,
    marginTop: 16,
    marginHorizontal: -20,
    marginBottom: -24,
    paddingHorizontal: 20,
  },
  iosDatePickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ArthaColors.gray300,
  },
  iosDatePickerDoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: ArthaColors.primaryAccent,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: ArthaColors.white,
  },
  deleteButton: {
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: ArthaColors.error,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
    textAlign: "center",
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: ArthaColors.gray200,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
  },
  saveButton: {
    backgroundColor: ArthaColors.primaryAccent,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
  },
});
