/**
 * Transaction Search & Filter Component
 * Allows searching by description and filtering by date range
 */

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ArthaColors } from "@/constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

interface TransactionFilters {
  searchText: string;
  startDate: string | null;
  endDate: string | null;
}

interface TransactionSearchFilterProps {
  onFilterChange: (filters: TransactionFilters) => void;
}

export const TransactionSearchFilter: React.FC<
  TransactionSearchFilterProps
> = ({ onFilterChange }) => {
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onFilterChange({
      searchText: text,
      startDate: startDate ? formatDateToString(startDate) : null,
      endDate: endDate ? formatDateToString(endDate) : null,
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
      onFilterChange({
        searchText,
        startDate: formatDateToString(selectedDate),
        endDate: endDate ? formatDateToString(endDate) : null,
      });
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
      onFilterChange({
        searchText,
        startDate: startDate ? formatDateToString(startDate) : null,
        endDate: formatDateToString(selectedDate),
      });
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setStartDate(null);
    setEndDate(null);
    onFilterChange({
      searchText: "",
      startDate: null,
      endDate: null,
    });
  };

  const hasActiveFilters = searchText || startDate || endDate;

  return (
    <ThemedView style={styles.card}>
      {/* Search Input */}
      <TextInput
        style={[styles.searchInput, { color: ArthaColors.primaryDark }]}
        placeholder="Cari deskripsi transaksi..."
        placeholderTextColor="#BDBDBD"
        value={searchText}
        onChangeText={handleSearchChange}
      />

      {/* Date Range Filters */}
      <ThemedView style={styles.dateFilterContainer}>
        {/* Start Date */}
        <ThemedView style={styles.dateFilterRow}>
          <ThemedText style={styles.dateLabel}>Dari:</ThemedText>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <ThemedText style={styles.dateButtonText}>
              {startDate ? formatDateToString(startDate) : "Pilih tanggal"}
            </ThemedText>
          </TouchableOpacity>
          {startDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setStartDate(null);
                onFilterChange({
                  searchText,
                  startDate: null,
                  endDate: endDate ? formatDateToString(endDate) : null,
                });
              }}
            >
              <ThemedText style={styles.clearButtonText}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* End Date */}
        <ThemedView style={styles.dateFilterRow}>
          <ThemedText style={styles.dateLabel}>Sampai:</ThemedText>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <ThemedText style={styles.dateButtonText}>
              {endDate ? formatDateToString(endDate) : "Pilih tanggal"}
            </ThemedText>
          </TouchableOpacity>
          {endDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setEndDate(null);
                onFilterChange({
                  searchText,
                  startDate: startDate ? formatDateToString(startDate) : null,
                  endDate: null,
                });
              }}
            >
              <ThemedText style={styles.clearButtonText}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
          <ThemedText style={styles.clearAllButtonText}>
            Hapus Semua Filter
          </ThemedText>
        </TouchableOpacity>
      )}

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartDateChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: ArthaColors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    height: 44,
    borderWidth: 1.5,
    borderColor: ArthaColors.primaryAccent,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: ArthaColors.white,
    fontSize: 14,
    fontWeight: "500",
  },
  dateFilterContainer: {
    gap: 12,
    backgroundColor: ArthaColors.white,
  },
  dateFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ArthaColors.white,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 50,
    color: ArthaColors.primaryDark,
  },
  dateButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: ArthaColors.primaryAccent,
    borderRadius: 10,
    backgroundColor: ArthaColors.white,
  },
  dateButtonText: {
    fontSize: 13,
    color: ArthaColors.primaryDark,
    fontWeight: "500",
  },
  clearButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 18,
    color: ArthaColors.primaryAccent,
    fontWeight: "500",
  },
  clearAllButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: ArthaColors.primaryAccent,
    alignItems: "center",
    backgroundColor: ArthaColors.primaryAccent,
  },
  clearAllButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: ArthaColors.white,
  },
});
