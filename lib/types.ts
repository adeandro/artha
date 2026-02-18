/**
 * Type definitions for Artha
 */

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string; // ISO date format (YYYY-MM-DD)
  type: TransactionType;
  category: string; // category id
  amount: number; // in IDR
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface MonthlyStats {
  year: number;
  month: number; // 1-12
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    total: number;
    type: TransactionType;
  }[];
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number; // Budget limit in IDR
  year: number;
  month: number; // 1-12
  createdAt: string;
  // Custom period support
  isCustomPeriod?: boolean; // If true, use startDate and endDate instead of year/month
  startDate?: string; // ISO date format (YYYY-MM-DD)
  endDate?: string; // ISO date format (YYYY-MM-DD)
}
