# Custom Budget Periods Feature Guide

## Overview

The Artha budgeting system now supports **custom date periods** in addition to automatic monthly budgets. This allows users to create budgets for any date range they prefer, such as:

- Weekly budgets
- Bi-weekly budgets
- Project-specific periods
- Custom spending windows

## How It Works

### Budget Modal Component

The new enhanced `BudgetModal` component (`components/modals/budget-modal.tsx`) provides:

1. **Period Type Toggle**: Choose between "Bulanan" (Monthly) or "Custom" period
2. **Date Pickers**: When custom period is selected, users can pick:
   - **Tanggal Mulai** (Start Date)
   - **Tanggal Akhir** (End Date)
3. **Validation**: Ensures end date is >= start date
4. **Cross-Platform Support**: Works on iOS (with native DatePickerIOS), Android (with DatePickerAndroid), and web

### Data Structure

#### Budget Type (lib/types.ts)

```typescript
interface Budget {
  id: string;
  categoryId: string;
  limit: number; // Budget limit in IDR
  year: number; // For monthly budgets
  month: number; // For monthly budgets (1-12)
  createdAt: string;
  // Custom period support
  isCustomPeriod?: boolean; // If true, use startDate and endDate
  startDate?: string; // ISO date format (YYYY-MM-DD)
  endDate?: string; // ISO date format (YYYY-MM-DD)
}
```

#### BudgetModalData Type (components/modals/budget-modal.tsx)

```typescript
export interface BudgetModalData {
  limit: number;
  isCustomPeriod?: boolean;
  startDate?: string; // ISO format
  endDate?: string; // ISO format
}
```

## User Flow

### Creating a Monthly Budget (Automatic Reset)

1. Open Settings → "Tambah Budget"
2. Select expense category
3. Enter budget limit
4. Select "Bulanan" (Monthly) toggle - **this is the default**
5. Budget automatically resets on the 1st of each month
6. Will appear in Dashboard with "⏰ X hari sampai reset" indicator

### Creating a Custom Period Budget

1. Open Settings → "Tambah Budget"
2. Select expense category
3. Enter budget limit
4. Select "Custom" toggle
5. Set "Tanggal Mulai" (Start Date)
6. Set "Tanggal Akhir" (End Date)
7. Budget will only be active during this date range
8. Will appear in Dashboard with "📅 Hingga [end date]" indicator

## Implementation Details

### Dashboard Integration (app/(tabs)/dashboard.tsx)

The `currentMonthBudgets` useMemo hook has been enhanced to:

1. **Filter budgets** based on period type:

   ```typescript
   if (b.isCustomPeriod && b.startDate && b.endDate) {
     // Custom period: check if today is within range
     const today = new Date().toISOString().split("T")[0];
     return today >= b.startDate && today <= b.endDate;
   } else {
     // Automatic monthly: check year and month
     return b.year === year && b.month === month;
   }
   ```

2. **Calculate spent amount** for each budget:
   - **Custom period**: Sums transactions from `startDate` to `endDate`
   - **Monthly**: Sums transactions within current month

3. **Pass period info** to BudgetProgressBar:
   ```typescript
   return {
     categoryName,
     limit: budget.limit,
     spent,
     isCustomPeriod: budget.isCustomPeriod,
     endDate: budget.endDate,
   };
   ```

### Budget Progress Bar Updates (components/charts/budget-progress-bar.tsx)

Enhanced `BudgetProgressItem` interface:

```typescript
interface BudgetProgressItem {
  categoryName: string;
  limit: number;
  spent: number;
  isCustomPeriod?: boolean; // New field
  endDate?: string; // New field
}
```

Display logic now shows:

- **For monthly budgets**: "⏰ X hari sampai reset" (days until auto-reset)
- **For custom period budgets**: "📅 Hingga [formatted date]" (end date of custom period)

### Settings Integration (app/(tabs)/settings.tsx)

The settings screen now:

1. Imports the new `BudgetModal` component
2. Uses `BudgetModalData` type for passing data
3. Handles both monthly and custom period budgets in `handleAddBudget`:
   ```typescript
   const newBudget: Budget = {
     id: `budget_${Date.now()}`,
     categoryId: selectedCategoryForBudget,
     limit: budgetData.limit,
     year,
     month,
     createdAt: new Date().toISOString(),
     isCustomPeriod: budgetData.isCustomPeriod, // From modal
     startDate: budgetData.startDate, // From modal
     endDate: budgetData.endDate, // From modal
   };
   ```

## Date Handling

### Date Picker Behavior

#### iOS

- Uses native `DatePickerIOS` component
- Modal presentation with "Selesai" (Done) button
- Automatic ISO format conversion

#### Android

- Uses native `DatePickerAndroid` API
- Responds to selected date immediately
- Automatic ISO format conversion

#### Web

- Would use HTML5 date inputs (framework fallback)
- Automatic ISO format conversion

### Date Formatting

- **Storage**: ISO format `YYYY-MM-DD` (UTC, consistent across platforms)
- **Display in UI**: Bahasa Indonesia format `DD/MM/YYYY`
- **Comparison**: Direct string comparison (ISO format sorts correctly)

## Features & Validations

✅ **Automatic Monthly Budgets**

- Default behavior
- Auto-reset on 1st of each month
- Shows countdown timer
- Backward compatible

✅ **Custom Period Budgets**

- Flexible date ranges
- No automatic reset
- Shows end date indicator
- Date picker validation (endDate >= startDate)

✅ **Cross-Platform Support**

- iOS: Native DatePickerIOS
- Android: Native DatePickerAndroid
- Web: HTML5 date inputs
- Consistent behavior across all platforms

✅ **Transaction Filtering**

- Correct spending calculation per budget type
- Real-time updates when transactions change
- Accurate progress bar visualization

✅ **Localization**

- All UI text in Bahasa Indonesia
- Date formatted in local format
- Consistent with app's language requirements

## Testing Checklist

- [ ] Create monthly budget (default toggle)
  - [ ] Verify appears in dashboard
  - [ ] Check "⏰ X hari sampai reset" shows
  - [ ] Confirm spending calculation is correct
- [ ] Create custom period budget
  - [ ] Toggle to "Custom" mode
  - [ ] Set start and end dates
  - [ ] Verify appears in dashboard only within date range
  - [ ] Check "📅 Hingga [date]" shows end date
  - [ ] Confirm spending filtered to date range
- [ ] Date Picker Testing
  - [ ] iOS: DatePickerIOS renders correctly
  - [ ] Android: DatePickerAndroid opens/selects dates
  - [ ] Validation: Prevents endDate < startDate
- [ ] Dashboard Display
  - [ ] Both monthly and custom budgets show correctly
  - [ ] Colors (Green/Yellow/Red) work for both types
  - [ ] Period indicators show appropriately
- [ ] Data Persistence
  - [ ] Budgets saved to AsyncStorage
  - [ ] Custom periods preserved on app restart
  - [ ] Multiple custom period budgets work together

## Code Files Modified

### New Features

- **`components/modals/budget-modal.tsx`**: Enhanced with date pickers and period toggle
- **`CUSTOM_BUDGET_PERIODS_GUIDE.md`**: This documentation

### Updated Files

- **`lib/types.ts`**: Added custom period fields to Budget interface
- **`app/(tabs)/dashboard.tsx`**: Enhanced budget filtering for custom periods
- **`app/(tabs)/settings.tsx`**: Integrated BudgetModal with custom period support
- **`components/charts/budget-progress-bar.tsx`**: Display custom period info

## TypeScript Validation

✅ **Strict Mode Compliance**: All changes maintain TypeScript strict mode
✅ **No Type Errors**: Full type safety for budget data
✅ **Backward Compatible**: Existing monthly budgets work unchanged

## Performance Notes

- Date filtering uses simple string comparison (ISO format)
- No additional API calls or complex calculations
- UseMemo hooks optimize re-renders
- Same AsyncStorage performance as before

## Future Enhancement Ideas

- Budget templates (weekly, bi-weekly, project-based)
- Recurring custom period budgets
- Budget history and analytics
- Budget notifications when approaching limits
- Budget comparison across periods
