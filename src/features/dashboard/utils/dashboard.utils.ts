/**
 * Tính thời gian tương đối bằng tiếng Việt từ chuỗi ngày (ISO, v.v.)
 * Nhận thêm tham số nowInput (tùy chọn) để hỗ trợ Unit Test với thời gian cố định
 */
export function getRelativeTimeString(dateInput: string | Date, nowInput?: Date): string {
  const date = new Date(dateInput);
  const now = nowInput || new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
}

export type MetricWithTrend = {
  count: number;
  addedCount?: number;
  percentChange: number | null;
  trend: "up" | "down" | "neutral";
};

/**
 * Tính % thay đổi và chiều hướng xu hướng từ hai số nguyên
 */
export function calcTrend(current: number, prev: number): MetricWithTrend {
  let percentChange: number | null = null;
  let trend: "up" | "down" | "neutral" = "neutral";

  if (prev > 0) {
    percentChange = Math.round(((current - prev) / prev) * 100);
    if (percentChange > 0) trend = "up";
    else if (percentChange < 0) trend = "down";
  } else if (current > 0) {
    percentChange = 100;
    trend = "up";
  }

  return { count: current, percentChange, trend };
}

export interface PerformanceCounts {
  onDutyCount: number;
  overtimeCount: number;
  lateCount: number;
  absentCount: number;
  replacementCount: number;
}

export interface GuardPerformanceRadarItem {
  subject: string;
  score: number;
  count: string;
  badgeBg: string;
}

/**
 * Thuật toán chuẩn hóa co giãn tuyến tính dữ liệu đa biến cho biểu đồ Radar
 */
export function calculateRadarScores(counts: PerformanceCounts): GuardPerformanceRadarItem[] {
  const maxVal = Math.max(
    counts.onDutyCount,
    counts.overtimeCount,
    counts.lateCount,
    counts.absentCount,
    counts.replacementCount,
    1
  );

  const calcScore = (val: number) => Math.min(100, Math.round((val / maxVal) * 90) + 10);

  return [
    {
      subject: "Đang trực",
      score: counts.onDutyCount > 0 ? calcScore(counts.onDutyCount) : 0,
      count: `${counts.onDutyCount}`,
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
    },
    {
      subject: "TĂNG CA",
      score: counts.overtimeCount > 0 ? calcScore(counts.overtimeCount) : 0,
      count: `${counts.overtimeCount}`,
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
    {
      subject: "Đi trễ",
      score: counts.lateCount > 0 ? calcScore(counts.lateCount) : 0,
      count: `${counts.lateCount}`,
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
    {
      subject: "Vắng mặt",
      score: counts.absentCount > 0 ? calcScore(counts.absentCount) : 0,
      count: `${counts.absentCount}`,
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200/80",
    },
    {
      subject: "Thay ca",
      score: counts.replacementCount > 0 ? calcScore(counts.replacementCount) : 0,
      count: `${counts.replacementCount}`,
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200/80",
    },
  ];
}

/**
 * Tính số phút điểm danh đi trễ so với giờ bắt đầu ca trực
 */
export function calculateMinutesLate(
  checkInTime: string | Date,
  shiftStartTime: string | Date
): number {
  const checkInDate = new Date(checkInTime);
  const shiftStartDate = new Date(shiftStartTime);
  return Math.max(0, Math.round((checkInDate.getTime() - shiftStartDate.getTime()) / 60000));
}

export interface RawPlanCount {
  planName: string;
  count: number;
}

export interface PlanDistributionItem {
  name: string;
  count: number;
  value: number;
  color: string;
}

/**
 * Thuật toán tính tỷ trọng % cơ cấu gói thuê bao, gắn mã màu và sắp xếp giảm dần
 */
export function calculatePlanDistribution(rawData: RawPlanCount[]): PlanDistributionItem[] {
  const total = rawData.reduce((sum, item) => sum + item.count, 0);

  const items = rawData.map((item) => {
    const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;

    let color = "#94a3b8"; // Mặc định
    const planLower = (item.planName || "").toLowerCase();
    if (planLower.includes("premium") || planLower.includes("enterprise")) {
      color = "#0047a0";
    } else if (planLower.includes("standard") || planLower.includes("business")) {
      color = "#3b82f6";
    } else if (planLower.includes("basic") || planLower.includes("starter")) {
      color = "#334155";
    }

    return {
      name: item.planName,
      count: item.count,
      value: percent,
      color,
    };
  });

  return items.sort((a, b) => b.value - a.value);
}
