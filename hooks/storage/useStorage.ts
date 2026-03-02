/**
 * AsyncStorage hooks for Artha
 */

import { Budget, Category, Dashboard, Transaction } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

const KEYS = {
  TRANSACTIONS: "artha_transactions",
  CATEGORIES: "artha_categories",
  PIN_HASH: "artha_pin_hash",
  PIN_SET: "artha_pin_set",
  BUDGETS: "artha_budgets",
  BIOMETRIC_ENABLED: "artha_biometric_enabled",
  DASHBOARDS: "artha_dashboards",
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
  const getDefaultCategories = (dashboardId: string = "default"): Category[] => {
    const ts = Date.now();
    return [
      { id: `salary_${ts}`, name: "Gaji", type: "income", dashboardId },
      { id: `bonus_${ts}`, name: "Bonus", type: "income", dashboardId },
      { id: `other_inc_${ts}`, name: "Lainnya", type: "income", dashboardId },

      { id: `food_${ts}`, name: "Makanan", type: "expense", dashboardId },
      { id: `transport_${ts}`, name: "Transportasi", type: "expense", dashboardId },
      { id: `util_${ts}`, name: "Utilitas", type: "expense", dashboardId },
      { id: `ent_${ts}`, name: "Hiburan", type: "expense", dashboardId },
      { id: `health_${ts}`, name: "Kesehatan", type: "expense", dashboardId },
      { id: `edu_${ts}`, name: "Pendidikan", type: "expense", dashboardId },
      { id: `shop_${ts}`, name: "Belanja", type: "expense", dashboardId },
      { id: `other_exp_${ts}`, name: "Lainnya", type: "expense", dashboardId },
    ];
  };

  const loadCategories = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.CATEGORIES);
      if (stored) {
        const parsed: Category[] = JSON.parse(stored);
        // Backward compatibility: missing dashboardId gets "default"
        const migrated = parsed.map(c => ({
          ...c,
          dashboardId: c.dashboardId || "default"
        }));
        setCategories(migrated);
      } else {
        // Initialize with default categories for main book
        const initial = getDefaultCategories("default");
        await AsyncStorage.setItem(
          KEYS.CATEGORIES,
          JSON.stringify(initial),
        );
        setCategories(initial);
      }
    } catch (e) {
      console.error("Failed to load categories", e);
      setCategories(getDefaultCategories("default"));
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

  const seedCategoriesForDashboard = useCallback(
    async (dashboardId: string) => {
      const newCats = getDefaultCategories(dashboardId);
      const updated = [...categories, ...newCats];
      await saveCategories(updated);
    },
    [categories, saveCategories]
  );

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    seedCategoriesForDashboard,
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

// ============= Budgets =============

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBudgets = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.BUDGETS);
      setBudgets(stored ? JSON.parse(stored) : []);
    } catch (e) {
      console.error("Failed to load budgets", e);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets]),
  );

  const saveBudgets = useCallback(async (buds: Budget[]) => {
    try {
      await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(buds));
      setBudgets(buds);
    } catch (e) {
      console.error("Failed to save budgets", e);
    }
  }, []);

  const addBudget = useCallback(
    async (budget: Budget) => {
      const updated = [...budgets, budget];
      await saveBudgets(updated);
    },
    [budgets, saveBudgets],
  );

  const updateBudget = useCallback(
    async (id: string, updates: Partial<Budget>) => {
      const updated = budgets.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      );
      await saveBudgets(updated);
    },
    [budgets, saveBudgets],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      const updated = budgets.filter((b) => b.id !== id);
      await saveBudgets(updated);
    },
    [budgets, saveBudgets],
  );

  const getBudgetForCategory = useCallback(
    (categoryId: string, year: number, month: number) => {
      return budgets.find(
        (b) =>
          b.categoryId === categoryId && b.year === year && b.month === month,
      );
    },
    [budgets],
  );

  return {
    budgets,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetForCategory,
  };
};

// ============= Biometric Preference =============

export const useBiometricStorage = () => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBiometricPreference = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
      setIsBiometricEnabled(stored === "true");
    } catch (e) {
      console.error("Failed to load biometric preference", e);
      setIsBiometricEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadBiometricPreference();
  }, [loadBiometricPreference]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadBiometricPreference();
    }, [loadBiometricPreference]),
  );

  const setBiometricEnabled = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(
        KEYS.BIOMETRIC_ENABLED,
        enabled ? "true" : "false",
      );
      setIsBiometricEnabled(enabled);
    } catch (e) {
      console.error("Failed to save biometric preference", e);
    }
  }, []);

  return {
    isBiometricEnabled,
    loading,
    setBiometricEnabled,
  };
};

// ============= Dashboards =============

export const useDashboards = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultDashboards: Dashboard[] = [
    {
      id: "default",
      name: "Buku Utama",
      createdAt: new Date().toISOString(),
      isDefault: true,
    },
  ];

  const loadDashboards = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.DASHBOARDS);
      if (stored) {
        setDashboards(JSON.parse(stored));
      } else {
        await AsyncStorage.setItem(
          KEYS.DASHBOARDS,
          JSON.stringify(defaultDashboards),
        );
        setDashboards(defaultDashboards);
      }
    } catch (e) {
      console.error("Failed to load dashboards", e);
      setDashboards(defaultDashboards);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  useFocusEffect(
    useCallback(() => {
      loadDashboards();
    }, [loadDashboards]),
  );

  const saveDashboards = useCallback(async (dash: Dashboard[]) => {
    try {
      await AsyncStorage.setItem(KEYS.DASHBOARDS, JSON.stringify(dash));
      setDashboards(dash);
    } catch (e) {
      console.error("Failed to save dashboards", e);
    }
  }, []);

  const addDashboard = useCallback(
    async (name: string) => {
      const newDashboard: Dashboard = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
      };
      const updated = [...dashboards, newDashboard];
      await saveDashboards(updated);
      return newDashboard;
    },
    [dashboards, saveDashboards],
  );

  const deleteDashboard = useCallback(
    async (id: string) => {
      // Don't delete the last dashboard
      if (dashboards.length <= 1) return false;
      
      const updated = dashboards.filter((d) => d.id !== id);
      await saveDashboards(updated);
      return true;
    },
    [dashboards, saveDashboards],
  );

  const updateDashboard = useCallback(
    async (id: string, newName: string) => {
      const updated = dashboards.map((d) =>
        d.id === id ? { ...d, name: newName } : d,
      );
      await saveDashboards(updated);
      return true;
    },
    [dashboards, saveDashboards],
  );

  return {
    dashboards,
    loading,
    addDashboard,
    deleteDashboard,
    updateDashboard,
  };
};
