import { fetcher } from "@/lib/fetcher";

/** Kiểu trả về chung cho tất cả metric dashboard */
export type MetricWithTrend = {
  count: number;
  addedCount?: number;
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

export const requestGetAdminRevenue = (timeFilter: string = "month"): Promise<MetricWithTrend> => {
  return fetcher(
    `/api/dashboard/admin/revenue?timeFilter=${timeFilter}`,
    { method: "GET" }
  ) as Promise<MetricWithTrend>;
};

export const requestGetAdminTotalCompanies = (): Promise<MetricWithTrend> => {
  return fetcher(
    "/api/dashboard/admin/companies/total",
    { method: "GET" }
  ) as Promise<MetricWithTrend>;
};

export const requestGetAdminPublishedCompanies = (): Promise<MetricWithTrend> => {
  return fetcher(
    "/api/dashboard/admin/companies/published",
    { method: "GET" }
  ) as Promise<MetricWithTrend>;
};

export const requestGetAdminTotalUsers = (timeFilter: string = "month"): Promise<MetricWithTrend> => {
  return fetcher(
    `/api/dashboard/admin/user?timeFilter=${timeFilter}`,
    { method: "GET" }
  ) as Promise<MetricWithTrend>;
};

export const requestGetAdminUserByRole = (
  role: "company-admin" | "customer",
  timeFilter: string = "month"
): Promise<MetricWithTrend> => {
  return fetcher(
    `/api/dashboard/admin/user?role=${role}&timeFilter=${timeFilter}`,
    { method: "GET" }
  ) as Promise<MetricWithTrend>;
};

export const requestGetAdminPendingApprovalCompanies = (timeFilter: string = "month"): Promise<MetricWithTrend> => {
  return fetcher(
    `/api/dashboard/admin/companies/pending-approval?timeFilter=${timeFilter}`,
    { method: "GET" }
  ) as Promise<MetricWithTrend>;
};

export const requestGetAdminPendingPublicationRequests = (timeFilter: string = "month"): Promise<MetricWithTrend> => {
  return fetcher(
    `/api/dashboard/admin/companies/pending-publication?timeFilter=${timeFilter}`,
    { method: "GET" }
  ) as Promise<MetricWithTrend>;
};

export type PendingPublicationListItem = {
  request_id: string;
  company_name: string;
  requested_at: string;
  notes: string | null;
};

export const requestGetAdminPendingPublicationList = (): Promise<PendingPublicationListItem[]> => {
  return fetcher(
    "/api/dashboard/admin/companies/pending-publication-list",
    { method: "GET" }
  ) as Promise<PendingPublicationListItem[]>;
};

export interface GrowthDataPoint {
  name: string;
  revenue: number;
  companies: number;
  fill: string;
}

export const requestGetAdminGrowth = (timeFilter: string = "month"): Promise<GrowthDataPoint[]> => {
  return fetcher(
    `/api/dashboard/admin/growth?timeFilter=${timeFilter}`,
    { method: "GET" }
  ) as Promise<GrowthDataPoint[]>;
};

export interface PlanDistributionItem {
  name: string;
  count: number;
  value: number;
  color: string;
}

export const requestGetAdminPlanDistribution = (): Promise<PlanDistributionItem[]> => {
  return fetcher(
    "/api/dashboard/admin/plans/distribution",
    { method: "GET" }
  ) as Promise<PlanDistributionItem[]>;
};

export type PendingTaskItem = {
  id: string;
  stt: number;
  category: "register" | "urgent" | "compliance";
  categoryText: string;
  time: string;
  title: string;
  description: string;
  status: "pending_approval" | "pending_resolve" | "pending_renew";
  statusText: string;
};

export const requestGetAdminPendingTasks = (locale: string = "vi"): Promise<PendingTaskItem[]> => {
  return fetcher(
    `/api/dashboard/admin/pending-task?locale=${locale}`,
    { method: "GET" }
  ) as Promise<PendingTaskItem[]>;
};

export type ActivityItem = {
  id: string;
  time: string;
  timeAgo: string;
  action: string;
  target: string;
  status: "success" | "pending" | "done" | "failed";
  iconName: "Building2" | "FilePlus2" | "Globe" | "BadgeCheck" | "CircleX";
  iconColor: "blue" | "purple" | "green" | "red";
};

export const requestGetAdminRecentActivities = (
  timeFilter: string = "month",
  locale: string = "vi"
): Promise<ActivityItem[]> => {
  return fetcher(
    `/api/dashboard/admin/recent-activities?timeFilter=${timeFilter}&locale=${locale}`,
    { method: "GET" }
  ) as Promise<ActivityItem[]>;
};

export type CurrentUpcomingShiftItem = {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  type: "ONGOING" | "UPCOMING" | "LATE" | "REPLACEMENT" | "ABSENT" | "CHECKOUT";
  timeText: string;
  location: string;
  statusText: string;
  startTime?: string;
  isOvertime?: boolean;
  overtimeMinutes?: number;
  companyName?: string;
};

/**
 * Lấy số liệu báo cáo tổng số & chưa giải quyết cho Coordinator Dashboard.
 * GET /api/dashboard/coordinator?timeFilter=...
 */
export const requestGetCoordinatorReportStats = (
  companyId?: string,
  timeFilter: string = "hientai",
  clientDate?: string
): Promise<{ totalReports: number; unresolvedReports: number; currentUpcomingShifts: CurrentUpcomingShiftItem[]; filter: string }> => {
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);
  if (timeFilter) params.append("timeFilter", timeFilter);
  if (clientDate) params.append("clientDate", clientDate);

  return fetcher(
    `/api/dashboard/coordinator?${params.toString()}`,
    { method: "GET" }
  ) as Promise<{ totalReports: number; unresolvedReports: number; currentUpcomingShifts: CurrentUpcomingShiftItem[]; filter: string }>;
};

/**
 * Lấy danh sách ca trực Hiện tại & Sắp tới trong ngày cho Coordinator.
 * GET /api/dashboard/coordinator/current-upcoming-shifts?companyId=...
 */
export const requestGetCurrentUpcomingShiftsToday = (
  companyId?: string,
  timeFilter: string = "hientai",
  clientDate?: string
): Promise<CurrentUpcomingShiftItem[]> => {
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);
  if (timeFilter) params.append("timeFilter", timeFilter);
  if (clientDate) params.append("clientDate", clientDate);

  return fetcher(
    `/api/dashboard/coordinator/current-upcoming-shifts?${params.toString()}`,
    { method: "GET" }
  ) as Promise<CurrentUpcomingShiftItem[]>;
};

export type PastShiftItem = {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  time: string;
  location: string;
  contractName?: string;
  status: string;
  startTime?: string;
  isOvertime?: boolean;
  overtimeMinutes?: number;
  companyName?: string;
};

export type AvailableGuardItem = {
  id: string;
  user_id?: string;
  guard_id?: string;
  name: string;
  certs: string;
  phone: string;
  avatar: string;
  email?: string;
  cccd?: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  notable_skills?: string[];
};

export type GuardPerformanceRadarItem = {
  subject: string;
  score: number;
  count: string;
  badgeBg: string;
};

/**
 * Lấy danh sách ca trực đã qua / hiện tại cho Coordinator.
 * GET /api/dashboard/coordinator/past-shifts?companyId=...&timeFilter=...
 */
export const requestGetPastShifts = (
  companyId?: string,
  timeFilter: string = "hientai",
  clientDate?: string
): Promise<PastShiftItem[]> => {
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);
  if (timeFilter) params.append("timeFilter", timeFilter);
  if (clientDate) params.append("clientDate", clientDate);

  return fetcher(
    `/api/dashboard/coordinator/past-shifts?${params.toString()}`,
    { method: "GET" }
  ) as Promise<PastShiftItem[]>;
};

/**
 * Lấy danh sách bảo vệ đang rảnh cho Coordinator.
 * GET /api/dashboard/coordinator/available-guards?companyId=...
 */
export const requestGetAvailableGuards = (
  companyId?: string,
  clientDate?: string
): Promise<AvailableGuardItem[]> => {
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);
  if (clientDate) params.append("clientDate", clientDate);

  return fetcher(
    `/api/dashboard/coordinator/available-guards?${params.toString()}`,
    { method: "GET" }
  ) as Promise<AvailableGuardItem[]>;
};

/**
 * Lấy dữ liệu biểu đồ Radar Hiệu suất Bảo vệ cho Coordinator.
 * GET /api/dashboard/coordinator/performance?companyId=...&timeFilter=...
 */
export const requestGetGuardPerformanceRadar = (
  companyId?: string,
  timeFilter: string = "hientai",
  clientDate?: string
): Promise<GuardPerformanceRadarItem[]> => {
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);
  if (timeFilter) params.append("timeFilter", timeFilter);
  if (clientDate) params.append("clientDate", clientDate);

  return fetcher(
    `/api/dashboard/coordinator/performance?${params.toString()}`,
    { method: "GET" }
  ) as Promise<GuardPerformanceRadarItem[]>;
};










