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
  getAdminRevenueService,
  getAdminTotalCompaniesService,
  getAdminPublishedCompaniesService,
  getAdminTotalUsersService,
  getAdminPendingApprovalCompaniesService,
  getAdminPendingPublicationRequestsService,
  getAdminGrowthService,
  getAdminPlanDistributionService,
  getAdminPendingTasksService,
  getAdminRecentActivitiesService,
  type GrowthDataPoint,
  type PlanDistributionItem,
  type MetricWithTrend,
  type RatingWithTrend,
  type PendingTaskItem,
  type ActivityItem,
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

export const handleGetAdminRevenue = async (): Promise<MetricWithTrend> => {
  return await getAdminRevenueService();
};

export const handleGetAdminTotalCompanies = async (): Promise<MetricWithTrend> => {
  return await getAdminTotalCompaniesService();
};

export const handleGetAdminPublishedCompanies = async (): Promise<MetricWithTrend> => {
  return await getAdminPublishedCompaniesService();
};

export const handleGetAdminTotalUsers = async (): Promise<MetricWithTrend> => {
  return await getAdminTotalUsersService();
};

export const handleGetAdminPendingApprovalCompanies = async (): Promise<MetricWithTrend> => {
  return await getAdminPendingApprovalCompaniesService();
};

export const handleGetAdminPendingPublicationRequests = async (): Promise<MetricWithTrend> => {
  return await getAdminPendingPublicationRequestsService();
};

export const handleGetAdminGrowth = async (range: "6m" | "1y"): Promise<GrowthDataPoint[]> => {
  return await getAdminGrowthService(range);
};

export const handleGetAdminPlanDistribution = async (): Promise<PlanDistributionItem[]> => {
  return await getAdminPlanDistributionService();
};

export const handleGetAdminPendingTasks = async (): Promise<PendingTaskItem[]> => {
  return await getAdminPendingTasksService();
};

export const handleGetAdminRecentActivities = async (): Promise<ActivityItem[]> => {
  return await getAdminRecentActivitiesService();
};




