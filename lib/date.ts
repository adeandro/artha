/**
 * Date utility functions
 */

export const getTodayDateString = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

export const getMonthDateRange = (
  year: number,
  month: number,
): { start: string; end: string } => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

export const getCurrentMonth = (): { year: number; month: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
};

export const formatDate = (
  dateString: string,
  locale: "id" | "en" = "id",
): string => {
  const date = new Date(dateString + "T00:00:00");
  if (locale === "id") {
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getMonthYear = (year: number, month: number): string => {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("id-ID", { year: "numeric", month: "long" });
};

export const getDaysRemainingInMonth = (): number => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDay - now.getDate();
  return Math.max(0, daysRemaining);
};
