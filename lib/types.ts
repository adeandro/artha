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
