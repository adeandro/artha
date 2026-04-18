/**
 * Excel Export Utility
 * Mengkonversi data transaksi ke format Excel (.xlsx) dan share ke user
 * Support multiple financial books (dashboards)
 */

// @ts-ignore - Using legacy API to avoid deprecation warnings
import * as FileSystem from "expo-file-system/legacy";
// @ts-ignore - expo-sharing will be installed via npm
import * as Sharing from "expo-sharing";
// @ts-ignore - xlsx doesn't have full TypeScript support but works fine at runtime
import XLSX, { WorkBook, WorkSheet } from "xlsx";
import { formatCurrency } from "./currency";
import { Dashboard, Transaction } from "./types";

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
 * Export transaksi dari satu dashboard ke file Excel (.xlsx)
 * @param transactions - Array data transaksi dari AsyncStorage
 * @param categoryMap - Object mapping category ID ke nama
 * @param dashboardName - Nama buku keuangan (untuk filename)
 * @returns Promise<string> - Path file yang berhasil dibuat
 */
const exportSingleDashboard = async (
  transactions: Transaction[],
  categoryMap: Record<string, string> = {},
  dashboardName: string = "Laporan",
): Promise<string> => {
  if (!transactions || transactions.length === 0) {
    throw new Error(`Tidak ada data transaksi untuk ${dashboardName}`);
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
    { wch: 12 }, // Tanggal
    { wch: 18 }, // Kategori
    { wch: 25 }, // Keterangan
    { wch: 12 }, // Tipe
    { wch: 15 }, // Jumlah
  ];

  // Add header row dengan info dashboard
  // Gunakan XLSX.utils.sheet_add_aoa untuk menambah rows custom di atas
  const now = new Date();
  const timestamp = `${now.toLocaleString("id-ID")}`;

  // Tambah info header di atas data
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      [`LAPORAN KEUANGAN: ${dashboardName}`],
      [`Tanggal Cetak: ${timestamp}`],
      [`Total Transaksi: ${transactions.length}`],
      [],
    ],
    { origin: 0 },
  );

  // Shift data rows ke bawah header (5 baris: 3 info + 2 blank)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:E1");
  range.s.r += 5;
  range.e.r += 5;
  worksheet["!ref"] = XLSX.utils.encode_range(range);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

  // Generate filename dengan nama buku
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  // Replace special characters di nama dashboard untuk filename
  const safeBookName = dashboardName
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .substring(0, 20); // Limit to 20 chars

  const fileName = `Laporan_${safeBookName}_${dateString}.xlsx`;

  // Simpan file
  const docsDir =
    (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory;
  const filePath = `${docsDir}${fileName}`;

  const wbout = XLSX.write(workbook, {
    type: "base64",
    bookType: "xlsx",
  });

  await FileSystem.writeAsStringAsync(filePath, wbout, {
    encoding: (FileSystem as any).EncodingType.Base64,
  });

  return filePath;
};

/**
 * Export transaksi ke file Excel - support multiple dashboards
 * Jika hanya ada 1 dashboard, export langsung
 * Jika ada multiple dashboards, export terpisah untuk setiap buku
 *
 * @param transactions - Array data transaksi dari AsyncStorage
 * @param categoryMap - Object mapping category ID ke nama
 * @param dashboards - Array of Dashboard objects (untuk nama dan ID)
 * @returns Promise<boolean> - True jika berhasil
 *
 * @example
 * const categoryMap = {};
 * categories.forEach(cat => categoryMap[cat.id] = cat.name);
 * await exportTransactionsToExcelMultiDashboard(transactions, categoryMap, dashboards);
 */
export const exportTransactionsToExcel = async (
  transactions: Transaction[],
  categoryMap: Record<string, string> = {},
  dashboards?: Dashboard[],
): Promise<boolean> => {
  try {
    // Jika ada dashboards, gunakan multi-dashboard export
    if (dashboards && dashboards.length > 0) {
      return await exportTransactionsToExcelMultiDashboard(
        transactions,
        categoryMap,
        dashboards,
      );
    }

    // Fallback ke single export (backward compatibility)
    if (!transactions || transactions.length === 0) {
      throw new Error("Tidak ada data transaksi untuk dieksport");
    }

    const filePath = await exportSingleDashboard(
      transactions,
      categoryMap,
      "Laporan Keuangan",
    );

    // Trigger sharing dialog
    await Sharing.shareAsync(filePath, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Bagikan Laporan Keuangan",
      UTI: "com.microsoft.excel.xlsx",
    });

    console.log("✅ Export Excel berhasil");
    console.log("📁 File path:", filePath);
    console.log("📊 Total transaksi:", transactions.length);

    return true;
  } catch (error) {
    console.error("❌ Export Excel gagal:", error);
    throw error;
  }
};

/**
 * Export multiple financial books ke separate Excel files
 * @param transactions - Semua transactions
 * @param categoryMap - Category ID to name mapping
 * @param dashboards - Array of dashboards
 */
export const exportTransactionsToExcelMultiDashboard = async (
  transactions: Transaction[],
  categoryMap: Record<string, string> = {},
  dashboards: Dashboard[] = [],
): Promise<boolean> => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error("Tidak ada data transaksi untuk dieksport");
    }

    if (dashboards.length === 0) {
      throw new Error("Tidak ada buku keuangan");
    }

    const exportedFiles: string[] = [];
    let totalProcessed = 0;

    // Export untuk setiap dashboard yang ada transaksi
    for (const dashboard of dashboards) {
      // Filter transactions untuk dashboard ini
      const dashboardTransactions = transactions.filter(
        (t) => t.dashboardId === dashboard.id || t.dashboardId === undefined,
      );

      if (dashboardTransactions.length === 0) {
        console.log(`⚠️  Tidak ada transaksi untuk "${dashboard.name}"`);
        continue;
      }

      try {
        const filePath = await exportSingleDashboard(
          dashboardTransactions,
          categoryMap,
          dashboard.name,
        );
        exportedFiles.push(filePath);
        totalProcessed += dashboardTransactions.length;
        console.log(
          `✅ Export "${dashboard.name}" berhasil (${dashboardTransactions.length} transaksi)`,
        );
      } catch (error) {
        console.error(`❌ Export "${dashboard.name}" gagal:`, error);
        // Continue to next dashboard instead of throwing
      }
    }

    if (exportedFiles.length === 0) {
      throw new Error("Tidak ada file yang berhasil dibuat");
    }

    // Share all files
    // Untuk single file, langsung share
    if (exportedFiles.length === 1) {
      await Sharing.shareAsync(exportedFiles[0], {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Bagikan Laporan Keuangan",
        UTI: "com.microsoft.excel.xlsx",
      });
    } else {
      // Untuk multiple files, share semuanya
      await Sharing.shareAsync(exportedFiles, {
        mimeType: "application/zip",
        dialogTitle: `Bagikan ${exportedFiles.length} Laporan Keuangan`,
      });
    }

    console.log(`✅ Export ${exportedFiles.length} file berhasil`);
    console.log(`📊 Total transaksi: ${totalProcessed}`);

    return true;
  } catch (error) {
    console.error("❌ Multi-dashboard export gagal:", error);
    throw error;
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
