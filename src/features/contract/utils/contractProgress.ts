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
export function formatDaysToHumanReadable(days: number): string {
  if (days <= 0) return "0 ngày";

  const years = Math.floor(days / 365);
  const remAfterYears = days % 365;
  const months = Math.floor(remAfterYears / 30);
  const remainingDays = remAfterYears % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (remainingDays > 0 || parts.length === 0) parts.push(`${remainingDays} ngày`);

  return parts.join(" ");
}

/**
 * Calculates the contract progress percentage based on start_date and end_date relative to current time.
 */
export function calculateContractProgress(
  startDateStr?: string | null,
  endDateStr?: string | null
): ContractProgressResult {
  if (!startDateStr || !endDateStr) {
    return {
      percentage: 0,
      formattedPercentage: "0%",
      daysRemaining: 0,
      totalDays: 0,
      elapsedDays: 0,
      statusLabel: "Chưa xác định",
      humanReadableRemaining: "0 ngày",
      humanReadableTotal: "0 ngày",
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
      statusLabel: "Thời gian không hợp lệ",
      humanReadableRemaining: "0 ngày",
      humanReadableTotal: "0 ngày",
      isExpired: false,
      isNotStarted: false,
    };
  }

  const totalDuration = end - start;
  const totalDays = Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24)));
  const humanReadableTotal = formatDaysToHumanReadable(totalDays);

  if (now < start) {
    const daysUntilStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    const humanUntilStart = formatDaysToHumanReadable(daysUntilStart);
    return {
      percentage: 0,
      formattedPercentage: "0%",
      daysRemaining: totalDays,
      totalDays,
      elapsedDays: 0,
      statusLabel: `Chưa bắt đầu (còn ${humanUntilStart})`,
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
      statusLabel: "Đã hết hạn",
      humanReadableRemaining: "0 ngày",
      humanReadableTotal,
      isExpired: true,
      isNotStarted: false,
    };
  }

  const elapsed = now - start;
  const percentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24))));
  const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const humanReadableRemaining = formatDaysToHumanReadable(daysRemaining);

  const statusLabel =
    totalDays < 30
      ? `Còn ${daysRemaining}/${totalDays} ngày`
      : `Còn ${humanReadableRemaining}`;

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
