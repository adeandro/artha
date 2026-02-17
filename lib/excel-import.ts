/**
 * Excel Import Utility
 * Mengimport data transaksi dari file Excel (.xlsx) ke aplikasi
 */

// @ts-ignore - expo-document-picker will be installed via npm
import * as DocumentPicker from "expo-document-picker";
// @ts-ignore - Using legacy API to avoid deprecation warnings
import * as FileSystem from "expo-file-system/legacy";
// @ts-ignore - xlsx doesn't have full TypeScript support but works fine at runtime
import XLSX from "xlsx";
import { Transaction } from "./types";

/**
 * Struktur untuk validasi header Excel
 * Mapping dari header yang diterima ke key yang diharapkan
 */
interface ExcelHeaderMap {
  tanggal: string;
  kategori: string;
  keterangan: string;
  tipe: string;
  jumlah: string;
}

/**
 * Row data dari Excel sebelum transformasi
 */
interface ExcelTransactionRow {
  [key: string]: any;
}

/**
 * Result dari proses import
 */
interface ImportResult {
  success: boolean;
  data: Transaction[];
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Required headers untuk validasi file Excel
 * Case-insensitive matching
 */
const REQUIRED_HEADERS = {
  TANGGAL: ["tanggal", "date", "tgl"],
  KATEGORI: ["kategori", "category", "cat"],
  KETERANGAN: ["keterangan", "notes", "catatan", "description", "desc"],
  TIPE: ["tipe", "type", "jenis", "kind"],
  JUMLAH: ["jumlah", "amount", "nominal", "nilai"],
};

/**
 * Pick file Excel dari device storage
 * @returns Promise<string> - File URI atau throw error jika user cancel
 */
const pickExcelFile = async (): Promise<string> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      copyToCacheDirectory: true,
    });

    // Check if user cancel atau error
    if (result.canceled || !result.assets || result.assets.length === 0) {
      throw new Error("File selection cancelled by user");
    }

    const file = result.assets[0];

    // Validate file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      throw new Error("File harus berformat Excel (.xlsx atau .xls)");
    }

    // Validate file size (max 10MB)
    if (file.size && file.size > 10 * 1024 * 1024) {
      throw new Error("Ukuran file terlalu besar (max 10MB)");
    }

    return file.uri;
  } catch (error) {
    console.error("❌ Error picking file:", error);
    throw error;
  }
};

/**
 * Baca file Excel dari URI
 * @param fileUri - URI file dari DocumentPicker
 * @returns Promise<string> - Binary string data
 */
const readExcelFile = async (fileUri: string): Promise<string> => {
  try {
    // Baca file dengan encoding base64
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: "base64",
    });

    return fileContent;
  } catch (error) {
    console.error("❌ Error reading file:", error);
    throw new Error("Gagal membaca file Excel");
  }
};

/**
 * Validasi dan find header mapping
 * @param headers - Array header dari worksheet
 * @returns ExcelHeaderMap jika valid, throw error jika tidak
 */
const validateAndMapHeaders = (headers: string[]): ExcelHeaderMap => {
  const headerLower = headers.map((h) => (h || "").toLowerCase().trim());

  // Helper function untuk find matching header
  const findHeaderIndex = (acceptableValues: string[]): number => {
    return headerLower.findIndex((h) => acceptableValues.includes(h));
  };

  // Validate semua required columns
  const tanggalIdx = findHeaderIndex(REQUIRED_HEADERS.TANGGAL);
  const kategoriIdx = findHeaderIndex(REQUIRED_HEADERS.KATEGORI);
  const keteranganIdx = findHeaderIndex(REQUIRED_HEADERS.KETERANGAN);
  const tipeIdx = findHeaderIndex(REQUIRED_HEADERS.TIPE);
  const jumlahIdx = findHeaderIndex(REQUIRED_HEADERS.JUMLAH);

  // Jika ada yang tidak ditemukan, throw error
  if (tanggalIdx === -1)
    throw new Error("Kolom 'Tanggal' tidak ditemukan di file Excel");
  if (kategoriIdx === -1)
    throw new Error("Kolom 'Kategori' tidak ditemukan di file Excel");
  if (keteranganIdx === -1)
    throw new Error("Kolom 'Keterangan' tidak ditemukan di file Excel");
  if (tipeIdx === -1)
    throw new Error("Kolom 'Tipe' tidak ditemukan di file Excel");
  if (jumlahIdx === -1)
    throw new Error("Kolom 'Jumlah' tidak ditemukan di file Excel");

  // Return mapping indices
  return {
    tanggal: headers[tanggalIdx],
    kategori: headers[kategoriIdx],
    keterangan: headers[keteranganIdx],
    tipe: headers[tipeIdx],
    jumlah: headers[jumlahIdx],
  };
};

/**
 * Parse Excel workbook ke array of objects
 * @param workbook - XLSX workbook
 * @param headerMap - Header mapping
 * @returns Array<ExcelTransactionRow>
 */
const parseExcelData = (
  workbook: any,
  headerMap: ExcelHeaderMap,
): ExcelTransactionRow[] => {
  try {
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("File Excel tidak memiliki sheet apapun");
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to array of objects
    // Gunakan header=1 untuk raw data, kemudian custom processing
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Array format
    });

    if (data.length === 0) {
      throw new Error("File Excel kosong atau tidak ada data");
    }

    // First row is header, rest is data
    if (data.length < 2) {
      throw new Error(
        "File Excel tidak memiliki data transaksi (harus lebih dari header)",
      );
    }

    // Data rows (skip header)
    const dataRows: ExcelTransactionRow[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];

      // Skip empty rows
      if (row.every((cell) => !cell || cell.toString().trim() === "")) {
        continue;
      }

      // Construct object dengan header map
      const rowObj: ExcelTransactionRow = {};
      const headers = data[0] as string[];

      headers.forEach((header, idx) => {
        rowObj[header] = row[idx];
      });

      dataRows.push(rowObj);
    }

    return dataRows;
  } catch (error) {
    console.error("❌ Error parsing Excel data:", error);
    throw error;
  }
};

/**
 * Transformasi raw Excel data ke Transaction objects
 * @param excelRows - Raw data dari Excel
 * @param headerMap - Header mapping
 * @returns { data: Transaction[], errors: string[] }
 */
const transformTransactionData = (
  excelRows: ExcelTransactionRow[],
  headerMap: ExcelHeaderMap,
): { data: Transaction[]; errors: string[] } => {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  excelRows.forEach((row, index) => {
    try {
      // Extract values dari row berdasarkan header map
      const tanggal = row[headerMap.tanggal];
      const kategori = row[headerMap.kategori];
      const keterangan = row[headerMap.keterangan];
      const tipe = row[headerMap.tipe];
      const jumlah = row[headerMap.jumlah];

      // Validasi fields tidak kosong
      if (!tanggal || !kategori || !tipe || !jumlah) {
        throw new Error(`Row ${index + 2}: Field wajib ada yang kosong`);
      }

      // Parse date
      let parsedDate: string;
      if (typeof tanggal === "number") {
        // Excel numeric date (serial number)
        const excelDate = new Date((tanggal - 25569) * 86400 * 1000);
        parsedDate = excelDate.toISOString().split("T")[0]; // YYYY-MM-DD
      } else {
        // String date - attempt to parse
        const dateObj = new Date(tanggal.toString());
        if (isNaN(dateObj.getTime())) {
          throw new Error(`Row ${index + 2}: Format tanggal tidak valid`);
        }
        parsedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      // Normalize tipe (case-insensitive)
      const tipeLower = tipe.toString().toLowerCase();
      const normalizedType =
        tipeLower.includes("masuk") ||
        tipeLower.includes("income") ||
        tipeLower.includes("pemasukan")
          ? "income"
          : tipeLower.includes("keluar") ||
              tipeLower.includes("expense") ||
              tipeLower.includes("pengeluaran")
            ? "expense"
            : null;

      if (!normalizedType) {
        throw new Error(
          `Row ${index + 2}: Tipe harus 'Pemasukan/Income' atau 'Pengeluaran/Expense'`,
        );
      }

      // Parse jumlah (string to number)
      let parsedAmount: number;
      if (typeof jumlah === "number") {
        parsedAmount = jumlah;
      } else {
        // Remove currency symbols and parse
        const cleaned = jumlah
          .toString()
          .replace(/[Rp\s.,]/g, "")
          .trim();
        parsedAmount = parseInt(cleaned, 10);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error(
            `Row ${index + 2}: Jumlah harus berupa angka positif`,
          );
        }
      }

      // Create transaction object
      const transaction: Transaction = {
        id: `import_${Date.now()}_${index}`,
        date: parsedDate,
        type: normalizedType as "income" | "expense",
        category: kategori.toString().toLowerCase().replace(/\s+/g, "_"),
        amount: parsedAmount,
        notes: keterangan ? keterangan.toString().trim() : undefined,
      };

      transactions.push(transaction);
    } catch (error) {
      errors.push((error as Error).message);
      console.error(`❌ Transform error row ${index + 2}:`, error);
    }
  });

  return { data: transactions, errors };
};

/**
 * Main function: Import Excel file dan return Transaction data
 * Workflow:
 * 1. Pick file dari device
 * 2. Read file dengan base64 encoding
 * 3. Parse Excel ke data
 * 4. Validate headers
 * 5. Transform data ke Transaction objects
 * 6. Return success dengan data dan error count
 *
 * @returns Promise<ImportResult>
 *
 * @example
 * const result = await importTransactionsFromExcel();
 * if (result.success) {
 *   console.log(`Imported ${result.successCount} transactions`);
 *   await saveToDatabase(result.data);
 * } else {
 *   Alert.alert('Error', `Failed: ${result.errors.join(', ')}`);
 * }
 */
export const importTransactionsFromExcel = async (): Promise<ImportResult> => {
  const errors: string[] = [];

  try {
    // Step 1: Pick file
    console.log("📂 Memilih file Excel...");
    const fileUri = await pickExcelFile();

    // Step 2: Read file dengan base64 encoding
    console.log("📖 Membaca file Excel...");
    const fileContent = await readExcelFile(fileUri);

    // Step 3: Decode base64 dan parse dengan XLSX
    console.log("🔍 Parsing file Excel...");
    const workbook = XLSX.read(fileContent, { type: "base64" });

    // Step 4: Validate headers pada sheet pertama
    console.log("✅ Memvalidasi header...");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get headers dari row pertama
    const headers = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    })[0] as string[];

    const headerMap = validateAndMapHeaders(headers);

    // Step 5: Parse data rows
    console.log("📊 Mengkoversi data...");
    const excelRows = parseExcelData(workbook, headerMap);

    // Step 6: Transform ke Transaction objects
    console.log("🔄 Transformasi data...");
    const { data: transactions, errors: transformErrors } =
      transformTransactionData(excelRows, headerMap);

    // Collect all errors
    if (transformErrors.length > 0) {
      errors.push(...transformErrors);
    }

    // Determine success
    const totalRows = excelRows.length;
    const successCount = transactions.length;
    const failedCount = totalRows - successCount;
    const isSuccess = successCount > 0; // Consider success jika minimal ada 1 row yang berhasil

    console.log(
      `✅ Import selesai: ${successCount}/${totalRows} transaksi berhasil`,
    );

    return {
      success: isSuccess,
      data: transactions,
      totalRows,
      successCount,
      failedCount,
      errors,
    };
  } catch (error) {
    const errorMsg = (error as Error).message || "Unknown error";
    console.error("❌ Import failed:", errorMsg);

    return {
      success: false,
      data: [],
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      errors: [errorMsg],
    };
  }
};

/**
 * Placeholder function untuk save imported data ke database/AsyncStorage
 * Implementasi actual ada di component yang call function ini
 *
 * @param transactions - Array transaksi yang berhasil di-import
 * @returns Promise<boolean>
 *
 * @example
 * // Di component:
 * const result = await importTransactionsFromExcel();
 * if (result.success) {
 *   await saveImportedTransactions(result.data);
 * }
 */
export const saveImportedTransactions = async (
  transactions: Transaction[],
): Promise<boolean> => {
  try {
    // TODO: Implement actual save logic
    // Bisa integrate dengan useTransactions hook
    // Example:
    // for (const tx of transactions) {
    //   await addTransaction(tx);
    // }

    console.log(
      `💾 Placeholder: Save ${transactions.length} transactions ke database`,
    );
    return true;
  } catch (error) {
    console.error("❌ Error saving transactions:", error);
    return false;
  }
};

/**
 * Helper: Validate imported data sebelum save
 * @param transactions - Array to validate
 * @returns { valid: boolean, errors: string[] }
 */
export const validateImportedData = (
  transactions: Transaction[],
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!transactions || transactions.length === 0) {
    errors.push("Tidak ada transaksi untuk disimpan");
    return { valid: false, errors };
  }

  transactions.forEach((tx, idx) => {
    // Validate transaction structure
    if (!tx.date || !tx.type || !tx.category || !tx.amount) {
      errors.push(`Transaksi ${idx + 1}: Field wajib ada yang kosong`);
    }

    // Validate type
    if (tx.type !== "income" && tx.type !== "expense") {
      errors.push(`Transaksi ${idx + 1}: Tipe tidak valid`);
    }

    // Validate amount
    if (tx.amount <= 0) {
      errors.push(`Transaksi ${idx + 1}: Jumlah harus positif`);
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
      errors.push(
        `Transaksi ${idx + 1}: Format tanggal tidak valid (YYYY-MM-DD)`,
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
