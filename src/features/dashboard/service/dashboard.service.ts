import {
  countActiveGuardsOnShift,
  countActiveGuardsOnShiftYesterday,
  countActiveContracts,
  countActiveContractsLastMonth,
  countPendingReports,
  countPendingReportsInRange,
  getCompanyRatingAverage,
  getCompanyRatingAverageLastMonth,
  getWeeklyShiftsData,
  getShiftStatusTodayData,
  getTodayGuardsStatusList,
  getProfilesByIds,
  getRecentShiftsAndAssignments,
  getRecentReports,
  getRecentContracts,
  getRecentBookings,
  getRecentCoordinators,
  getCompletedPayments,
  countTotalCompaniesByStatus,
  countTotalCompaniesByStatusLastMonth,
  countTotalUsersByRoleAndStatus,
  countTotalUsersByRoleAndStatusLastMonth,
  countCompanyPublishRequestsByStatus,
  countCompanyPublishRequestsByStatusLastMonth,
  getApprovedCompaniesBaselineCount,
  getApprovedCompaniesAfter,
  getCompletedPaymentsAfter,
  getPlanDistribution,
  getPendingRegistrations,
  getPendingPublishRequests,
  getFirstAdminName,
  getRecentRegistrationsForActivities,
  getRecentPublishRequestsForActivities,
} from "../repository/dashboard.repository";
import { getRelativeTimeString } from "../utils/dashboard.utils";
import { getCurrentActivePlan } from "@/features/subscription/repository/subscription.repository";
import { getGuardCountByCompanyId } from "@/features/guards/repository/guard.repository";
import { getCoordinatorCountByCompanyId } from "@/features/coordinator/repository/coordinator.repository";

// ─────────────────────────────────────────────────────────────
// Shared helper
// ─────────────────────────────────────────────────────────────

export type MetricWithTrend = {
  count: number;
  percentChange: number | null;
  trend: "up" | "down" | "neutral";
};

/** Tính % thay đổi và chiều hướng từ hai số nguyên */
function calcTrend(current: number, prev: number): MetricWithTrend {
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

/** Khoảng tháng trước theo UTC */
function prevMonthRange(now: Date): { start: string; end: string } {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  return { start: start.toISOString(), end: end.toISOString() };
}

// ─────────────────────────────────────────────────────────────
// Services
// ─────────────────────────────────────────────────────────────

/** Tổng số bảo vệ đang trực hiện tại + % so với cùng giờ hôm qua */
export const getActiveGuardsOnShiftService = async (
  companyId: string,
): Promise<MetricWithTrend> => {
  const now = new Date();
  // yesterday = cùng thời điểm nhưng lùi 24 tiếng
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [current, prev] = await Promise.all([
    countActiveGuardsOnShift(companyId, now.toISOString()),
    countActiveGuardsOnShiftYesterday(companyId, yesterday.toISOString()),
  ]);

  return calcTrend(current, prev);
};

/** Tổng số hợp đồng đang hoạt động + % so với tháng trước */
export const getActiveContractsService = async (
  companyId: string,
): Promise<MetricWithTrend> => {
  const now = new Date();
  // currentMonthStart = ngày đầu tiên của tháng hiện tại
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();

  const [current, prev] = await Promise.all([
    countActiveContracts(companyId),
    countActiveContractsLastMonth(companyId, currentMonthStart),
  ]);

  return calcTrend(current, prev);
};

/** Tổng số báo cáo sự cố chờ xử lý + % so với tháng trước */
export const getPendingReportsService = async (
  companyId: string,
): Promise<MetricWithTrend> => {
  const now = new Date();
  const { start, end } = prevMonthRange(now);

  const [current, prev] = await Promise.all([
    countPendingReports(companyId),
    countPendingReportsInRange(companyId, start, end),
  ]);

  return calcTrend(current, prev);
};

export type RatingWithTrend = {
  /** Điểm hiện tại (từ companies.rating_average) */
  averageRating: number | null;
  /** % thay đổi so với điểm trung bình các review trước tháng này */
  percentChange: number | null;
  trend: "up" | "down" | "neutral";
};

/** Điểm đánh giá trung bình + % thay đổi so với điểm tháng trước */
export const getRatingService = async (
  companyId: string,
): Promise<RatingWithTrend> => {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();

  const [current, prev] = await Promise.all([
    getCompanyRatingAverage(companyId),
    getCompanyRatingAverageLastMonth(companyId, currentMonthStart),
  ]);

  let percentChange: number | null = null;
  let trend: "up" | "down" | "neutral" = "neutral";

  if (current != null && prev != null && prev > 0) {
    percentChange = Math.round(((current - prev) / prev) * 100 * 10) / 10; // 1 decimal
    if (percentChange > 0) trend = "up";
    else if (percentChange < 0) trend = "down";
  }

  return { averageRating: current, percentChange, trend };
};

export const getDashboardSubscriptionService = async (
  companyId: string,
) => {
  const [currentPlan, coordinatorsCount, guardsCount] = await Promise.all([
    getCurrentActivePlan(companyId),
    getCoordinatorCountByCompanyId(companyId),
    getGuardCountByCompanyId(companyId),
  ]);

  return {
    plan: currentPlan?.plan || null,
    subscription: currentPlan?.subscription || null,
    usage: {
      coordinators: coordinatorsCount,
      guards: guardsCount,
    },
  };
};

export const getWeeklyShiftsService = async (companyId: string) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
  
  const sixDaysLater = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
  const endOfSixDaysLater = new Date(sixDaysLater.getFullYear(), sixDaysLater.getMonth(), sixDaysLater.getDate(), 23, 59, 59, 999).toISOString();

  const shifts = await getWeeklyShiftsData(companyId, startOfToday, endOfSixDaysLater);

  // Initialize today + 6 future days list
  const daysList = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(d);

    // Day label: CN, T2, etc.
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      weekday: "short"
    }).format(d);
    const map: Record<string, string> = {
      "Mon": "T2",
      "Tue": "T3",
      "Wed": "T4",
      "Thu": "T5",
      "Fri": "T6",
      "Sat": "T7",
      "Sun": "CN"
    };
    const dayLabel = map[dayOfWeek] || dayOfWeek;

    daysList.push({
      day: dayLabel,
      dateStr,
      totalAssignments: 0,
      onTimeCheckins: 0,
      lateCheckins: 0,
      absentGuards: 0
    });
  }

  for (const shift of shifts) {
    const shiftDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date(shift.start_time));

    const dayItem = daysList.find(item => item.dateStr === shiftDateStr);
    if (!dayItem) continue;

    (shift.shift_assignments || []).forEach((sa: any) => {
      const hasRep = sa.replacement_guard_ids && sa.replacement_guard_ids.length > 0;

      // Original guard
      const origStatus = hasRep ? "absent" : sa.status;
      dayItem.totalAssignments++;
      
      if (origStatus === "completed") {
        dayItem.onTimeCheckins++;
      } else if (origStatus === "late") {
        dayItem.lateCheckins++;
      } else if (origStatus === "absent") {
        dayItem.absentGuards++;
      }

      // Replacement guards
      if (hasRep) {
        sa.replacement_guard_ids.forEach(() => {
          dayItem.totalAssignments++;
          
          if (sa.status === "completed") {
            dayItem.onTimeCheckins++;
          } else if (sa.status === "late") {
            dayItem.lateCheckins++;
          } else if (sa.status === "absent") {
            dayItem.absentGuards++;
          }
        });
      }
    });
  }

  return daysList.map(({ day, totalAssignments, onTimeCheckins, lateCheckins, absentGuards }) => ({
    day,
    totalAssignments,
    onTimeCheckins,
    lateCheckins,
    absentGuards
  }));
};

export const getShiftStatusTodayService = async (companyId: string) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

  const shifts = await getShiftStatusTodayData(companyId, startOfToday, endOfToday);

  let onDuty = 0; // Đang trực
  let absent = 0; // Vắng mặt
  let late = 0; // Đi trễ
  let replacement = 0; // Thay ca
  let lateCheckin = 0; // Điểm danh trễ

  const now = new Date();

  for (const shift of shifts) {
    const shiftStart = new Date(shift.start_time);
    const shiftEnd = new Date(shift.end_time);
    const isShiftActive = now >= shiftStart && now <= shiftEnd;

    for (const sa of shift.shift_assignments || []) {
      const hasRep = sa.replacement_guard_ids && sa.replacement_guard_ids.length > 0;

      // Original guard status
      const origStatus = hasRep ? "absent" : sa.status;
      const origCheckIn = hasRep ? null : sa.check_in_time;

      if (origStatus === "completed") {
        if (isShiftActive) {
          onDuty++;
        }
      } else if (origStatus === "late") {
        if (origCheckIn !== null) {
          lateCheckin++;
        } else {
          late++;
        }
      } else if (origStatus === "absent") {
        absent++;
      }

      // Replacement guards (Thay ca)
      if (hasRep) {
        replacement += sa.replacement_guard_ids.length;
      }
    }
  }

  return [
    { status: "Hoàn thành", count: onDuty },
    { status: "Vắng mặt", count: absent },
    { status: "Đi trễ", count: late },
    { status: "Thay ca", count: replacement },
    { status: "Điểm danh trễ", count: lateCheckin },
  ];
};

export const getTodayGuardsStatusListService = async (companyId: string) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

  const shifts = await getTodayGuardsStatusList(companyId, startOfToday, endOfToday);

  // Collect all guard IDs
  const guardIds = new Set<string>();
  for (const s of shifts) {
    for (const sa of s.shift_assignments || []) {
      guardIds.add(sa.guard_id);
      if (sa.replacement_guard_ids) {
        sa.replacement_guard_ids.forEach((id: string) => guardIds.add(id));
      }
    }
  }

  // Fetch profiles
  let profiles: any[] = [];
  if (guardIds.size > 0) {
    profiles = await getProfilesByIds(Array.from(guardIds));
  }

  const getProfile = (id: string) => {
    return profiles.find(p => p.user_id === id) || { full_name: "Chưa rõ", avatar_url: null };
  };

  const list: any[] = [];
  const now = new Date();

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  for (const shift of shifts) {
    const shiftStart = new Date(shift.start_time);
    const shiftEnd = new Date(shift.end_time);
    const isShiftActive = now >= shiftStart && now <= shiftEnd;

    for (const sa of shift.shift_assignments || []) {
      const hasRep = sa.replacement_guard_ids && sa.replacement_guard_ids.length > 0;

      // 1. Original guard
      const origProfile = getProfile(sa.guard_id);
      const origStatus = hasRep ? "absent" : sa.status;
      const origCheckIn = hasRep ? null : sa.check_in_time;
      
      // Determine original guard status label
      let origLabel = "Phân công";
      if (origStatus === "completed") {
        origLabel = "Hoàn thành";
      } else if (origStatus === "late") {
        origLabel = origCheckIn ? "Điểm danh trễ" : "Đi trễ";
      } else if (origStatus === "absent") {
        origLabel = "Vắng mặt";
      } else if (origStatus === "assigned") {
        origLabel = now >= shiftStart ? "Vắng mặt" : "Phân công";
      }

      list.push({
        id: `GV-${sa.guard_id.slice(0, 4).toUpperCase()}`,
        name: origProfile.full_name,
        avatar: origProfile.avatar_url,
        branch: shift.shift_name,
        contractCode: `HD-${(shift.contracts as any).contract_id.slice(0, 8).toUpperCase()}`,
        contractName: (shift.contracts as any).bookings?.services?.name || "Dịch vụ bảo vệ",
        status: origLabel,
        timeRange: origCheckIn 
          ? `Check-in lúc ${formatTime(origCheckIn)}` 
          : formatTime(shift.start_time)
      });

      // 2. Replacement guards
      if (hasRep) {
        sa.replacement_guard_ids.forEach((repGuardId: string) => {
          const repProfile = getProfile(repGuardId);
          list.push({
            id: `GV-${repGuardId.slice(0, 4).toUpperCase()}`,
            name: repProfile.full_name,
            avatar: repProfile.avatar_url,
            branch: `${shift.shift_name} (Thay thế)`,
            contractCode: `HD-${(shift.contracts as any).contract_id.slice(0, 8).toUpperCase()}`,
            contractName: (shift.contracts as any).bookings?.services?.name || "Dịch vụ bảo vệ",
            status: "Thay ca",
            timeRange: formatTime(shift.start_time)
          });
        });
      }
    }
  }

  return list;
};

export interface RecentActivityItem {
  id: string;
  type: "attendance" | "replacement" | "report" | "contract" | "system";
  subType: string;
  boldText?: string;
  normalText: string;
  timeLabel: string;
  metaLabel?: string;
  status?: string;
  timestamp: string;
}

export const getRecentActivitiesService = async (companyId: string): Promise<RecentActivityItem[]> => {
  const activities: RecentActivityItem[] = [];
  const today = new Date();

  // 1. Attendance & Replacements
  const shifts = await getRecentShiftsAndAssignments(companyId);
  
  const guardIds = new Set<string>();
  for (const s of shifts) {
    for (const sa of s.shift_assignments || []) {
      guardIds.add(sa.guard_id);
      if (sa.replacement_guard_ids) {
        sa.replacement_guard_ids.forEach((id: string) => guardIds.add(id));
      }
    }
  }

  let profiles: any[] = [];
  if (guardIds.size > 0) {
    profiles = await getProfilesByIds(Array.from(guardIds));
  }

  const getProfileName = (id: string) => {
    return profiles.find(p => p.user_id === id)?.full_name || "Bảo vệ";
  };

  const formatFriendlyTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const isYesterday = date.toDateString() === yesterdayDate.toDateString();
    
    const pad = (num: number) => num.toString().padStart(2, "0");
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const time = `${hours}:${minutes}`;

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const fullDate = `${day}/${month}/${year}`;

    if (isToday) {
      return `Hôm nay, ${fullDate}, ${time}`;
    } else if (isYesterday) {
      return `Hôm qua, ${fullDate}, ${time}`;
    } else {
      return `${fullDate}, ${time}`;
    }
  };

  for (const shift of shifts) {
    const shiftName = shift.shift_name;
    const contractCode = `HD-${(shift.contracts as any).contract_id.slice(0, 8).toUpperCase()}`;

    for (const sa of shift.shift_assignments || []) {
      const hasRep = sa.replacement_guard_ids && sa.replacement_guard_ids.length > 0;
      const guardName = getProfileName(sa.guard_id);

      // Attendance
      if (sa.status === "completed") {
        activities.push({
          id: `act-att-${sa.guard_id}-${shift.shift_id}-on-time`,
          type: "attendance",
          subType: "attendance_on_time",
          boldText: guardName,
          normalText: " đã điểm danh ca trực đúng giờ.",
          timestamp: sa.check_in_time || sa.updated_at || shift.start_time,
          timeLabel: formatFriendlyTime(sa.check_in_time || sa.updated_at || shift.start_time),
          metaLabel: shiftName
        });
      } else if (sa.status === "late") {
        if (sa.check_in_time) {
          const minutesLate = Math.max(0, Math.round((new Date(sa.check_in_time).getTime() - new Date(shift.start_time).getTime()) / 60000));
          activities.push({
            id: `act-att-${sa.guard_id}-${shift.shift_id}-late`,
            type: "attendance",
            subType: "attendance_late",
            boldText: guardName,
            normalText: ` đã điểm danh trễ ${minutesLate} phút.`,
            timestamp: sa.check_in_time,
            timeLabel: formatFriendlyTime(sa.check_in_time),
            metaLabel: shiftName
          });
        } else {
          activities.push({
            id: `act-att-${sa.guard_id}-${shift.shift_id}-not-checked-in`,
            type: "attendance",
            subType: "attendance_no_checkin",
            boldText: guardName,
            normalText: " chưa điểm danh và đã trễ ca trực.",
            timestamp: shift.start_time,
            timeLabel: formatFriendlyTime(shift.start_time),
            metaLabel: shiftName
          });
        }
      } else if (sa.status === "absent" || (sa.status === "assigned" && new Date() >= new Date(shift.start_time))) {
        activities.push({
          id: `act-att-${sa.guard_id}-${shift.shift_id}-absent`,
          type: "attendance",
          subType: "attendance_absent",
          boldText: guardName,
          normalText: " bị đánh dấu vắng mặt.",
          timestamp: shift.start_time,
          timeLabel: formatFriendlyTime(shift.start_time),
          metaLabel: shiftName
        });
      }

      // Replacement
      if (hasRep) {
        sa.replacement_guard_ids.forEach((repId: string, rIdx: number) => {
          const repName = getProfileName(repId);
          activities.push({
            id: `act-rep-${sa.guard_id}-${repId}-${shift.shift_id}-${rIdx}`,
            type: "replacement",
            subType: "replacement_dispatched",
            boldText: "Điều phối viên",
            normalText: ` đã điều động ${repName} thay cho ${guardName}.`,
            timestamp: sa.updated_at || shift.start_time,
            timeLabel: formatFriendlyTime(sa.updated_at || shift.start_time),
            metaLabel: `${shiftName} — ${contractCode}`
          });
        });
      }
    }
  }

  // 2. Reports
  const reports = await getRecentReports(companyId, 1000);
  const reportTypeLabels: Record<string, string> = {
    LATE: "Đi muộn",
    ABSENT: "Vắng mặt",
    BAD_ATTITUDE: "Thái độ không tốt",
    SLEEPING: "Ngủ gật",
    OTHER: "Khác"
  };

  for (const report of reports) {
    const reportType = reportTypeLabels[report.type] || "sự cố";
    const code = `HD-${report.contract_id.slice(0, 8).toUpperCase()}`;

    if (report.status === "PENDING") {
      activities.push({
        id: `act-rep-p-${report.id}`,
        type: "report",
        subType: "report_pending",
        boldText: "Khách hàng",
        normalText: ` đã gửi báo cáo bảo vệ ${reportType.toLowerCase()}.`,
        timestamp: report.created_at,
        timeLabel: formatFriendlyTime(report.created_at),
        metaLabel: `Hợp đồng ${code}`,
        status: "PENDING"
      });
    } else if (report.status === "IN_PROGRESS") {
      activities.push({
        id: `act-rep-i-${report.id}`,
        type: "report",
        subType: "report_in_progress",
        boldText: `Báo cáo bảo vệ ${reportType.toLowerCase()}`,
        normalText: " đã được chuyển sang đang xử lý.",
        timestamp: report.created_at,
        timeLabel: formatFriendlyTime(report.created_at),
        metaLabel: `Hợp đồng ${code}`
      });
    } else if (report.status === "RESOLVED") {
      activities.push({
        id: `act-rep-r-${report.id}`,
        type: "report",
        subType: "report_resolved",
        boldText: `Báo cáo bảo vệ ${reportType.toLowerCase()}`,
        normalText: " đã được giải quyết.",
        timestamp: report.created_at,
        timeLabel: formatFriendlyTime(report.created_at),
        metaLabel: `Hợp đồng ${code}`
      });
    } else if (report.status === "CLOSED") {
      activities.push({
        id: `act-rep-c-${report.id}`,
        type: "report",
        subType: "report_closed",
        boldText: `Báo cáo bảo vệ ${reportType.toLowerCase()}`,
        normalText: " đã được đóng.",
        timestamp: report.created_at,
        timeLabel: formatFriendlyTime(report.created_at),
        metaLabel: `Hợp đồng ${code}`
      });
    }
  }

  // 3. Contracts
  const contracts = await getRecentContracts(companyId, 1000);
  for (const contract of contracts) {
    const code = `HD-${contract.contract_id.slice(0, 8).toUpperCase()}`;

    if (contract.status === "active") {
      activities.push({
        id: `act-ctr-a-${contract.contract_id}`,
        type: "contract",
        subType: "contract_active",
        boldText: `Hợp đồng ${code}`,
        normalText: " đã chuyển sang hoạt động.",
        timestamp: contract.start_date || contract.updated_at,
        timeLabel: formatFriendlyTime(contract.start_date || contract.updated_at),
        metaLabel: "Hệ thống"
      });
    }

    if (contract.end_date) {
      const daysRemaining = Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysRemaining > 0 && daysRemaining <= 7) {
        activities.push({
          id: `act-ctr-e-${contract.contract_id}`,
          type: "contract",
          subType: "contract_expiry_warning",
          boldText: `Hợp đồng ${code}`,
          normalText: ` sẽ hết hạn sau ${daysRemaining} ngày.`,
          timestamp: today.toISOString(),
          timeLabel: formatFriendlyTime(today.toISOString()),
          metaLabel: "Cảnh báo"
        });
      }
    }
  }

  // 4. Bookings
  const bookings = await getRecentBookings(companyId, 1000);
  for (const booking of bookings) {
    activities.push({
      id: `act-bkg-p-${booking.booking_id}`,
      type: "contract",
      subType: "contract_booking_pending",
      boldText: "Công ty",
      normalText: " nhận được một yêu cầu dịch vụ mới.",
      timestamp: booking.created_at,
      timeLabel: formatFriendlyTime(booking.created_at),
      metaLabel: "Yêu cầu mới"
    });
  }

  // 5. Activated coordinators
  const activatedCoordinators = await getRecentCoordinators(1000);
  for (const coord of activatedCoordinators) {
    activities.push({
      id: `act-sys-coord-${coord.user_id}`,
      type: "system",
      subType: "system_coordinator_active",
      boldText: `Điều phối viên ${coord.full_name}`,
      normalText: " đã được kích hoạt tài khoản.",
      timestamp: coord.created_at,
      timeLabel: formatFriendlyTime(coord.created_at),
      metaLabel: "Hệ thống"
    });
  }

  // Sort activities by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities;
};

export const getAdminRevenueService = async (): Promise<MetricWithTrend> => {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const payments = await getCompletedPayments();

  // Current month revenue
  const current = payments
    .filter((p) => p.created_at >= currentMonthStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Revenue before current month (this month's start)
  const prev = payments
    .filter((p) => p.created_at < currentMonthStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return calcTrend(current, prev);
};

export const getAdminTotalCompaniesService = async (): Promise<MetricWithTrend> => {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const statuses = ["active", "pending_publish", "published"];

  const [current, prev] = await Promise.all([
    countTotalCompaniesByStatus(statuses),
    countTotalCompaniesByStatusLastMonth(statuses, currentMonthStart),
  ]);

  return calcTrend(current, prev);
};

export const getAdminPublishedCompaniesService = async (): Promise<MetricWithTrend> => {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const statuses = ["published"];

  const [current, prev] = await Promise.all([
    countTotalCompaniesByStatus(statuses),
    countTotalCompaniesByStatusLastMonth(statuses, currentMonthStart),
  ]);

  return calcTrend(current, prev);
};

export const getAdminTotalUsersService = async (): Promise<MetricWithTrend> => {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const roles = ["customer", "company-admin"];
  const status = "active";

  const [current, prev] = await Promise.all([
    countTotalUsersByRoleAndStatus(roles, status),
    countTotalUsersByRoleAndStatusLastMonth(roles, status, currentMonthStart),
  ]);

  return calcTrend(current, prev);
};

export const getAdminPendingApprovalCompaniesService = async (): Promise<MetricWithTrend> => {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const statuses = ["pending_register"];

  const [current, prev] = await Promise.all([
    countTotalCompaniesByStatus(statuses),
    countTotalCompaniesByStatusLastMonth(statuses, currentMonthStart),
  ]);

  return calcTrend(current, prev);
};

export const getAdminPendingPublicationRequestsService = async (): Promise<MetricWithTrend> => {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const status = "PENDING";

  const [current, prev] = await Promise.all([
    countCompanyPublishRequestsByStatus(status),
    countCompanyPublishRequestsByStatusLastMonth(status, currentMonthStart),
  ]);

  return calcTrend(current, prev);
};

export interface GrowthDataPoint {
  name: string;
  revenue: number;
  companies: number;
  fill: string;
}

export const getAdminGrowthService = async (range: "6m" | "1y"): Promise<GrowthDataPoint[]> => {
  const N = range === "1y" ? 12 : 6;
  const now = new Date();
  const months: { year: number; month: number; label: string; start: Date; end: Date }[] = [];

  for (let i = N - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();

    const label = N <= 6
      ? `THÁNG ${month + 1}`
      : `T${month + 1}/${String(year).slice(-2)}`;

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 1));

    months.push({ year, month, label, start, end });
  }

  const startDate = months[0].start.toISOString();

  const [baseline, approvedCompanies, payments] = await Promise.all([
    getApprovedCompaniesBaselineCount(startDate),
    getApprovedCompaniesAfter(startDate),
    getCompletedPaymentsAfter(startDate),
  ]);

  return months.map((m, idx) => {
    const monthRevenue = payments
      .filter(p => {
        const date = new Date(p.created_at);
        return date >= m.start && date < m.end;
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const monthCompaniesCount = baseline + approvedCompanies.filter(c => {
      const date = new Date(c.updated_at);
      return date < m.end;
    }).length;

    // Use requested colors: #8ec5ff for regular months, #4ba3ff for highlighted current month
    const isLastMonth = idx === months.length - 1;
    const fill = isLastMonth ? "#4ba3ff" : "#8ec5ff";

    return {
      name: m.label,
      revenue: monthRevenue,
      companies: monthCompaniesCount,
      fill,
    };
  });
};

export interface PlanDistributionItem {
  name: string;
  count: number;
  value: number;
  color: string;
}

export const getAdminPlanDistributionService = async (): Promise<PlanDistributionItem[]> => {
  const rawData = await getPlanDistribution();
  const total = rawData.reduce((sum, item) => sum + item.count, 0);

  const items = rawData.map((item) => {
    const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;

    let color = "#94a3b8"; // Default color
    const planLower = item.planName.toLowerCase();
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

  // Sort by percentage descending
  return items.sort((a, b) => b.value - a.value);
};

export interface PendingTaskItem {
  id: string;
  stt: number;
  category: "register" | "urgent" | "compliance";
  categoryText: string;
  time: string;
  title: string;
  description: string;
  status: "pending_approval" | "pending_resolve" | "pending_renew";
  statusText: string;
}

export const getAdminPendingTasksService = async (): Promise<PendingTaskItem[]> => {
  const [registrations, publishRequests] = await Promise.all([
    getPendingRegistrations(),
    getPendingPublishRequests(),
  ]);

  const tasks: { date: Date; item: PendingTaskItem }[] = [];

  // Map registrations (Doanh nghiệp đợi phê duyệt)
  registrations.forEach((reg) => {
    const companyName = reg.companies?.company_name || "Doanh nghiệp không tên";
    tasks.push({
      date: new Date(reg.created_at),
      item: {
        id: `reg-${reg.registration_id}`,
        stt: 0,
        category: "register",
        categoryText: "ĐĂNG KÝ MỚI",
        time: getRelativeTimeString(reg.created_at),
        title: companyName,
        description: reg.companies?.description || "Hồ sơ đăng ký doanh nghiệp cần xét duyệt điều khoản.",
        status: "pending_approval",
        statusText: "Chờ duyệt",
      },
    });
  });

  // Map company_publish_requests (Yêu cầu công khai doanh nghiệp)
  publishRequests.forEach((req) => {
    const companyName = req.companies?.company_name || "Doanh nghiệp không tên";
    tasks.push({
      date: new Date(req.requested_at),
      item: {
        id: `pub-${req.request_id}`,
        stt: 0,
        category: "compliance",
        categoryText: "CÔNG KHAI",
        time: getRelativeTimeString(req.requested_at),
        title: companyName,
        description: req.notes || "Yêu cầu kích hoạt chế độ công khai cho doanh nghiệp.",
        status: "pending_approval",
        statusText: "Chờ duyệt",
      },
    });
  });

  // Sort by date descending
  tasks.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Assign STT
  return tasks.map((t, index) => ({
    ...t.item,
    stt: index + 1,
  }));
};

export interface ActivityItem {
  id: string;
  time: string;
  timeAgo: string;
  action: string;
  target: string;
  status: "success" | "pending" | "done" | "failed";
  iconName: "Building2" | "FilePlus2" | "Globe" | "BadgeCheck" | "CircleX";
  iconColor: "blue" | "purple" | "green" | "red";
}

export const getAdminRecentActivitiesService = async (): Promise<ActivityItem[]> => {
  const [registrations, publishRequests, defaultAdminName] = await Promise.all([
    getRecentRegistrationsForActivities(),
    getRecentPublishRequestsForActivities(),
    getFirstAdminName(),
  ]);

  // Collect user IDs for profiles lookup
  const userIds = Array.from(
    new Set(
      publishRequests
        .map((r) => r.approved_by)
        .filter((id): id is string => !!id)
    )
  );

  const profilesMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const profiles = await getProfilesByIds(userIds);
    profiles.forEach((p) => {
      profilesMap[p.user_id] = p.full_name || "Admin";
    });
  }

  const activities: { date: Date; item: ActivityItem }[] = [];

  // Helper formats
  const pad = (num: number) => String(num).padStart(2, "0");
  
  const formatTimeOnly = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const formatDateTimeLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (d.getTime() >= today.getTime()) {
      return `Hôm nay, ${timeStr}`;
    } else if (d.getTime() >= yesterday.getTime()) {
      return `Hôm qua, ${timeStr}`;
    } else {
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${timeStr}`;
    }
  };

  // Process registrations
  registrations.forEach((reg) => {
    const companyName = reg.companies?.company_name || "Doanh nghiệp";

    if (reg.status === "pending") {
      const created = new Date(reg.created_at);
      const updated = new Date(reg.updated_at);
      const isUpdated = updated.getTime() - created.getTime() > 10000; // > 10s difference

      if (isUpdated) {
        // SafeGuard updated registration
        activities.push({
          date: updated,
          item: {
            id: `reg-pending-upd-${reg.registration_id}`,
            time: formatTimeOnly(reg.updated_at),
            timeAgo: `${getRelativeTime(reg.updated_at)} • Đã gửi lại để xét duyệt`,
            action: "Đăng ký doanh nghiệp",
            target: `Công ty ${companyName} đã cập nhật lại hồ sơ đăng ký.`,
            status: "pending",
            iconName: "FilePlus2",
            iconColor: "blue",
          },
        });
      } else {
        // An Tam Security sent registration
        activities.push({
          date: created,
          item: {
            id: `reg-pending-new-${reg.registration_id}`,
            time: formatTimeOnly(reg.created_at),
            timeAgo: `${getRelativeTime(reg.created_at)} • Chờ phê duyệt`,
            action: "Đăng ký doanh nghiệp",
            target: `Công ty ${companyName} đã gửi hồ sơ đăng ký.`,
            status: "pending",
            iconName: "Building2",
            iconColor: "blue",
          },
        });
      }
    } else if (reg.status === "approved") {
      // ABC Security approved registration
      activities.push({
        date: new Date(reg.updated_at),
        item: {
          id: `reg-approved-${reg.registration_id}`,
          time: formatTimeOnly(reg.updated_at),
          timeAgo: `${formatDateTimeLabel(reg.updated_at)} • Thực hiện bởi Admin ${defaultAdminName}`,
          action: "Kết quả phê duyệt",
          target: `Công ty ${companyName} đã được phê duyệt đăng ký.`,
          status: "success",
          iconName: "BadgeCheck",
          iconColor: "green",
        },
      });
    } else if (reg.status === "rejected") {
      // Secure Pro rejected registration
      activities.push({
        date: new Date(reg.updated_at),
        item: {
          id: `reg-rejected-${reg.registration_id}`,
          time: formatTimeOnly(reg.updated_at),
          timeAgo: `${formatDateTimeLabel(reg.updated_at)} • Giấy phép kinh doanh không hợp lệ`,
          action: "Kết quả phê duyệt",
          target: `Hồ sơ Công ty ${companyName} đã bị từ chối.`,
          status: "failed",
          iconName: "CircleX",
          iconColor: "red",
        },
      });
    }
  });

  // Process publish requests
  publishRequests.forEach((req) => {
    const companyName = req.companies?.company_name || "Doanh nghiệp";

    if (req.status === "PENDING") {
      // Secure One sent publish request
      activities.push({
        date: new Date(req.requested_at),
        item: {
          id: `pub-pending-${req.request_id}`,
          time: formatTimeOnly(req.requested_at),
          timeAgo: `${getRelativeTime(req.requested_at)} • Chờ xét duyệt`,
          action: "Yêu cầu công khai doanh nghiệp",
          target: `Công ty ${companyName} đã gửi yêu cầu công khai.`,
          status: "pending",
          iconName: "Globe",
          iconColor: "purple",
        },
      });
    } else if (req.status === "APPROVED") {
      // An Phat published on platform
      const processedTime = req.processed_at || req.requested_at;
      const adminName = req.approved_by ? (profilesMap[req.approved_by] || defaultAdminName) : defaultAdminName;
      activities.push({
        date: new Date(processedTime),
        item: {
          id: `pub-approved-${req.request_id}`,
          time: formatTimeOnly(processedTime),
          timeAgo: `${getRelativeTime(processedTime)} • Khách hàng có thể xem và đặt dịch vụ (Phê duyệt bởi: ${adminName})`,
          action: "Yêu cầu công khai doanh nghiệp",
          target: `Công ty ${companyName} đã được công khai trên nền tảng.`,
          status: "success",
          iconName: "Globe",
          iconColor: "green",
        },
      });
    } else if (req.status === "REJECTED") {
      const processedTime = req.processed_at || req.requested_at;
      const rejectReason = req.reject_reason || "Yêu cầu công khai bị từ chối.";
      activities.push({
        date: new Date(processedTime),
        item: {
          id: `pub-rejected-${req.request_id}`,
          time: formatTimeOnly(processedTime),
          timeAgo: `${getRelativeTime(processedTime)} • ${rejectReason}`,
          action: "Yêu cầu công khai doanh nghiệp",
          target: `Yêu cầu công khai của Công ty ${companyName} đã bị từ chối.`,
          status: "failed",
          iconName: "CircleX",
          iconColor: "red",
        },
      });
    }
  });

  // Sort activities by date descending
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Return all activities
  return activities.map((act) => act.item);
};



