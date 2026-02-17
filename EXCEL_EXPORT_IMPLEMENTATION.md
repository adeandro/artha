# 📊 Fitur Export Data Transaksi ke Excel

## 1. Instalasi Dependencies

Jalankan perintah berikut di terminal:

```bash
cd c:\development\Artha

# Install xlsx (SheetJS)
npm install xlsx

# Install Expo file system dan sharing
npx expo install expo-file-system expo-sharing
```

### Dependencies yang ditambahkan:

- **xlsx** v0.18.5+ - Library untuk membuat dan memanipulasi file Excel
- **expo-file-system** - Interface untuk akses file system lokal
- **expo-sharing** - API untuk share/save file ke storage device

---

## 2. Buat Utility File untuk Export

Buat file baru: `lib/excel-export.ts`

```typescript
/**
 * Excel Export Utility
 * Mengkonversi data transaksi ke format Excel (.xlsx)
 */

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import XLSX, { WorkBook, WorkSheet } from "xlsx";
import { Transaction } from "./types";
import { formatCurrency } from "./currency";

// Format data untuk spreadsheet
interface ExcelTransactionRow {
  Tanggal: string;
  Kategori: string;
  Keterangan: string;
  Tipe: string;
  Jumlah: string;
}

/**
 * Export transaksi ke file Excel (.xlsx)
 * @param transactions - Array data transaksi
 * @param categories - Array kategori (untuk mapping category ID)
 * @returns boolean - True jika berhasil, False jika gagal
 */
export const exportTransactionsToExcel = async (
  transactions: Transaction[],
  categoryMap: Record<string, string> = {},
): Promise<boolean> => {
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

    // Set column widths untuk readability
    const columnWidths = [
      { wch: 12 }, // Tanggal
      { wch: 18 }, // Kategori
      { wch: 25 }, // Keterangan
      { wch: 12 }, // Tipe
      { wch: 15 }, // Jumlah
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

    // Generate nama file dengan timestamp
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const fileName = `Laporan_Keuangan_${dateString}.xlsx`;

    // Buat path untuk simpan file
    // Gunakan DocumentDirectory untuk better compatibility
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Konversi workbook ke binary string
    const wbout = XLSX.write(workbook, { type: "binary", bookType: "xlsx" });

    // Simpan file ke device storage
    await FileSystem.writeAsStringAsync(filePath, wbout, {
      encoding: FileSystem.EncodingType.Binary,
    });

    // Share file ke user (save/share options)
    const shareResult = await Sharing.shareAsync(filePath, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Bagikan Laporan Keuangan",
      UTI: "com.microsoft.excel.xlsx", // iOS UTI
    });

    // Log success
    console.log("✅ Export Excel berhasil:", filePath);

    return true;
  } catch (error) {
    console.error("❌ Export Excel gagal:", error);
    throw error;
  }
};

/**
 * Alternative: Export tanpa langsung share (hanya simpan ke device)
 * Berguna untuk pre-processing atau batch export
 */
export const exportTransactionsToExcelLocal = async (
  transactions: Transaction[],
  categoryMap: Record<string, string> = {},
): Promise<string> => {
  if (!transactions || transactions.length === 0) {
    throw new Error("Tidak ada data transaksi untuk dieksport");
  }

  const excelData: ExcelTransactionRow[] = transactions.map((tx) => ({
    Tanggal: tx.date,
    Kategori: categoryMap[tx.category] || tx.category,
    Keterangan: tx.notes || "-",
    Tipe: tx.type === "income" ? "Pemasukan" : "Pengeluaran",
    Jumlah: formatCurrency(tx.amount),
  }));

  const workbook: WorkBook = XLSX.utils.book_new();
  const worksheet: WorkSheet = XLSX.utils.json_to_sheet(excelData);
  worksheet["!cols"] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const fileName = `Laporan_Keuangan_${dateString}.xlsx`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  const wbout = XLSX.write(workbook, { type: "binary", bookType: "xlsx" });
  await FileSystem.writeAsStringAsync(filePath, wbout, {
    encoding: FileSystem.EncodingType.Binary,
  });

  return filePath;
};
```

---

## 3. Update Strings untuk UI

Tambahkan ke `constants/strings.ts`:

```typescript
// Dalam Strings object, tambahkan:
export const Strings = {
  // ... existing strings ...

  // Export Excel Feature
  exportExcel: "Ekspor Excel",
  exportingData: "Sedang mengekspor data...",
  exportSuccess: "Data berhasil dieksport ke Excel",
  exportFailed: "Gagal mengeksport data",
  noDataToExport: "Tidak ada data transaksi untuk dieksport",
  exportFileName: "Laporan_Keuangan",

  // ... rest of strings ...
};
```

---

## 4. Implementasi di Dashboard

Tambahkan button export ke [app/(tabs)/dashboard.tsx](<app/(tabs)/dashboard.tsx>):

```typescript
// Import yang ditambahkan di bagian atas file
import { exportTransactionsToExcel } from "@/lib/excel-export";

// Dalam component SettingsScreen:
const Dashboard = () => {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [isExporting, setIsExporting] = useState(false);

  // Create category map untuk mapping ID ke name
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // Handler untuk export Excel
  const handleExportExcel = async () => {
    if (transactions.length === 0) {
      Alert.alert("Info", Strings.noDataToExport);
      return;
    }

    setIsExporting(true);
    try {
      await exportTransactionsToExcel(transactions, categoryMap);
      Alert.alert("Sukses", Strings.exportSuccess);
    } catch (error) {
      Alert.alert("Error", Strings.exportFailed);
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ... existing content ... */}

      {/* Export Button - Tambahkan di section terakhir */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, isExporting && styles.buttonDisabled]}
          onPress={handleExportExcel}
          disabled={isExporting}
        >
          <ThemedText style={styles.buttonText}>
            {isExporting ? Strings.exportingData : Strings.exportExcel}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
```

---

## 5. Implementasi di Settings

Atau tambahkan ke [app/(tabs)/settings.tsx](<app/(tabs)/settings.tsx>) untuk dedicated export section:

```typescript
// Import di bagian atas
import { exportTransactionsToExcel } from "@/lib/excel-export";

// Dalam SettingsScreen component, tambahkan:
const [isExporting, setIsExporting] = useState(false);

const handleExportData = async () => {
  const allTransactions = transactions; // Assuming sudah ada useTransactions hook

  if (!allTransactions || allTransactions.length === 0) {
    Alert.alert("Info", Strings.noDataToExport);
    return;
  }

  setIsExporting(true);
  try {
    const categoryMap: Record<string, string> = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.name;
    });

    await exportTransactionsToExcel(allTransactions, categoryMap);
    Alert.alert("Sukses", Strings.exportSuccess);
  } catch (error) {
    Alert.alert("Error", Strings.exportFailed);
  } finally {
    setIsExporting(false);
  }
};

// Dalam JSX, tambahkan section baru:
<View style={styles.section}>
  <ThemedText type="subtitle" style={styles.sectionTitle}>
    Data & Backup
  </ThemedText>
  <TouchableOpacity
    style={[styles.button, isExporting && styles.buttonDisabled]}
    onPress={handleExportData}
    disabled={isExporting}
  >
    <ThemedText style={styles.buttonText}>
      {isExporting ? Strings.exportingData : Strings.exportExcel}
    </ThemedText>
  </TouchableOpacity>
</View>
```

---

## 6. Testing

### Test Case 1: Export tanpa data

- Jalankan app
- Jangan tambah transaksi
- Klik Export Excel
- ✅ Harusnya muncul alert: "Tidak ada data transaksi untuk dieksport"

### Test Case 2: Export dengan data

- Tambah beberapa transaksi (income dan expense)
- Klik Export Excel
- ✅ Harusnya muncul sharing dialog
- ✅ File bisa disimpan atau dibagikan

### Test Case 3: Verifikasi format Excel

- Buka file hasil export
- ✅ Harus ada 5 kolom: Tanggal, Kategori, Keterangan, Tipe, Jumlah
- ✅ Data harus terformat rapi dengan width column yang sesuai
- ✅ Kategori ID sudah di-map menjadi nama kategori
- ✅ Currency sudah diformat dengan IDR

---

## 7. Features & Keamanan

✅ **Features Implemented:**

- Dynamic filename dengan timestamp
- Proper category mapping (ID → Name)
- Currency formatting
- Column width optimization
- Error handling

✅ **Security Considerations:**

- File hanya disimpan di DocumentDirectory (private)
- User harus explicitly share/accept save
- No data uploaded to cloud
- Proper error logging

✅ **Performance:**

- Async operation (tidak block UI)
- Loading state dengan disabled button
- Efficient data mapping

---

## 8. Troubleshooting

### Error: "Cannot find module 'xlsx'"

```bash
npm install xlsx
```

### Error: "Sharing is not available on this platform"

- Pastikan device support sharing (hampir semua device modern support)
- Cek Expo version terbaru

### File tidak muncul di share dialog

- Pastikan path menggunakan `FileSystem.documentDirectory`
- Check error logs di console

### Column width tidak proper

- Adjust `columnWidths` array di `lib/excel-export.ts`
- Contoh: `{ wch: 20 }` untuk lebih lebar

---

## Next Steps

📌 Setelah implementasi:

1. Run build: `eas build -p android --profile preview`
2. Test export functionality
3. Verify file format di Excel
4. Share feedback untuk improvement
