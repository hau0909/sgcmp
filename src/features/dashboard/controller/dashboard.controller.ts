import {
  getActiveGuardsOnShiftService,
  getActiveContractsService,
  getPendingReportsService,
  getRatingService,
  getDashboardSubscriptionService,
  getWeeklyShiftsService,
  getShiftStatusTodayService,
  getTodayGuardsStatusListService,
  getRecentActivitiesService,
  type MetricWithTrend,
  type RatingWithTrend,
} from "../service/dashboard.service";

export const handleGetActiveGuardsOnShift = async (
  companyId: string,
): Promise<MetricWithTrend> => {
  return await getActiveGuardsOnShiftService(companyId);
};

export const handleGetActiveContracts = async (
  companyId: string,
): Promise<MetricWithTrend> => {
  return await getActiveContractsService(companyId);
};

export const handleGetPendingReports = async (
  companyId: string,
): Promise<MetricWithTrend> => {
  return await getPendingReportsService(companyId);
};

export const handleGetRating = async (
  companyId: string,
): Promise<RatingWithTrend> => {
  return await getRatingService(companyId);
};

export const handleGetDashboardSubscription = async (
  companyId: string,
) => {
  return await getDashboardSubscriptionService(companyId);
};

export const handleGetWeeklyShifts = async (
  companyId: string,
) => {
  return await getWeeklyShiftsService(companyId);
};

export const handleGetShiftStatusToday = async (
  companyId: string,
) => {
  return await getShiftStatusTodayService(companyId);
};

export const handleGetTodayGuardsStatusList = async (
  companyId: string,
) => {
  return await getTodayGuardsStatusListService(companyId);
};

export const handleGetRecentActivities = async (
  companyId: string,
) => {
  return await getRecentActivitiesService(companyId);
};
