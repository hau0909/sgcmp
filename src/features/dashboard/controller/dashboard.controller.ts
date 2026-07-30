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
  getAdminUserByRoleService,
  getAdminPendingApprovalCompaniesService,
  getAdminPendingPublicationRequestsService,
  getAdminPendingPublicationListService,
  type PendingPublicationListItem,
  getAdminGrowthService,
  getAdminPlanDistributionService,
  getAdminPendingTasksService,
  getAdminRecentActivitiesService,
  getCoordinatorReportStatsService,
  getCurrentUpcomingShiftsTodayService,
  getPastShiftsService,
  getAvailableGuardsService,
  getGuardPerformanceRadarService,
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

export const handleGetAdminRevenue = async (filter: string = "month"): Promise<MetricWithTrend> => {
  return await getAdminRevenueService(filter);
};

export const handleGetAdminTotalCompanies = async (): Promise<MetricWithTrend> => {
  return await getAdminTotalCompaniesService();
};

export const handleGetAdminPublishedCompanies = async (): Promise<MetricWithTrend> => {
  return await getAdminPublishedCompaniesService();
};

export const handleGetAdminTotalUsers = async (filter: string = "month"): Promise<MetricWithTrend> => {
  return await getAdminTotalUsersService(filter);
};

export const handleGetAdminUserByRole = async (
  role: "company-admin" | "customer",
  filter: string = "month"
): Promise<MetricWithTrend> => {
  return await getAdminUserByRoleService(role, filter);
};

export const handleGetAdminPendingApprovalCompanies = async (filter: string = "month"): Promise<MetricWithTrend> => {
  return await getAdminPendingApprovalCompaniesService(filter);
};

export const handleGetAdminPendingPublicationRequests = async (filter: string = "month"): Promise<MetricWithTrend> => {
  return await getAdminPendingPublicationRequestsService(filter);
};

export const handleGetAdminGrowth = async (timeFilter: string = "month"): Promise<GrowthDataPoint[]> => {
  return await getAdminGrowthService(timeFilter);
};

export const handleGetAdminPlanDistribution = async (): Promise<PlanDistributionItem[]> => {
  return await getAdminPlanDistributionService();
};

export const handleGetAdminPendingTasks = async (locale: string = "vi"): Promise<PendingTaskItem[]> => {
  return await getAdminPendingTasksService(locale);
};

export const handleGetAdminRecentActivities = async (timeFilter: string = "month", locale: string = "vi"): Promise<ActivityItem[]> => {
  return await getAdminRecentActivitiesService(timeFilter, locale);
};

export const handleGetCoordinatorReportStats = async (
  companyId?: string,
  filter: string = "hientai"
) => {
  return await getCoordinatorReportStatsService(companyId, filter);
};

export const handleGetCurrentUpcomingShiftsToday = async (
  companyId?: string
) => {
  return await getCurrentUpcomingShiftsTodayService(companyId);
};

export const handleGetPastShifts = async (
  companyId?: string,
  filter: string = "hientai"
) => {
  return await getPastShiftsService(companyId, filter);
};

export const handleGetAvailableGuards = async (
  companyId?: string
) => {
  return await getAvailableGuardsService(companyId);
};

export const handleGetGuardPerformanceRadar = async (
  companyId?: string,
  filter: string = "hientai"
) => {
  return await getGuardPerformanceRadarService(companyId, filter);
};



export const handleGetAdminPendingPublicationList = async (): Promise<PendingPublicationListItem[]> => {
  return await getAdminPendingPublicationListService();
};


