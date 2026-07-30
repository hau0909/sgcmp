/**
 * Utility functions for calculating Service Quotations (3 Options: Hourly, Monthly, Package)
 */

const DAY_MAP: Record<string, number> = {
  // Standard English abbreviations
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
  // Vietnamese abbreviations
  CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6,
  // Numeric strings
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 0,
};

/**
 * Format floating hours cleanly: e.g. 8 -> "8h", 3.833333 -> "3.83h"
 */
export function formatHours(hours: number): string {
  if (isNaN(hours) || hours <= 0) return "0h";
  if (Number.isInteger(hours)) return `${hours}h`;
  const rounded = Math.round(hours * 100) / 100;
  return `${rounded}h`;
}

/**
 * Format calendar duration breakdown (Years, Months, Weeks, Days) neatly
 */
export function formatDetailedDuration(
  startDateStr: string,
  endDateStr: string,
  totalWorkingDays?: number
): string {
  if (!startDateStr || !endDateStr) return "";

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return "";

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  let years = Math.floor(totalDays / 365);
  let remDays = totalDays % 365;

  let months = Math.floor(remDays / 30);
  remDays = remDays % 30;

  let weeks = Math.floor(remDays / 7);
  let days = remDays % 7;

  const parts: string[] = [];

  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (weeks > 0) parts.push(`${weeks} tuần`);
  if (days > 0) parts.push(`${days} ngày`);

  let durationText = parts.length > 0 ? parts.join(" ") : `${totalDays} ngày`;

  if (totalWorkingDays !== undefined && totalWorkingDays > 0) {
    durationText += ` (tổng ${totalWorkingDays} ngày làm việc)`;
  }

  return durationText;
}

/**
 * Calculate total hours per day from array of time_slots (e.g. ["08:00 - 16:00", "16:00 - 00:00"])
 */
export function calculateHoursPerDay(timeSlots: string[]): number {
  if (!timeSlots || timeSlots.length === 0) return 8;

  let totalHours = 0;

  timeSlots.forEach((slot) => {
    const parts = slot.split("-").map((s) => s.trim());
    if (parts.length === 2) {
      const [startH, startM] = parts[0].split(":").map(Number);
      const [endH, endM] = parts[1].split(":").map(Number);

      if (!isNaN(startH) && !isNaN(endH)) {
        let startMinutes = startH * 60 + (startM || 0);
        let endMinutes = endH * 60 + (endM || 0);

        if (endMinutes <= startMinutes) {
          // Crosses midnight (e.g., 22:00 to 06:00)
          endMinutes += 24 * 60;
        }

        const durationMinutes = endMinutes - startMinutes;
        totalHours += durationMinutes / 60;
      }
    }
  });

  const rawHours = totalHours > 0 ? totalHours : 8;
  return Math.round(rawHours * 100) / 100;
}

/**
 * Count actual working days between start_date and end_date matching day_per_week
 */
export function countWorkingDays(
  startDateStr: string,
  endDateStr: string,
  daysPerWeek: string[]
): number {
  if (!startDateStr || !endDateStr) return 0;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  const targetDays = new Set(
    daysPerWeek
      .map((d) => DAY_MAP[d.toUpperCase()])
      .filter((val) => val !== undefined)
  );

  const effectiveTargetDays = targetDays.size > 0 ? targetDays : new Set([0, 1, 2, 3, 4, 5, 6]);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    if (effectiveTargetDays.has(current.getDay())) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Calculate total months between start_date and end_date
 */
export function calculateTotalMonths(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 1;

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const months = diffDays / 30;
  return Math.max(0.5, Math.round(months * 10) / 10);
}

/**
 * Calculate suggested quotation totals and details for all 3 options
 */
export interface QuotationCalculationResult {
  hoursPerDay: number;
  totalWorkingDays: number;
  totalMonths: number;
  totalGuardHours: number;
  detailedDurationStr: string;
  
  // Option 1: Hourly
  suggestedHourlyRate: number;
  hourlyTotalPrice: number;
  
  // Option 2: Monthly (per position / guard)
  suggestedMonthlyRate: number;
  monthlyTotalPrice: number;
  
  // Option 3: Package
  packageTotalPrice: number;
}

export function calculateQuotationSuggestions(params: {
  basePricePerHour: number | null;
  guardsPerSlot: number;
  timeSlots: string[];
  daysPerWeek: string[];
  startDate: string;
  endDate: string;
}): QuotationCalculationResult {
  const guardsCount = Math.max(1, params.guardsPerSlot || 1);
  const hoursPerDay = calculateHoursPerDay(params.timeSlots);
  const totalWorkingDays = countWorkingDays(params.startDate, params.endDate, params.daysPerWeek);
  const totalMonths = calculateTotalMonths(params.startDate, params.endDate);
  const detailedDurationStr = formatDetailedDuration(params.startDate, params.endDate, totalWorkingDays);
  
  const totalGuardHours = Math.round(hoursPerDay * totalWorkingDays * guardsCount * 100) / 100;

  // Base rate per hour
  const suggestedHourlyRate = params.basePricePerHour && params.basePricePerHour > 0
    ? params.basePricePerHour
    : 40000;

  // Option 1: Hourly Total = hourly_rate * total_guard_hours
  const hourlyTotalPrice = Math.round(suggestedHourlyRate * totalGuardHours);

  // Option 2: Monthly Rate (Per position/guard per month)
  // Total Monthly Price = monthly_rate * guardsCount * totalMonths
  const suggestedMonthlyRate = (totalMonths > 0 && guardsCount > 0)
    ? Math.round(hourlyTotalPrice / (totalMonths * guardsCount))
    : hourlyTotalPrice;
  const monthlyTotalPrice = Math.round(suggestedMonthlyRate * guardsCount * totalMonths);

  // Option 3: Package Price (Defaults to exact hourly total)
  const packageTotalPrice = hourlyTotalPrice;

  return {
    hoursPerDay,
    totalWorkingDays,
    totalMonths,
    totalGuardHours,
    detailedDurationStr,
    suggestedHourlyRate,
    hourlyTotalPrice,
    suggestedMonthlyRate,
    monthlyTotalPrice,
    packageTotalPrice,
  };
}
