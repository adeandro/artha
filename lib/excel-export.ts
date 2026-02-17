/**
 * Excel Export Utility
 * Mengkonversi data transaksi ke format Excel (.xlsx) dan share ke user
 */

// @ts-ignore - Using legacy API to avoid deprecation warnings
import * as FileSystem from "expo-file-system/legacy";
// @ts-ignore - expo-sharing will be installed via npm
import * as Sharing from "expo-sharing";
// @ts-ignore - xlsx doesn't have full TypeScript support but works fine at runtime
import XLSX, { WorkBook, WorkSheet } from "xlsx";
import { formatCurrency } from "./currency";
import { Transaction } from "./types";

/**
 * Format data untuk spreadsheet
 */
interface ExcelTransactionRow {
  Tanggal: string;
  Kategori: string;
  Keterangan: string;
  Tipe: string;
  Jumlah: string;
}

/**
 * Export transaksi ke file Excel (.xlsx) dan trigger sharing
 * @param transactions - Array data transaksi dari AsyncStorage
 * @param categoryMap - Object mapping category ID ke nama (opsional, fallback ke ID jika tidak ada)
 * @returns Promise<boolean> - True jika berhasil, throw error jika gagal
 *
 * @example
 * const categoryMap = {};
 * categories.forEach(cat => categoryMap[cat.id] = cat.name);
 * await exportTransactionsToExcel(transactions, categoryMap);
 */
export const exportTransactionsToExcel = async (
  transactions: Transaction[],
  categoryMap: Record<string, string> = {},
): Promise<boolean> => {
  try {
    // Validasi: pastikan ada data untuk dieksport
    if (!transactions || transactions.length === 0) {
      throw new Error("Tidak ada data transaksi untuk dieksport");
    }

    // Step 1: Format data untuk Excel dengan column yang readable
    const excelData: ExcelTransactionRow[] = transactions.map((tx) => ({
      Tanggal: tx.date, // Format: YYYY-MM-DD
      Kategori: categoryMap[tx.category] || tx.category, // Map ID ke nama kategori
      Keterangan: tx.notes || "-", // Gunakan "-" jika tidak ada notes
      Tipe: tx.type === "income" ? "Pemasukan" : "Pengeluaran", // Translate ke Bahasa Indonesia
      Jumlah: formatCurrency(tx.amount), // Format currency dengan IDR
    }));

    // Step 2: Buat workbook dan worksheet baru
    const workbook: WorkBook = XLSX.utils.book_new();
    const worksheet: WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // Step 3: Set column widths untuk readability
    // Width dalam character units (approximate pixel = character * 7)
    const columnWidths = [
      { wch: 12 }, // Tanggal (YYYY-MM-DD)
      { wch: 18 }, // Kategori
      { wch: 25 }, // Keterangan (notes bisa panjang)
      { wch: 12 }, // Tipe (Pemasukan/Pengeluaran)
      { wch: 15 }, // Jumlah (currency format)
    ];
    worksheet["!cols"] = columnWidths;

    // Step 4: Add worksheet ke workbook dengan nama sheet "Transaksi"
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    // Step 5: Generate nama file dinamis dengan timestamp
    // Format: Laporan_Keuangan_YYYY-MM-DD.xlsx
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // 01-12
    const day = String(today.getDate()).padStart(2, "0"); // 01-31
    const dateString = `${year}-${month}-${day}`;
    const fileName = `Laporan_Keuangan_${dateString}.xlsx`;

    // Step 6: Buat path untuk simpan file di device storage
    // Gunakan documentDirectory untuk better compatibility di iOS dan Android
    // File akan disimpan di: /data/data/com.adeandro.Artha/files/documents/ (Android)
    //                   atau: /var/mobile/Containers/Data/Documents/ (iOS)
    const docsDir =
      (FileSystem as any).documentDirectory ||
      (FileSystem as any).cacheDirectory;
    const filePath = `${docsDir}${fileName}`;

    // Step 7: Konversi workbook ke base64 string
    // XLSX.write dengan type 'base64' menghasilkan base64-encoded string
    // Base64 adalah format standar untuk binary data di React Native
    const wbout = XLSX.write(workbook, {
      type: "base64",
      bookType: "xlsx", // Format Excel modern (.xlsx)
    });

    // Step 8: Simpan file ke device storage secara asynchronous
    // Menggunakan base64 encoding untuk binary Excel data
    await FileSystem.writeAsStringAsync(filePath, wbout, {
      encoding: "base64",
    });

    // Step 9: Trigger sharing dialog ke user
    // User bisa pilih untuk save ke storage, email, messaging apps, dll
    await Sharing.shareAsync(filePath, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // MIME type untuk .xlsx
      dialogTitle: "Bagikan Laporan Keuangan",
      UTI: "com.microsoft.excel.xlsx", // iOS UTI (Uniform Type Identifier)
    });

    // Log success untuk debugging
    console.log("✅ Export Excel berhasil");
    console.log("📁 File path:", filePath);
    console.log("📊 Total transaksi:", transactions.length);

    return true;
  } catch (error) {
    // Log error details untuk debugging
    console.error("❌ Export Excel gagal:", error);
    throw error; // Re-throw agar bisa di-handle di component yang call function ini
  }
};

/**
 * Alternative: Export ke file Excel tanpa langsung share
 * Berguna untuk pre-processing, batch export, atau backup
 *
 * @param transactions - Array data transaksi
 * @param categoryMap - Object mapping category ID ke nama
 * @returns Promise<string> - Path file yang sudah dibuat
 *
 * @example
 * const filePath = await exportTransactionsToExcelLocal(transactions, categoryMap);
 * // Bisa di-process lebih lanjut atau di-share manual
 */
export const exportTransactionsToExcelLocal = async (
  transactions: Transaction[],
  categoryMap: Record<string, string> = {},
): Promise<string> => {
  try {
    // Validasi data
    if (!transactions || transactions.length === 0) {
      throw new Error("Tidak ada data transaksi untuk dieksport");
    }

    // Format data untuk Excel
    const excelData: ExcelTransactionRow[] = transactions.map((tx) => ({
      Tanggal: tx.date,
      Kategori: categoryMap[tx.category] || tx.category,
      Keterangan: tx.notes || "-",
      Tipe: tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      Jumlah: formatCurrency(tx.amount),
    }));

    // Buat workbook dan worksheet
    const workbook: WorkBook = XLSX.utils.book_new();
    const worksheet: WorkSheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 18 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    // Generate filename dengan timestamp
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
    const fileName = `Laporan_Keuangan_${dateString}.xlsx`;

    const docsDir =
      (FileSystem as any).documentDirectory ||
      (FileSystem as any).cacheDirectory;
    const filePath = `${docsDir}${fileName}`;

    // Konversi dan simpan file
    const wbout = XLSX.write(workbook, {
      type: "binary",
      bookType: "xlsx",
    });

    await FileSystem.writeAsStringAsync(filePath, wbout, {
      encoding: "binary" as any,
    });

    console.log("✅ File Excel berhasil dibuat:", filePath);
    return filePath;
  } catch (error) {
    console.error("❌ Gagal membuat file Excel:", error);
    throw error;
  }
};

/**
 * Helper: Delete file Excel yang sudah di-export
 * Berguna untuk cleanup storage
 *
 * @param filePath - Path file yang ingin dihapus
 * @returns Promise<boolean> - True jika sukses
 */
export const deleteExcelFile = async (filePath: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(filePath);
    console.log("✅ File Excel berhasil dihapus:", filePath);
    return true;
  } catch (error) {
    console.error("❌ Gagal menghapus file Excel:", error);
    throw error;
  }
};
