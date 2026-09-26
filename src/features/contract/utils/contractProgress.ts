export interface ContractProgressResult {
  percentage: number;
  formattedPercentage: string;
  daysRemaining: number;
  totalDays: number;
  elapsedDays: number;
  statusLabel: string;
  humanReadableRemaining: string;
  humanReadableTotal: string;
  isExpired: boolean;
  isNotStarted: boolean;
}

/**
 * Formats a given number of days into a human-readable Vietnamese string:
 * - 12 -> "12 ngày"
 * - 102 -> "3 tháng 12 ngày"
 * - 463 -> "1 năm 3 tháng 8 ngày"
 */
export function formatDaysToHumanReadable(days: number, locale = "vi"): string {
  const isEn = locale === "en";
  if (days <= 0) return isEn ? "0 days" : "0 ngày";

  const years = Math.floor(days / 365);
  const remAfterYears = days % 365;
  const months = Math.floor(remAfterYears / 30);
  const remainingDays = remAfterYears % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(isEn ? `${years} ${years > 1 ? "years" : "year"}` : `${years} năm`);
  if (months > 0) parts.push(isEn ? `${months} ${months > 1 ? "months" : "month"}` : `${months} tháng`);
  if (remainingDays > 0 || parts.length === 0) {
    parts.push(isEn ? `${remainingDays} ${remainingDays > 1 ? "days" : "day"}` : `${remainingDays} ngày`);
  }

  return parts.join(" ");
}

/**
 * Calculates the contract progress percentage based on start_date and end_date relative to current time.
 */
export function calculateContractProgress(
  startDateStr?: string | null,
  endDateStr?: string | null,
  locale = "vi"
): ContractProgressResult {
  const isEn = locale === "en";

  if (!startDateStr || !endDateStr) {
    return {
      percentage: 0,
      formattedPercentage: "0%",
      daysRemaining: 0,
      totalDays: 0,
      elapsedDays: 0,
      statusLabel: isEn ? "Undetermined" : "Chưa xác định",
      humanReadableRemaining: isEn ? "0 days" : "0 ngày",
      humanReadableTotal: isEn ? "0 days" : "0 ngày",
      isExpired: false,
      isNotStarted: false,
    };
  }

  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const now = new Date().getTime();

  if (isNaN(start) || isNaN(end) || end <= start) {
    return {
      percentage: 0,
      formattedPercentage: "0%",
      daysRemaining: 0,
      totalDays: 0,
      elapsedDays: 0,
      statusLabel: isEn ? "Invalid duration" : "Thời gian không hợp lệ",
      humanReadableRemaining: isEn ? "0 days" : "0 ngày",
      humanReadableTotal: isEn ? "0 days" : "0 ngày",
      isExpired: false,
      isNotStarted: false,
    };
  }

  const totalDuration = end - start;
  const totalDays = Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24)));
  const humanReadableTotal = formatDaysToHumanReadable(totalDays, locale);

  if (now < start) {
    const daysUntilStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    const humanUntilStart = formatDaysToHumanReadable(daysUntilStart, locale);
    return {
      percentage: 0,
      formattedPercentage: "0%",
      daysRemaining: totalDays,
      totalDays,
      elapsedDays: 0,
      statusLabel: isEn ? `Not started (${humanUntilStart} left)` : `Chưa bắt đầu (còn ${humanUntilStart})`,
      humanReadableRemaining: humanReadableTotal,
      humanReadableTotal,
      isExpired: false,
      isNotStarted: true,
    };
  }

  if (now > end) {
    return {
      percentage: 100,
      formattedPercentage: "100%",
      daysRemaining: 0,
      totalDays,
      elapsedDays: totalDays,
      statusLabel: isEn ? "Expired" : "Đã hết hạn",
      humanReadableRemaining: isEn ? "0 days" : "0 ngày",
      humanReadableTotal,
      isExpired: true,
      isNotStarted: false,
    };
  }

  const elapsed = now - start;
  const percentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24))));
  const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const humanReadableRemaining = formatDaysToHumanReadable(daysRemaining, locale);

  const statusLabel = isEn
    ? (totalDays < 30 ? `${daysRemaining}/${totalDays} days left` : `${humanReadableRemaining} left`)
    : (totalDays < 30 ? `Còn ${daysRemaining}/${totalDays} ngày` : `Còn ${humanReadableRemaining}`);

  return {
    percentage,
    formattedPercentage: `${percentage}%`,
    daysRemaining,
    totalDays,
    elapsedDays,
    statusLabel,
    humanReadableRemaining,
    humanReadableTotal,
    isExpired: false,
    isNotStarted: false,
  };
}
