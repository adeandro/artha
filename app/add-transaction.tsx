/**
 * Add Transaction Screen
 * Quick form for adding income or expense
 */

import { ThemedText } from "@/components/themed-text";
import { ArthaColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { useDashboardContext } from "@/context/DashboardContext";
import { useCategories, useTransactions } from "@/hooks/storage/useStorage";
import { formatCurrency, parseCurrency } from "@/lib/currency";
import { getTodayDateString } from "@/lib/date";
import { Transaction, TransactionType } from "@/lib/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const AddTransactionScreen = () => {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState(getTodayDateString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");

  const { addTransaction } = useTransactions();
  const { categories } = useCategories();
  const { activeDashboardId } = useDashboardContext();

  // Format date from Date object to YYYY-MM-DD string
  const formatDateToString = (dateObj: Date): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Parse date string to Date object
  const stringToDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Handle date picker change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      const formattedDate = formatDateToString(selectedDate);
      setDate(formattedDate);
      if (__DEV__) console.log("[DATE] Selected:", formattedDate);
    }
  };

  // Filter categories by transaction type
  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === transactionType),
    [categories, transactionType],
  );

  const handleTypeToggle = (type: TransactionType) => {
    setTransactionType(type);
    setCategory(null); // Reset category when type changes
  };

  const handleAddTransaction = async () => {
    // Validation
    if (!amount || parseCurrency(amount) === 0) {
      Alert.alert("Error", Strings.amount + " " + Strings.categoryRequired);
      return;
    }
    if (!category) {
      Alert.alert("Error", Strings.categoryRequired);
      return;
    }

    try {
      const transaction: Transaction = {
        id: Date.now().toString(),
        date,
        type: transactionType,
        category,
        amount: parseCurrency(amount),
        notes: notes.trim() || undefined,
        dashboardId: activeDashboardId,
      };

      await addTransaction(transaction);
      Alert.alert("Success", Strings.savedSuccessfully);
      router.back();
    } catch {
      Alert.alert("Error", Strings.errorOccurred);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {Strings.addTransaction}
            </ThemedText>
          </View>

          {/* Type Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>{Strings.type}</ThemedText>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === "income" && styles.typeButtonActive,
                ]}
                onPress={() => handleTypeToggle("income")}
              >
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    transactionType === "income" && styles.typeButtonTextActive,
                  ]}
                >
                  {Strings.income}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === "expense" && styles.typeButtonActive,
                ]}
                onPress={() => handleTypeToggle("expense")}
              >
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    transactionType === "expense" &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  {Strings.expense}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>{Strings.amount}</ThemedText>
            <View style={styles.amountInputWrapper}>
              <ThemedText style={styles.currencyPrefix}>
                {Strings.currencyPrefix}
              </ThemedText>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor={ArthaColors.gray300}
              />
            </View>
            {amount && (
              <ThemedText style={styles.amountPreview}>
                {formatCurrency(parseCurrency(amount))}
              </ThemedText>
            )}
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>{Strings.category}</ThemedText>
            <View style={styles.categoryGrid}>
              {typeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <ThemedText
                    style={[
                      styles.categoryButtonText,
                      category === cat.id && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Input - Date Picker */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>{Strings.date}</ThemedText>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.datePickerText}>{date}</ThemedText>
              <ThemedText style={styles.datePickerIcon}>📅</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={stringToDate(date)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}

          {/* Close Date Picker Button (iOS) */}
          {showDatePicker && Platform.OS === "ios" && (
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={styles.datePickerDone}
                onPress={() => setShowDatePicker(false)}
              >
                <ThemedText style={styles.datePickerDoneText}>Done</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>{Strings.notes}</ThemedText>
            <TextInput
              style={styles.notesTextarea}
              placeholder={Strings.notes}
              multiline
              numberOfLines={5}
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={ArthaColors.gray300}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.cancelButtonText}>
            {Strings.cancel}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleAddTransaction}
        >
          <ThemedText style={styles.saveButtonText}>{Strings.save}</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ArthaColors.gray50,
  },
  flex1: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 120,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: ArthaColors.white,
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
    color: ArthaColors.gray500,
  },
  typeButtonTextActive: {
    color: ArthaColors.white,
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
    color: ArthaColors.primaryDark,
  },
  amountPreview: {
    marginTop: 8,
    fontSize: 14,
    color: ArthaColors.primaryAccent,
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: ArthaColors.white,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
    marginRight: 4,
    marginBottom: 4,
  },
  categoryButtonSelected: {
    backgroundColor: ArthaColors.primaryAccent,
    borderColor: ArthaColors.primaryAccent,
  },
  categoryButtonText: {
    fontSize: 13,
    color: ArthaColors.gray600,
  },
  categoryButtonTextSelected: {
    color: ArthaColors.white,
    fontWeight: "600",
  },
  dateInput: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
    fontSize: 14,
    color: ArthaColors.primaryDark,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
  },
  datePickerText: {
    fontSize: 14,
    fontWeight: "500",
    color: ArthaColors.primaryDark,
    flex: 1,
  },
  datePickerIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  datePickerActions: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: ArthaColors.white,
    borderTopWidth: 1,
    borderTopColor: ArthaColors.gray200,
    alignItems: "flex-end",
  },
  datePickerDone: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: ArthaColors.primaryAccent,
    borderRadius: 6,
  },
  datePickerDoneText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
  },
  notesInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
    fontSize: 14,
    color: ArthaColors.primaryDark,
    textAlignVertical: "top",
  },
  notesTextarea: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.white,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ArthaColors.gray200,
    fontSize: 14,
    color: ArthaColors.primaryDark,
    textAlignVertical: "top",
    minHeight: 120,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ArthaColors.white,
    borderTopWidth: 1,
    borderTopColor: ArthaColors.gray200,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
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
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: ArthaColors.white,
  },
});

export default AddTransactionScreen;
