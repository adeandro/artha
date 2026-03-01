# 📥 Panduan Implementasi Lengkap: Import Excel

## 1. Instalasi Dependencies

```bash
cd c:\development\Artha

# Install expo-document-picker untuk file selection
npx expo install expo-document-picker

# Note: xlsx dan expo-file-system sudah terinstall dari Export feature
```

Verify:

```bash
npm list expo-document-picker xlsx expo-file-system

# Expected output:
# expo-document-picker@14.x.x
# xlsx@0.18.x
# expo-file-system@15.x.x
```

---

## 2. Struktur File

### Files Created:

- `lib/excel-import.ts` - Main import utility (670 lines)

### Files Modified:

- `app/(tabs)/settings.tsx` - Add import button dengan handler
- `constants/strings.ts` - Add 9 localization strings

---

## 3. Dependencies Breakdown

### `expo-document-picker`

- **Purpose**: Allow user memilih file dari device storage
- **Method**: `getDocumentAsync({ type: ["application/vnd.ms-excel", "..."] })`
- **Returns**: File URI dengan metadata (name, size, uri)
- **Why**: Cross-platform compatible, native feel, user-familiar

### `xlsx` (SheetJS)

- **Purpose**: Parse Excel file ke data
- **Methods**:
  - `XLSX.read(fileContent, { type: "base64" })` - Parse file
  - `sheet_to_json()` - Convert sheet ke objects
- **Why**: Already using untuk Export, consistent library

### `expo-file-system`

- **Purpose**: Read file dari device (sudah used)
- **Method**: `readAsStringAsync(uri, { encoding: "base64" })`
- **Returns**: Base64 string
- **Why**: Required untuk read file content

---

## 4. Core Functions

### `importTransactionsFromExcel()`

**Main orchestrator function**

```typescript
const result = await importTransactionsFromExcel();

// result: ImportResult
// {
//   success: boolean,           // Overall success
//   data: Transaction[],        // Valid transactions
//   totalRows: number,          // Total rows in file
//   successCount: number,       // Successfully parsed
//   failedCount: number,        // Failed rows
//   errors: string[],           // Error details per row
// }
```

**Workflow:**

1. `pickExcelFile()` - Open file picker, validate file type & size
2. `readExcelFile()` - Read file with base64 encoding
3. `XLSX.read()` - Parse workbook
4. `validateAndMapHeaders()` - Find column indices
5. `parseExcelData()` - Extract data rows from sheet
6. `transformTransactionData()` - Convert to Transaction objects
7. Return result dengan detail success/failure

### `validateAndMapHeaders()`

**Validates required columns exist**

```typescript
const headerMap = validateAndMapHeaders(["Tanggal", "Kategori", ...]);

// Maps header names to column indices
// Throws if any required column missing
```

**Required Headers (case-insensitive):**

- Tanggal, Kategori, Keterangan, Tipe, Jumlah

### `transformTransactionData()`

**Converts raw Excel rows to Transaction objects**

```typescript
const { data, errors } = transformTransactionData(excelRows, headerMap);

// Handles:
// - Excel date serial → YYYY-MM-DD
// - "Pemasukan" → "income" type-safe conversion
// - "Rp 25.000" → 25000 (number)
// - Empty notes → undefined
// - Row-by-row error tracking
```

### `validateImportedData()`

**Final validation before save**

```typescript
const validation = validateImportedData(transactions);

// Checks:
// - Not empty
// - All required fields present
// - Valid transaction structure
// - Returns { valid: boolean, errors: string[] }
```

---

## 5. Integration in Settings Component

### State Management

```typescript
const [isImporting, setIsImporting] = useState(false);

// Loading state while processing file
```

### Handler Function

```typescript
const handleImportTransactions = async () => {
  setIsImporting(true);
  try {
    // 1. Call import function (triggers file picker)
    const result = await importTransactionsFromExcel();

    // 2. Check success and data count
    if (!result.success || result.successCount === 0) {
      Alert.alert("Error", result.errors[0] || "Failed");
      return;
    }

    // 3. Validate imported data
    const validation = validateImportedData(result.data);
    if (!validation.valid) {
      Alert.alert("Validation Error", validation.errors.join("\n"));
      return;
    }

    // 4. Confirmation dialog
    Alert.alert(
      "Konfirmasi Import",
      `Import ${result.successCount} transaksi? ${result.failedCount} gagal.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: async () => {
            // Save each transaction
            for (const tx of result.data) {
              await addTransaction(tx);
            }
            Alert.alert("Sukses", `Imported ${result.successCount}`);
          },
        },
      ],
    );
  } catch (error) {
    Alert.alert("Error", Strings.importFailed);
    console.error("Import failed:", error);
  } finally {
    setIsImporting(false);
  }
};
```

### UI Button

```typescript
<TouchableOpacity
  style={[styles.importButton, isImporting && styles.buttonDisabled]}
  onPress={handleImportTransactions}
  disabled={isImporting}
>
  {isImporting ? (
    <View style={styles.buttonContent}>
      <ActivityIndicator size="small" color={ArthaColors.white} />
      <ThemedText style={styles.buttonText}>
        {Strings.importingData}
      </ThemedText>
    </View>
  ) : (
    <ThemedText style={styles.buttonText}>
      {Strings.importExcel}
    </ThemedText>
  )}
</TouchableOpacity>
```

---

## 6. Data Transformation Details

### Date Parsing

```typescript
// Two scenarios:

// 1. Excel numeric date (serial number)
const excelDate = new Date((tanggal - 25569) * 86400 * 1000);
const parsedDate = excelDate.toISOString().split("T")[0]; // YYYY-MM-DD

// 2. String date
const dateObj = new Date(tanggal);
const parsedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD

// Validate: must be valid date
if (isNaN(dateObj.getTime())) throw Error("Invalid date");
```

### Amount Parsing

```typescript
// Two scenarios:

// 1. Numeric amount
let parsedAmount = jumlah;

// 2. String with format: "Rp 25.000", "25.000,00", etc
const cleaned = jumlah
  .toString()
  .replace(/[Rp\s.,]/g, "") // Remove symbols
  .trim();
let parsedAmount = parseInt(cleaned, 10);

// Validate
if (isNaN(parsedAmount) || parsedAmount <= 0) {
  throw Error("Amount must be positive number");
}
```

### Type Normalization

```typescript
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
  throw Error("Type must be Pemasukan or Pengeluaran");
}
```

---

## 7. Localization Strings

Added to `constants/strings.ts`:

```typescript
// Import Excel
importExcel: "Impor Excel",
importingData: "Sedang mengimport data...",
importSuccess: "Data berhasil diimport",
importFailed: "Gagal mengimport data",
importSelectFile: "Pilih file Excel untuk diimport",
importValidationError: "File tidak valid",
importPartialSuccess: "Sebagian data berhasil diimport",
importCompleteMessage: "Berhasil mengimport {count} transaksi",
importErrorMessage: "{failed} transaksi gagal diimport",
```

---

## 8. Error Scenarios & Handling

### Scenario 1: Wrong file type

```
User picks: .pdf, .doc
Expected: Alert error immediately
Code: Checked dalam pickExcelFile()
```

### Scenario 2: File too large

```
User picks: 15MB Excel file
Expected: Alert error immediately (max 10MB)
Code: Checked dalam pickExcelFile()
```

### Scenario 3: Missing header column

```
User import: File without "Kategori" column
Expected: Alert error, import stopped
Code: validateAndMapHeaders() throws
```

### Scenario 4: Invalid date format

```
Row data: ["32-02-2026", "Makan", ...]
Expected: Row skipped, error logged
Code: transformTransactionData() catch & continue
```

### Scenario 5: Partial success

```
File: 5 rows, 3 valid, 2 invalid
Expected: Import 3 valid rows, show message
Code: Returns { success: true, successCount: 3, failedCount: 2, errors: [...] }
```

---

## 9. Testing Scenarios

### Test Data: Valid File

```
Tanggal | Kategori | Keterangan | Tipe | Jumlah
2026-02-17 | Makan | Kopi | Pengeluaran | 25000
2026-02-18 | Gaji | Gaji Feb | Pemasukan | 5000000
2026-02-19 | Transport | Ojek | Pengeluaran | Rp 50.000
```

**Expected:** ✅ Import 3/3, success alert

### Test Data: Missing Header

```
Tanggal | CategoryName | Keterangan | Tipe | Jumlah
```

**Expected:** ❌ Alert error for missing "Kategori"

### Test Data: Invalid Date

```
Tanggal | Kategori | Keterangan | Tipe | Jumlah
invalid-date | Makan | ... | Pengeluaran | 25000
```

**Expected:** ⚠️ Row skipped, error: "Format tanggal tidak valid"

### Test Data: Zero Amount

```
...
2026-02-17 | Makan | ... | Pengeluaran | 0
```

**Expected:** ⚠️ Row skipped, error: "Jumlah harus positif"

---

## 10. Comparison with Export

| Aspect              | Export                | Import                         |
| ------------------- | --------------------- | ------------------------------ |
| Trigger             | Button → File created | Button → File picker           |
| File Control        | App generates headers | User provides file             |
| User Flow           | 1 click               | 3 clicks (pick, confirm, save) |
| Error Handling      | Single try-catch      | Row-by-row tracking            |
| Data Transformation | Transaction → Excel   | Excel → Transaction            |
| Partial Success     | N/A                   | Collects failed rows           |

---

## 11. Checklist for Deployment

- [ ] Run `npm install xlsx expo-document-picker`
- [ ] Run `npm run lint` → No errors
- [ ] Update `constants/strings.ts` ✓
- [ ] Update `app/(tabs)/settings.tsx` ✓
- [ ] Create `lib/excel-import.ts` ✓
- [ ] Test minimal flow (pick file → import)
- [ ] Test error cases (missing columns, invalid data)
- [ ] Test partial success (some rows fail)
- [ ] Verify data not corrupted in AsyncStorage
- [ ] Run `eas build -p android --profile preview`
- [ ] Test on Android device/emulator
- [ ] Test on iOS if available

---

## 12. Troubleshooting

| Issue                     | Solution                                       |
| ------------------------- | ---------------------------------------------- |
| DocumentPicker not found  | Run `npx expo install expo-document-picker`    |
| Cannot parse file         | Verify Excel file is .xlsx (not damaged)       |
| Data formatting wrong     | Check date format YYYY-MM-DD, amount as number |
| Import doesn't save       | Verify `addTransaction()` hook working         |
| Duplicate transactions    | Check for retry logic in handler               |
| Slow import on large file | Normal for 1000+ rows, show progress if needed |

---

## Future Enhancements

- [ ] Progress bar for large files
- [ ] Preview before import (show invalid rows)
- [ ] Sample Excel template download
- [ ] Duplicate detection (same date/category/amount)
- [ ] Selective import (choose which rows to import)
- [ ] Import history/log
- [ ] Auto-create missing categories

---

**Status**: ✅ Implementation Complete  
**Last Updated**: 2026-02-17  
**Author**: Artha Development Team
