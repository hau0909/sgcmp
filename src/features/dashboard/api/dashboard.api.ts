import { fetcher } from "@/lib/fetcher";

/** Kiểu trả về chung cho tất cả metric dashboard */
export type MetricWithTrend = {
  count: number;
  /** % thay đổi so với tháng trước, null nếu không có dữ liệu tháng trước */
  percentChange: number | null;
  trend: "up" | "down" | "neutral";
};

/** @deprecated dùng MetricWithTrend */
export type ActiveGuardsOnShiftResult = MetricWithTrend;

// ─────────────────────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────────────────────

/**
 * Số lượng bảo vệ đang trực + % so với tháng trước.
 * GET /api/dashboard/active-guards?companyId=...
 */
export const requestGetActiveGuardsOnShift = (
  companyId: string,
): Promise<MetricWithTrend> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/active-guards?${params.toString()}`,
    { method: "GET" },
  ) as Promise<MetricWithTrend>;
};

/**
 * Tổng số hợp đồng đang hoạt động + % so với tháng trước.
 * GET /api/dashboard/active-contracts?companyId=...
 */
export const requestGetActiveContracts = (
  companyId: string,
): Promise<MetricWithTrend> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/active-contracts?${params.toString()}`,
    { method: "GET" },
  ) as Promise<MetricWithTrend>;
};

/**
 * Tổng số báo cáo sự cố chờ xử lý + % so với tháng trước.
 * GET /api/dashboard/pending-reports?companyId=...
 */
export const requestGetPendingReports = (
  companyId: string,
): Promise<MetricWithTrend> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/pending-reports?${params.toString()}`,
    { method: "GET" },
  ) as Promise<MetricWithTrend>;
};

/** Kiểu trả về cho metric điểm đánh giá */
export type RatingWithTrend = {
  averageRating: number | null;
  percentChange: number | null;
  trend: "up" | "down" | "neutral";
};

/**
 * Điểm đánh giá trung bình + % thay đổi so với tháng trước.
 * GET /api/dashboard/rating?companyId=...
 */
export const requestGetRating = (
  companyId: string,
): Promise<RatingWithTrend> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/rating?${params.toString()}`,
    { method: "GET" },
  ) as Promise<RatingWithTrend>;
};

export type DashboardSubscriptionResult = {
  plan: {
    plan_id: number;
    plan_name: string;
    description: string | null;
    price: number;
    duration_days: number;
    max_coordinators: number | null;
    max_guards: number | null;
    features: string[];
    is_active: boolean;
  } | null;
  subscription: {
    subscription_id: string;
    company_id: string;
    plan_id: number;
    start_date: string;
    end_date: string;
    status: string;
    auto_renew: boolean;
  } | null;
  usage: {
    coordinators: number;
    guards: number;
  };
};

export const requestGetDashboardSubscription = (
  companyId: string,
): Promise<DashboardSubscriptionResult> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/subscription?${params.toString()}`,
    { method: "GET" },
  ) as Promise<DashboardSubscriptionResult>;
};

export type WeeklyShiftsResultItem = {
  day: string;
  totalAssignments: number;
  onTimeCheckins: number;
  lateCheckins: number;
  absentGuards: number;
};

export const requestGetWeeklyShifts = (
  companyId: string,
): Promise<WeeklyShiftsResultItem[]> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/weekly-shifts?${params.toString()}`,
    { method: "GET" },
  ) as Promise<WeeklyShiftsResultItem[]>;
};

export type ShiftStatusResultItem = {
  status: string;
  count: number;
};

export const requestGetShiftStatusToday = (
  companyId: string,
): Promise<ShiftStatusResultItem[]> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/shift-status-today?${params.toString()}`,
    { method: "GET" },
  ) as Promise<ShiftStatusResultItem[]>;
};

export type TodayGuardListItem = {
  id: string;
  name: string;
  avatar: string | null;
  branch: string;
  contractCode: string | null;
  contractName: string | null;
  status: string;
  timeRange: string;
};

export const requestGetTodayGuards = (
  companyId: string,
): Promise<TodayGuardListItem[]> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/today-guards?${params.toString()}`,
    { method: "GET" },
  ) as Promise<TodayGuardListItem[]>;
};

export type RecentActivityItem = {
  id: string;
  type: "attendance" | "replacement" | "report" | "contract" | "system";
  subType: string;
  boldText?: string;
  normalText: string;
  timeLabel: string;
  metaLabel?: string;
  status?: string;
  timestamp: string;
};

export const requestGetRecentActivities = (
  companyId: string,
): Promise<RecentActivityItem[]> => {
  const params = new URLSearchParams({ companyId });
  return fetcher(
    `/api/dashboard/company/recent-activities?${params.toString()}`,
    { method: "GET" },
  ) as Promise<RecentActivityItem[]>;
};
