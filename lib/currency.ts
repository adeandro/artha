/**
 * Currency formatting utilities for IDR
 */

export const formatCurrency = (amount: number): string => {
  // Format: Rp 1.250.000
  const formatted = Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
};

export const parseCurrency = (text: string): number => {
  // Remove 'Rp ' prefix and all dots
  const cleaned = text.replace(/Rp\s?/g, "").replace(/\./g, "");
  return parseInt(cleaned, 10) || 0;
};
