# 📥 Fitur Import Data Transaksi dari Excel

## 🚀 Quick Start

### 1. Install Dependencies (2 commands)

```bash
cd c:\development\Artha

# Install expo-document-picker (untuk file selection)
npx expo install expo-document-picker

# Note: xlsx dan expo-file-system sudah terinstall dari fitur Export
```

### 2. Verify Installation

```bash
npm list expo-document-picker
```

Expected output: expo-document-picker listed with version

### 3. Build & Test

```bash
eas build -p android --profile preview
# atau untuk quick test:
npm run web
```

---

## 📁 Files Yang Dibuat/Diupdate

### ✅ Created:

1. **`lib/excel-import.ts`** - Utility functions untuk import
   - `importTransactionsFromExcel()` - Main import function
   - `validateImportedData()` - Validate imported transactions
   - `saveImportedTransactions()` - Placeholder untuk save

### ✅ Updated:

1. **`app/(tabs)/settings.tsx`** - Tambah import button dengan handler
2. **`constants/strings.ts`** - Tambah localization strings

---

## 🎯 Features

✅ **File Selection**

- DocumentPicker untuk pilih file dari device storage
- Filter hanya .xlsx dan .xls files
- Max file size: 10MB

✅ **File Reading**

- Baca file dengan base64 encoding (platform-compatible)
- Support xlsx dan xls format

✅ **Data Validation**

- Required headers: Tanggal, Kategori, Keterangan, Tipe, Jumlah
- Case-insensitive header matching
- Detail error messages untuk setiap validation fail

✅ **Data Transformation**

- Convert Excel numeric dates ke YYYY-MM-DD format
- Parse amount: string → number (remove Rp, dots, commas)
- Normalize tipe: Pemasukan/Income/Masuk → income, Pengeluaran/Expense/Keluar → expense
- Handle empty notes → undefined

✅ **User Experience**

- Loading indicator saat file dibaca
- Confirmation dialog sebelum save
- Detailed success message: jumlah transaksi berhasil diimport
- Error alerts dengan penjelasan detail per row

✅ **Error Handling**

- Row-by-row error tracking (tidak stop di first error)
- Partial success: import row yang valid, skip yang error
- Detailed error messages untuk user troubleshooting

---

## 💻 Implementation Details

### Function: `importTransactionsFromExcel()`

```typescript
// Usage in component:
const result = await importTransactionsFromExcel();

if (result.success && result.successCount > 0) {
  // User confirm → save ke database
  for (const tx of result.data) {
    await addTransaction(tx);
  }
}
```

**Parameters:** None (user dipilih file via DocumentPicker)

**Returns:** `Promise<ImportResult>`

```typescript
interface ImportResult {
  success: boolean; // Overall success
  data: Transaction[]; // Valid transactions
  totalRows: number; // Total rows in file
  successCount: number; // Successfully parsed
  failedCount: number; // Failed to parse
  errors: string[]; // Detail errors per row
}
```

**Workflow:**

1. Pick file dari device storage (DocumentPicker)
2. Validate file type (.xlsx atau .xls)
3. Validate file size (max 10MB)
4. Read file dengan base64 encoding
5. Parse dengan XLSX library
6. Validate required headers ada
7. Transform setiap row ke Transaction object
8. Collect errors untuk rows yang invalid
9. Return result dengan success flag dan detail

### Header Validation

Required headers (case-insensitive):

- **Tanggal**: Acceptable: "tanggal", "date", "tgl"
- **Kategori**: Acceptable: "kategori", "category", "cat"
- **Keterangan**: Acceptable: "keterangan", "notes", "catatan", "description", "desc"
- **Tipe**: Acceptable: "tipe", "type", "jenis", "kind"
- **Jumlah**: Acceptable: "jumlah", "amount", "nominal", "nilai"

Jika ada header yang hilang → Alert error dan stop process

### Data Transformation & Validation

**Tanggal:**

- Format: YYYY-MM-DD (ISO format)
- Accept: Excel numeric date (serial) atau string date
- Parse dengan Date object, validate format YYYY-MM-DD

**Tipe:**

- Input: "Pemasukan", "Income", "Masuk", "Pengeluaran", "Expense", "Keluar", dll
- Output: "income" atau "expense"
- Case-insensitive matching

**Jumlah:**

- Input: Number direct atau String dengan format "Rp 25.000", "25000", "25.000,00", dll
- Output: Number (positive integer)
- Parse: remove Rp, spaces, dots (thousand separator), commas (decimal separator)
- Validate: harus > 0

**Kategori:**

- Normalize: lowercase, replace spaces dengan underscore
- Example: "Makan" → "makan", "Beli Kopi" → "beli_kopi"

**Keterangan:**

- Optional field
- Trim whitespace
- Store sebagai undefined jika kosong (jangan null atau empty string)

### Integration di Settings

```typescript
// State
const [isImporting, setIsImporting] = useState(false);

// Handler
const handleImportTransactions = async () => {
  setIsImporting(true);
  try {
    const result = await importTransactionsFromExcel();

    if (!result.success || result.successCount === 0) {
      Alert.alert("Error", result.errors[0] || "Failed to import");
      return;
    }

    // Validate data
    const validation = validateImportedData(result.data);
    if (!validation.valid) {
      Alert.alert("Validation Error", validation.errors.join("\n"));
      return;
    }

    // Confirm sebelum save
    Alert.alert(
      "Konfirmasi Import",
      `Will import ${result.successCount} transactions. ${result.failedCount} failed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: async () => {
            // Save semua transaksi
            for (const tx of result.data) {
              await addTransaction(tx);
            }
            Alert.alert("Success", `Imported ${result.successCount} transactions`);
          },
        },
      ]
    );
  } finally {
    setIsImporting(false);
  }
};

// Button JSX
<TouchableOpacity
  onPress={handleImportTransactions}
  disabled={isImporting}
>
  {isImporting ? (
    <>
      <ActivityIndicator />
      <Text>{Strings.importingData}</Text>
    </>
  ) : (
    <Text>{Strings.importExcel}</Text>
  )}
</TouchableOpacity>
```

---

## 📋 Excel Format for Import

**Expected format untuk file Excel yang di-import:**

| Tanggal    | Kategori  | Keterangan     | Tipe        | Jumlah    |
| ---------- | --------- | -------------- | ----------- | --------- |
| 2026-02-17 | Makan     | Beli Kopi      | Pengeluaran | Rp 25.000 |
| 2026-02-18 | Gaji      | Gaji Bulanan   | Pemasukan   | 5000000   |
| 2026-02-19 | Transport | Ojek ke kantor | Pengeluaran | 50000     |

**Requirements:**

- Header row wajib ada di row pertama
- Format date bisa: "2026-02-17" atau "2/17/2026" atau Excel date serial
- Amountbisa dengan atau tanpa "Rp" dan simbol lainnya
- Data minimal 1 row (plus header)
- Tidak ada blank rows di tengah-tengah (ok kalau single blank row di akhir)

---

## 🧪 Testing Workflow

### Minimal Test

```
1. Create Excel file dengan format yang benar
2. Go to Settings → Import Excel
3. Pick file
4. Verify processing dialog shows
5. Confirm import
6. Verify success alert dengan jumlah data
7. Go to Transactions → verify data ada
```

### Test Cases

**Test 1: Valid file dengan 3 transaksi**

- Expected: ✅ Import berhasil, 3/3 transaksi imported

**Test 2: File dengan missing required column**

- Expected: ❌ Alert error: "Kolom 'Tanggal' tidak ditemukan"

**Test 3: File dengan invalid date format**

- Expected: ⚠️ Partial success: valid rows imported, error rows skipped
- Message: "Berhasil mengimport 2 transaksi. 1 transaksi gagal: Row 3: Format tanggal tidak valid"

**Test 4: File dengan invalid tipe**

- Expected: ⚠️ Row skipped dengan error detail
- Message: "Tipe harus 'Pemasukan/Income' atau 'Pengeluaran/Expense'"

**Test 5: File dengan 0 amount**

- Expected: ❌ Row skipped
- Message: "Jumlah harus berupa angka positif"

**Test 6: File dengan duplikat kategori name**

- Expected: ✅ Kategori auto-normalize ke ID format
- Example: "Makan" dan "makan" → both become "makan"

**Test 7: Cancel import dialog**

- Expected: Data tidak disimpan, transactions list unchanged

---

## 📊 Error Messages Reference

| Error                                                             | Cause                   | Solution                     |
| ----------------------------------------------------------------- | ----------------------- | ---------------------------- |
| "File harus berformat Excel (.xlsx atau .xls)"                    | Wrong file type         | Pick .xlsx atau .xls file    |
| "Ukuran file terlalu besar (max 10MB)"                            | File > 10MB             | Use smaller Excel file       |
| "File Excel kosong atau tidak ada data"                           | No data rows            | Add transactions ke Excel    |
| "Kolom 'Tanggal' tidak ditemukan"                                 | Missing required header | Add "Tanggal" column         |
| "Row X: Format tanggal tidak valid"                               | Bad date format         | Use YYYY-MM-DD format        |
| "Row X: Tipe harus 'Pemasukan/Income' atau 'Pengeluaran/Expense'" | Invalid tipe value      | Use Pemasukan or Pengeluaran |
| "Row X: Jumlah harus berupa angka positif"                        | Amount ≤ 0              | Use positive number          |
| "Row X: Field wajib ada yang kosong"                              | Missing required field  | Fill all required columns    |

---

## 🔐 Security & Validation

✅ **Security:**

- File hanya dibaca, tidak dimodifikasi
- No upload ke external services
- Row-by-row validation, invalid rows tidak crash app
- File size limited ke 10MB

✅ **Validation:**

- Header validation (required columns ada)
- Data type validation (amount is number, date is valid format)
- Range validation (amount > 0)
- Empty cell handling (graceful skip atau use default)

✅ **Error Handling:**

- Graceful degradation: partial success jika sebagian rows valid
- Detailed error messages per row untuk troubleshooting
- User confirmation sebelum write ke database

---

## 🔄 Comparison: Export vs Import

| Aspect            | Export                               | Import                                  |
| ----------------- | ------------------------------------ | --------------------------------------- |
| File Format       | .xlsx                                | .xlsx atau .xls                         |
| User Action       | Click button → Auto filename → Share | Click button → Pick file → Confirm save |
| Data Flow         | RAM → Workbook → File → Share        | File → Read → Parse → RAM → Save        |
| Header Control    | App generates                        | User provides (validated)               |
| String → Number   | Currency format                      | Parse & remove symbols                  |
| Error Handling    | Single try-catch                     | Row-by-row tracking                     |
| Success Indicator | Filename generated                   | Jumlah rows imported                    |

---

## 🛠️ Advanced: Integrate dengan Backend (Future)

Jika ingin extend untuk sync dengan server:

```typescript
// Placeholder untuk future backend integration
const syncImportedTransactions = async (transactions: Transaction[]) => {
  // TODO: POST /api/transactions/batch
  // Handle conflict resolution (same date/category)
  // Retry logic untuk network failures
};
```

---

## ✅ Completion Status

**Implementation:** ✅ Complete
**Testing:** ⏳ Pending (run checklist)
**Documentation:** ✅ Complete
**Production Ready:** ⏳ After QA testing

---

**Dibuat:** 2026-02-17  
**Status:** Ready for QA & Testing  
**Next:** Run test suite dan verify import tidak corrupt existing data ✓
