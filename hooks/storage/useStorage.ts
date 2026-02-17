/**
 * AsyncStorage hooks for Artha
 */

import { Category, Transaction } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

const KEYS = {
  TRANSACTIONS: "artha_transactions",
  CATEGORIES: "artha_categories",
  PIN_HASH: "artha_pin_hash",
  PIN_SET: "artha_pin_set",
};

// ============= Transactions =============

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      setTransactions(stored ? JSON.parse(stored) : []);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load transactions", e);
      setLoading(false);
    }
  }, []);

  // Load transactions on mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const saveTransactions = useCallback(async (txns: Transaction[]) => {
    try {
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txns));
      setTransactions(txns);
    } catch (e) {
      console.error("Failed to save transactions", e);
    }
  }, []);

  const addTransaction = useCallback(
    async (transaction: Transaction) => {
      const updated = [...transactions, transaction];
      await saveTransactions(updated);
    },
    [transactions, saveTransactions],
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      );
      await saveTransactions(updated);
    },
    [transactions, saveTransactions],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const updated = transactions.filter((t) => t.id !== id);
      await saveTransactions(updated);
    },
    [transactions, saveTransactions],
  );

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};

// ============= Categories =============

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Default categories in Bahasa Indonesia
  const defaultCategories: Category[] = [
    { id: "salary", name: "Gaji", type: "income" },
    { id: "bonus", name: "Bonus", type: "income" },
    { id: "other_income", name: "Lainnya", type: "income" },

    { id: "food", name: "Makanan", type: "expense" },
    { id: "transport", name: "Transportasi", type: "expense" },
    { id: "utilities", name: "Utilitas", type: "expense" },
    { id: "entertainment", name: "Hiburan", type: "expense" },
    { id: "healthcare", name: "Kesehatan", type: "expense" },
    { id: "education", name: "Pendidikan", type: "expense" },
    { id: "shopping", name: "Belanja", type: "expense" },
    { id: "other_expense", name: "Lainnya", type: "expense" },
  ];

  const loadCategories = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.CATEGORIES);
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        // Initialize with default categories
        await AsyncStorage.setItem(
          KEYS.CATEGORIES,
          JSON.stringify(defaultCategories),
        );
        setCategories(defaultCategories);
      }
    } catch (e) {
      console.error("Failed to load categories", e);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  const saveCategories = useCallback(async (cats: Category[]) => {
    try {
      await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
      setCategories(cats);
    } catch (e) {
      console.error("Failed to save categories", e);
    }
  }, []);

  const addCategory = useCallback(
    async (category: Category) => {
      const updated = [...categories, category];
      await saveCategories(updated);
    },
    [categories, saveCategories],
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      const updated = categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      );
      await saveCategories(updated);
    },
    [categories, saveCategories],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const updated = categories.filter((c) => c.id !== id);
      await saveCategories(updated);
    },
    [categories, saveCategories],
  );

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};

// ============= PIN =============

export const usePinStorage = () => {
  const getPinHash = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(KEYS.PIN_HASH);
    } catch (e) {
      console.error("Failed to get PIN hash", e);
      return null;
    }
  }, []);

  const setPinHash = useCallback(async (hash: string) => {
    try {
      await AsyncStorage.setItem(KEYS.PIN_HASH, hash);
      await AsyncStorage.setItem(KEYS.PIN_SET, "true");
    } catch (e) {
      console.error("Failed to set PIN hash", e);
    }
  }, []);

  const isPinSet = useCallback(async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(KEYS.PIN_SET);
      return value === "true";
    } catch (e) {
      console.error("Failed to check if PIN is set", e);
      return false;
    }
  }, []);

  return { getPinHash, setPinHash, isPinSet };
};
