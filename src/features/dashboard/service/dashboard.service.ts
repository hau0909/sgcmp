import { createClient } from "@/lib/supabase/server";
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
  getCoordinatorReportStats,
  getPastShiftsRepository,
  getAvailableGuardsRepository,
  getGuardPerformanceRadarRepository,
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
  addedCount?: number;
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
  let completed = 0; // Hoàn thành
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

      if (origStatus === "checkout") {
        completed++;
      } else if (origStatus === "completed") {
        if (isShiftActive) {
          onDuty++;
        } else {
          completed++;
        }
      } else if (origStatus === "assigned") {
        if (origCheckIn) {
          if (isShiftActive) {
            onDuty++;
          } else {
            completed++;
          }
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
    { status: "Đang trực", count: onDuty },
    { status: "Hoàn thành", count: completed },
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
      if (origStatus === "checkout") {
        origLabel = "Hoàn thành";
      } else if (origStatus === "completed") {
        origLabel = isShiftActive ? "Đang trực" : "Hoàn thành";
      } else if (origStatus === "late") {
        origLabel = origCheckIn ? "Điểm danh trễ" : "Đi trễ";
      } else if (origStatus === "absent") {
        origLabel = "Vắng mặt";
      } else if (origStatus === "assigned") {
        if (origCheckIn) {
          origLabel = isShiftActive ? "Đang trực" : "Hoàn thành";
        } else {
          origLabel = "Phân công";
        }
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
      if (sa.check_in_time) {
        if (sa.status === "late") {
          const checkInDate = new Date(sa.check_in_time);
          const shiftStartDate = new Date(shift.start_time);
          const minutesLate = Math.max(0, Math.round((checkInDate.getTime() - shiftStartDate.getTime()) / 60000));
          activities.push({
            id: `act-att-${sa.guard_id}-${shift.shift_id}-checkin-late`,
            type: "attendance",
            subType: "attendance_late",
            boldText: guardName,
            normalText: ` đã điểm danh trễ ${minutesLate > 0 ? `${minutesLate} phút.` : "."}`,
            timestamp: sa.check_in_time,
            timeLabel: formatFriendlyTime(sa.check_in_time),
            metaLabel: shiftName
          });
        } else {
          activities.push({
            id: `act-att-${sa.guard_id}-${shift.shift_id}-checkin`,
            type: "attendance",
            subType: "attendance_completed",
            boldText: guardName,
            normalText: " đã điểm danh ca trực.",
            timestamp: sa.check_in_time,
            timeLabel: formatFriendlyTime(sa.check_in_time),
            metaLabel: shiftName
          });
        }
      } else {
        if (sa.status === "late") {
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
        } else if (sa.status === "absent") {
          activities.push({
            id: `act-att-${sa.guard_id}-${shift.shift_id}-absent`,
            type: "attendance",
            subType: "attendance_absent",
            boldText: guardName,
            normalText: " bị đánh dấu vắng mặt.",
            timestamp: sa.updated_at || shift.start_time,
            timeLabel: formatFriendlyTime(sa.updated_at || shift.start_time),
            metaLabel: shiftName
          });
        }
      }

      if (sa.status === "checkout") {
        activities.push({
          id: `act-att-${sa.guard_id}-${shift.shift_id}-checkout`,
          type: "attendance",
          subType: "attendance_checkout",
          boldText: guardName,
          normalText: " đã kết thúc ca trực.",
          timestamp: sa.updated_at || shift.start_time,
          timeLabel: formatFriendlyTime(sa.updated_at || shift.start_time),
          metaLabel: shiftName
        });
      } else if (sa.status === "completed" && !sa.check_in_time) {
        activities.push({
          id: `act-att-${sa.guard_id}-${shift.shift_id}-completed`,
          type: "attendance",
          subType: "attendance_completed",
          boldText: guardName,
          normalText: " đã điểm danh ca trực.",
          timestamp: sa.updated_at || shift.start_time,
          timeLabel: formatFriendlyTime(sa.updated_at || shift.start_time),
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

const getTimeFilterDates = (filter: string = "month") => {
  const now = new Date();
  let startDate: Date;
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filter === "week") {
    const d = new Date(now);
    d.setDate(now.getDate() - 7);
    startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  } else if (filter === "year") {
    const d = new Date(now);
    d.setDate(now.getDate() - 365);
    startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  } else {
    // "month" / default
    const d = new Date(now);
    d.setDate(now.getDate() - 30);
    startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  return { startDate, endDate };
};

export const getAdminRevenueService = async (filter: string = "month"): Promise<MetricWithTrend> => {
  const { startDate, endDate } = getTimeFilterDates(filter);
  const payments = await getCompletedPayments();

  const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const added = payments
    .filter((p) => {
      const d = new Date(p.created_at);
      return d >= startDate && d <= endDate;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    count: total,
    addedCount: added,
    percentChange: null,
    trend: added > 0 ? "up" : "neutral",
  };
};

export const getAdminTotalCompaniesService = async (): Promise<MetricWithTrend> => {
  const statuses = ["active", "pending_publish", "published"];
  const current = await countTotalCompaniesByStatus(statuses);
  return {
    count: current,
    addedCount: 0,
    percentChange: null,
    trend: "neutral",
  };
};

export const getAdminPublishedCompaniesService = async (): Promise<MetricWithTrend> => {
  const statuses = ["published"];
  const current = await countTotalCompaniesByStatus(statuses);
  return {
    count: current,
    addedCount: 0,
    percentChange: null,
    trend: "neutral",
  };
};

export const getAdminUserByRoleService = async (
  role: "company-admin" | "customer",
  filter: string = "month"
): Promise<MetricWithTrend> => {
  const { startDate, endDate } = getTimeFilterDates(filter);
  const supabase = await createClient();

  if (role === "company-admin") {
    // DOANH NGHIỆP BẢO VỆ: Lấy từ bảng `companies` với status = 'active' hoặc 'published'
    const targetStatuses = ["active", "published"];
    const [totalRes, addedRes] = await Promise.all([
      supabase
        .from("companies")
        .select("company_id", { count: "exact", head: true })
        .in("status", targetStatuses),
      supabase
        .from("companies")
        .select("company_id", { count: "exact", head: true })
        .in("status", targetStatuses)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),
    ]);

    const count = totalRes.count || 0;
    const added = addedRes.count || 0;

    return {
      count,
      addedCount: added,
      percentChange: null,
      trend: added > 0 ? "up" : "neutral",
    };
  }

  // KHÁCH HÀNG: Lấy từ bảng `profiles` với role = 'customer'
  const [totalRes, addedRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),
  ]);

  const count = totalRes.count || 0;
  const added = addedRes.count || 0;

  return {
    count,
    addedCount: added,
    percentChange: null,
    trend: added > 0 ? "up" : "neutral",
  };
};

export const getAdminTotalUsersService = async (filter: string = "month"): Promise<MetricWithTrend> => {
  return getAdminUserByRoleService("customer", filter);
};

export const getAdminPendingApprovalCompaniesService = async (filter: string = "month"): Promise<MetricWithTrend> => {
  const { startDate, endDate } = getTimeFilterDates(filter);
  const supabase = await createClient();

  const [totalRes, addedRes] = await Promise.all([
    supabase
      .from("companies")
      .select("company_id", { count: "exact", head: true })
      .eq("status", "pending_register"),
    supabase
      .from("companies")
      .select("company_id", { count: "exact", head: true })
      .eq("status", "pending_register")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),
  ]);

  const count = totalRes.count || 0;
  const added = addedRes.count || 0;

  return {
    count,
    addedCount: added,
    percentChange: null,
    trend: added > 0 ? "up" : "neutral",
  };
};

export const getAdminPendingPublicationRequestsService = async (filter: string = "month"): Promise<MetricWithTrend> => {
  const { startDate, endDate } = getTimeFilterDates(filter);
  const supabase = await createClient();

  const [totalRes, addedRes] = await Promise.all([
    supabase
      .from("company_publish_requests")
      .select("request_id", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("company_publish_requests")
      .select("request_id", { count: "exact", head: true })
      .eq("status", "PENDING")
      .gte("requested_at", startDate.toISOString())
      .lte("requested_at", endDate.toISOString()),
  ]);

  const count = totalRes.count || 0;
  const added = addedRes.count || 0;

  return {
    count,
    addedCount: added,
    percentChange: null,
    trend: added > 0 ? "up" : "neutral",
  };
};

export interface PendingPublicationListItem {
  request_id: string;
  company_name: string;
  requested_at: string;
  notes: string | null;
}

export const getAdminPendingPublicationListService = async (): Promise<PendingPublicationListItem[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("company_publish_requests")
    .select("request_id, requested_at, notes, companies(company_name)")
    .eq("status", "PENDING")
    .order("requested_at", { ascending: false });

  if (error) {
    throw new Error(`Không thể lấy danh sách yêu cầu công khai: ${error.message}`);
  }

  return ((data as any) || []).map((row: any) => ({
    request_id: row.request_id,
    company_name: row.companies?.company_name || "Doanh nghiệp không tên",
    requested_at: row.requested_at,
    notes: row.notes || null,
  }));
};


export interface GrowthDataPoint {
  name: string;
  revenue: number;
  companies: number;
  fill: string;
}

export const getAdminGrowthService = async (timeFilter: string = "month"): Promise<GrowthDataPoint[]> => {
  const now = new Date();
  const points: { label: string; start: Date; end: Date }[] = [];

  if (timeFilter === "week") {
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
      const nextD = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label = dayNames[d.getDay()];
      points.push({ label: `${label} (${d.getDate()}/${d.getMonth() + 1})`, start: d, end: nextD });
    }
  } else if (timeFilter === "year") {
    for (let i = 11; i >= 0; i--) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
      const label = `Th.${start.getUTCMonth() + 1}`;
      points.push({ label, start, end });
    }
  } else {
    // "month" - 4 weeks
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 7 + 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7, 23, 59, 59, 999);
      const label = `Tuần ${4 - i}`;
      points.push({ label, start, end });
    }
  }

  const startDate = points[0].start.toISOString();
  const payments = await getCompletedPaymentsAfter(startDate);

  return points.map((p, idx) => {
    const revenue = payments
      .filter((pm) => {
        const d = new Date(pm.created_at);
        return d >= p.start && d <= p.end;
      })
      .reduce((sum, pm) => sum + (pm.amount || 0), 0);

    const isLast = idx === points.length - 1;
    const fill = isLast ? "#4ba3ff" : "#8ec5ff";

    return {
      name: p.label,
      revenue,
      companies: 0,
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

export const getAdminPendingTasksService = async (locale: string = "vi"): Promise<PendingTaskItem[]> => {
  const [registrations, publishRequests] = await Promise.all([
    getPendingRegistrations(),
    getPendingPublishRequests(),
  ]);

  const isVi = locale !== "en";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const tasks: { date: Date; item: PendingTaskItem }[] = [];

  // Map registrations (Doanh nghiệp đợi phê duyệt)
  registrations.forEach((reg) => {
    const companyName = reg.companies?.company_name || (isVi ? "Doanh nghiệp không tên" : "Unnamed Company");
    tasks.push({
      date: new Date(reg.created_at),
      item: {
        id: `reg-${reg.registration_id}`,
        stt: 0,
        category: "register",
        categoryText: isVi ? "ĐĂNG KÝ MỚI" : "NEW REGISTRATION",
        time: getRelativeTimeString(reg.created_at),
        title: companyName,
        description: reg.companies?.description || (isVi ? "Hồ sơ đăng ký doanh nghiệp cần xét duyệt điều khoản." : "Company registration profile awaiting review."),
        status: "pending_approval",
        statusText: isVi ? "Chờ duyệt" : "Awaiting Approval",
      },
    });
  });

  // Map company_publish_requests (Yêu cầu công khai doanh nghiệp)
  publishRequests.forEach((req) => {
    const companyName = req.companies?.company_name || (isVi ? "Doanh nghiệp không tên" : "Unnamed Company");
    tasks.push({
      date: new Date(req.requested_at),
      item: {
        id: `pub-${req.request_id}`,
        stt: 0,
        category: "compliance",
        categoryText: isVi ? "CÔNG KHAI" : "PUBLICATION",
        time: getRelativeTimeString(req.requested_at),
        title: companyName,
        description: req.notes || (isVi ? "Yêu cầu kích hoạt chế độ công khai cho doanh nghiệp." : "Publication request for the company."),
        status: "pending_approval",
        statusText: isVi ? "Chờ duyệt" : "Awaiting Approval",
      },
    });
  });

  // Strictly filter tasks for today only (no fallback to past tasks or time filter)
  const todayTasks = tasks.filter((t) => t.date >= startOfToday);

  // Sort by date descending
  todayTasks.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Assign STT
  return todayTasks.map((t, index) => ({
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

export const getAdminRecentActivitiesService = async (
  filter: string = "month",
  locale: string = "vi"
): Promise<ActivityItem[]> => {
  const { startDate, endDate } = getTimeFilterDates(filter);
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

  const isVi = locale !== "en";

  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (isVi) {
      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return `${diffDays} ngày trước`;
    } else {
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hr ago`;
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  };

  const formatDateTimeLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (d.getTime() >= today.getTime()) {
      return isVi ? `Hôm nay, ${timeStr}` : `Today, ${timeStr}`;
    } else if (d.getTime() >= yesterday.getTime()) {
      return isVi ? `Hôm qua, ${timeStr}` : `Yesterday, ${timeStr}`;
    } else {
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${timeStr}`;
    }
  };

  const formatCompanyName = (name: string, isVi: boolean) => {
    if (isVi) {
      return name.startsWith("Công ty") || name.startsWith("CÔNG TY") ? name : `Công ty ${name}`;
    }
    return name.startsWith("Company") || name.startsWith("Công ty") || name.startsWith("CÔNG TY")
      ? name
      : `Company ${name}`;
  };

  // i18n text helpers
  const t = {
    company: isVi ? "Doanh nghiệp" : "Company",
    // registration
    regAction: isVi ? "Đăng ký doanh nghiệp" : "Company Registration",
    regUpdatedTimeAgo: (ago: string) => isVi ? `${ago} • Đã gửi lại để xét duyệt` : `${ago} • Resubmitted for review`,
    regUpdatedTarget: (name: string) => isVi ? `${formatCompanyName(name, true)} đã cập nhật lại hồ sơ đăng ký.` : `${formatCompanyName(name, false)} has resubmitted their registration.`,
    regPendingTimeAgo: (ago: string) => isVi ? `${ago} • Chờ phê duyệt` : `${ago} • Awaiting approval`,
    regPendingTarget: (name: string) => isVi ? `${formatCompanyName(name, true)} đã gửi hồ sơ đăng ký.` : `${formatCompanyName(name, false)} has submitted a registration.`,
    // approval result
    approvalAction: isVi ? "Kết quả phê duyệt" : "Approval Result",
    approvedTimeAgo: (label: string, admin: string) => isVi ? `${label} • Thực hiện bởi Admin ${admin}` : `${label} • Approved by Admin ${admin}`,
    approvedTarget: (name: string) => isVi ? `${formatCompanyName(name, true)} đã được phê duyệt đăng ký.` : `${formatCompanyName(name, false)} has been approved.`,
    rejectedTimeAgo: (label: string) => isVi ? `${label} • Giấy phép kinh doanh không hợp lệ` : `${label} • Invalid business license`,
    rejectedTarget: (name: string) => isVi ? `Hồ sơ ${formatCompanyName(name, true)} đã bị từ chối.` : `Registration for ${formatCompanyName(name, false)} has been rejected.`,
    // publish request
    pubAction: isVi ? "Yêu cầu công khai doanh nghiệp" : "Company Publication Request",
    pubPendingTimeAgo: (ago: string) => isVi ? `${ago} • Chờ xét duyệt` : `${ago} • Awaiting review`,
    pubPendingTarget: (name: string) => isVi ? `${formatCompanyName(name, true)} đã gửi yêu cầu công khai.` : `${formatCompanyName(name, false)} has submitted a publication request.`,
    pubApprovedTimeAgo: (ago: string, admin: string) => isVi ? `${ago} • Khách hàng có thể xem và đặt dịch vụ (Phê duyệt bởi: ${admin})` : `${ago} • Customers can now view & book services (Approved by: ${admin})`,
    pubApprovedTarget: (name: string) => isVi ? `${formatCompanyName(name, true)} đã được công khai trên nền tảng.` : `${formatCompanyName(name, false)} is now published on the platform.`,
    pubRejectedTarget: (name: string) => isVi ? `Yêu cầu công khai của ${formatCompanyName(name, true)} đã bị từ chối.` : `Publication request for ${formatCompanyName(name, false)} has been rejected.`,
  };

  const activities: { date: Date; item: ActivityItem }[] = [];

  // Helper formats
  const pad = (num: number) => String(num).padStart(2, "0");

  const formatTimeOnly = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Process registrations
  registrations.forEach((reg) => {
    const companyName = reg.companies?.company_name || t.company;

    if (reg.status === "pending") {
      const created = new Date(reg.created_at);
      const updated = new Date(reg.updated_at);
      const isUpdated = updated.getTime() - created.getTime() > 10000;

      if (isUpdated) {
        activities.push({
          date: updated,
          item: {
            id: `reg-pending-upd-${reg.registration_id}`,
            time: formatTimeOnly(reg.updated_at),
            timeAgo: t.regUpdatedTimeAgo(getRelativeTime(reg.updated_at)),
            action: t.regAction,
            target: t.regUpdatedTarget(companyName),
            status: "pending",
            iconName: "FilePlus2",
            iconColor: "blue",
          },
        });
      } else {
        activities.push({
          date: created,
          item: {
            id: `reg-pending-new-${reg.registration_id}`,
            time: formatTimeOnly(reg.created_at),
            timeAgo: t.regPendingTimeAgo(getRelativeTime(reg.created_at)),
            action: t.regAction,
            target: t.regPendingTarget(companyName),
            status: "pending",
            iconName: "Building2",
            iconColor: "blue",
          },
        });
      }
    } else if (reg.status === "approved") {
      activities.push({
        date: new Date(reg.updated_at),
        item: {
          id: `reg-approved-${reg.registration_id}`,
          time: formatTimeOnly(reg.updated_at),
          timeAgo: t.approvedTimeAgo(formatDateTimeLabel(reg.updated_at), defaultAdminName),
          action: t.approvalAction,
          target: t.approvedTarget(companyName),
          status: "success",
          iconName: "BadgeCheck",
          iconColor: "green",
        },
      });
    } else if (reg.status === "rejected") {
      activities.push({
        date: new Date(reg.updated_at),
        item: {
          id: `reg-rejected-${reg.registration_id}`,
          time: formatTimeOnly(reg.updated_at),
          timeAgo: t.rejectedTimeAgo(formatDateTimeLabel(reg.updated_at)),
          action: t.approvalAction,
          target: t.rejectedTarget(companyName),
          status: "failed",
          iconName: "CircleX",
          iconColor: "red",
        },
      });
    }
  });

  // Process publish requests
  publishRequests.forEach((req) => {
    const companyName = req.companies?.company_name || t.company;

    if (req.status === "PENDING") {
      activities.push({
        date: new Date(req.requested_at),
        item: {
          id: `pub-pending-${req.request_id}`,
          time: formatTimeOnly(req.requested_at),
          timeAgo: t.pubPendingTimeAgo(getRelativeTime(req.requested_at)),
          action: t.pubAction,
          target: t.pubPendingTarget(companyName),
          status: "pending",
          iconName: "Globe",
          iconColor: "purple",
        },
      });
    } else if (req.status === "APPROVED") {
      const processedTime = req.processed_at || req.requested_at;
      const adminName = req.approved_by ? (profilesMap[req.approved_by] || defaultAdminName) : defaultAdminName;
      activities.push({
        date: new Date(processedTime),
        item: {
          id: `pub-approved-${req.request_id}`,
          time: formatTimeOnly(processedTime),
          timeAgo: t.pubApprovedTimeAgo(getRelativeTime(processedTime), adminName),
          action: t.pubAction,
          target: t.pubApprovedTarget(companyName),
          status: "success",
          iconName: "Globe",
          iconColor: "green",
        },
      });
    } else if (req.status === "REJECTED") {
      const processedTime = req.processed_at || req.requested_at;
      const rejectReason = req.reject_reason || (isVi ? "Yêu cầu công khai bị từ chối." : "Publication request rejected.");
      activities.push({
        date: new Date(processedTime),
        item: {
          id: `pub-rejected-${req.request_id}`,
          time: formatTimeOnly(processedTime),
          timeAgo: `${getRelativeTime(processedTime)} • ${rejectReason}`,
          action: t.pubAction,
          target: t.pubRejectedTarget(companyName),
          status: "failed",
          iconName: "CircleX",
          iconColor: "red",
        },
      });
    }
  });

  // Filter activities by date range according to filter
  const filteredActivities = activities.filter(
    (act) => act.date >= startDate && act.date <= endDate
  );

  // Sort activities by date descending
  filteredActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Return all activities
  return filteredActivities.map((act) => act.item);
};

export interface CurrentUpcomingShiftItem {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  type: "ONGOING" | "UPCOMING" | "LATE" | "REPLACEMENT" | "ABSENT" | "CHECKOUT";
  timeText: string;
  location: string;
  statusText: string;
}

export const getCurrentUpcomingShiftsTodayService = async (
  companyId?: string,
  timeFilter?: string
): Promise<CurrentUpcomingShiftItem[]> => {
  if (!companyId) {
    return [];
  }
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

  // Always query shifts active right now or starting from current time 'now' until end of today
  const rawShifts = await getTodayGuardsStatusList(companyId, now.toISOString(), endOfToday);

  // Collect all guard IDs
  const guardIds = new Set<string>();
  for (const s of rawShifts) {
    for (const sa of s.shift_assignments || []) {
      if (sa.guard_id) guardIds.add(sa.guard_id);
      if (sa.replacement_guard_ids) {
        sa.replacement_guard_ids.forEach((id: string) => guardIds.add(id));
      }
    }
  }

  let profiles: any[] = [];
  if (guardIds.size > 0) {
    profiles = await getProfilesByIds(Array.from(guardIds));
  }

  const getProfile = (id: string) => {
    return profiles.find((p) => p.user_id === id) || { full_name: "Bảo vệ", avatar_url: null };
  };

  const pad = (num: number) => num.toString().padStart(2, "0");
  const formatHHMM = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const list: CurrentUpcomingShiftItem[] = [];

  for (const s of rawShifts) {
    const shiftStart = new Date(s.start_time);
    const shiftEnd = new Date(s.end_time);
    const locationName = (s.contracts as any)?.bookings?.services?.name || s.shift_name || "Địa điểm trực";

    // Exclude shifts that have already ended before now
    if (shiftEnd < now) {
      continue;
    }

    for (const sa of s.shift_assignments || []) {
      const st = sa.status;

      // Exclude assignments that have checked out / finished
      if (st === "checkout") {
        continue;
      }

      const hasRep = sa.replacement_guard_ids && sa.replacement_guard_ids.length > 0;
      const profile = getProfile(sa.guard_id);
      const assignmentId = `#C-${sa.guard_id.slice(0, 4).toUpperCase()}`;

      let type: "ONGOING" | "UPCOMING" | "LATE" | "REPLACEMENT" | "ABSENT" | "CHECKOUT" = "UPCOMING";
      let statusText = "PHÂN CÔNG";
      let timeText = `Bắt đầu: ${formatHHMM(s.start_time)}`;

      if (hasRep) {
        type = "REPLACEMENT";
        statusText = "THAY CA";
        timeText = `Thay ca (${formatHHMM(s.start_time)})`;
      } else if (st === "completed") {
        type = "ONGOING";
        statusText = "ĐANG TRỰC";
        timeText = `Kết thúc lúc: ${formatHHMM(s.end_time)}`;
      } else if (st === "late") {
        type = "LATE";
        statusText = "ĐI TRỄ";
        timeText = `Trễ ca (Bắt đầu ${formatHHMM(s.start_time)})`;
      } else if (st === "absent") {
        type = "ABSENT";
        statusText = "VẮNG MẶT";
        timeText = `Vắng mặt ca ${formatHHMM(s.start_time)}`;
      } else {
        type = "UPCOMING";
        statusText = "PHÂN CÔNG";
        timeText = `Bắt đầu: ${formatHHMM(s.start_time)}`;
      }

      list.push({
        id: assignmentId,
        name: profile.full_name,
        avatar: profile.avatar_url || "",
        phone: profile.phone_number || "",
        type,
        timeText,
        location: locationName,
        statusText,
      });

      if (hasRep) {
        sa.replacement_guard_ids.forEach((repId: string) => {
          const repProf = getProfile(repId);
          list.push({
            id: `#C-${repId.slice(0, 4).toUpperCase()}`,
            name: repProf.full_name,
            avatar: repProf.avatar_url || "",
            phone: repProf.phone_number || "",
            type: "REPLACEMENT",
            timeText: `Thay ca cho ${profile.full_name} (${formatHHMM(s.start_time)})`,
            location: locationName,
            statusText: "THAY CA",
          });
        });
      }
    }
  }

  return list;
};

export const getCoordinatorReportStatsService = async (
  companyId?: string,
  filter: string = "hientai"
): Promise<{ totalReports: number; unresolvedReports: number; currentUpcomingShifts: CurrentUpcomingShiftItem[]; filter: string }> => {
  const stats = await getCoordinatorReportStats(companyId, filter);
  const currentUpcomingShifts = await getCurrentUpcomingShiftsTodayService(companyId, filter);
  return {
    ...stats,
    currentUpcomingShifts,
    filter,
  };
};

export interface PastShiftItem {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  time: string;
  location: string;
  contractName: string;
  status: string;
}

export interface AvailableGuardItem {
  id: string;
  name: string;
  certs: string;
  phone: string;
  avatar: string;
}

export interface GuardPerformanceRadarItem {
  subject: string;
  score: number;
  count: string;
  badgeBg: string;
}

export const getPastShiftsService = async (
  companyId?: string,
  filter: string = "hientai"
): Promise<PastShiftItem[]> => {
  if (!companyId) return [];
  const data = await getPastShiftsRepository(companyId, filter);
  if (!data || data.length === 0) return [];

  const guardIds = Array.from(
    new Set(
      data
        .flatMap((s: any) => (s.shift_assignments || []).map((sa: any) => sa.guard_id))
        .filter((id): id is string => Boolean(id))
    )
  );

  let profiles: any[] = [];
  if (guardIds.length > 0) {
    profiles = await getProfilesByIds(guardIds);
  }
  const getProfile = (id: string) => profiles.find((p) => p.user_id === id) || { full_name: "Bảo vệ" };

  const pad = (num: number) => num.toString().padStart(2, "0");
  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const dateStr = `${pad(s.getDate())}/${pad(s.getMonth() + 1)}/${s.getFullYear()}`;
    return `${pad(s.getHours())}:${pad(s.getMinutes())} - ${pad(e.getHours())}:${pad(e.getMinutes())} · ${dateStr}`;
  };

  const list: PastShiftItem[] = [];
  for (const s of data as any[]) {
    const serviceName = s.contracts?.bookings?.services?.name;
    const locationName = serviceName || (s.shift_name && s.shift_name !== "a" ? s.shift_name : "Mục tiêu trực");
    const contractName = s.contracts?.contract_name || s.contracts?.contract_code || (s.contracts?.contract_id ? `Hợp đồng #${s.contracts.contract_id.slice(0, 6)}` : "Hợp đồng bảo vệ");

    for (const sa of s.shift_assignments || []) {
      const p = getProfile(sa.guard_id);
      let statusLabel = "ĐÃ KẾT THÚC";
      if (sa.status === "late") statusLabel = "ĐI TRỄ";
      else if (sa.status === "absent") statusLabel = "VẮNG MẶT";
      else if (sa.status === "assigned" || sa.status === "upcoming") statusLabel = "PHÂN CÔNG";
      else if (sa.status === "completed" || sa.status === "ongoing") statusLabel = "ĐANG TRỰC";

      list.push({
        id: `#G-${sa.guard_id ? sa.guard_id.slice(0, 4).toUpperCase() : "0000"}`,
        name: p.full_name,
        avatar: p.avatar_url || "",
        phone: p.phone_number || "",
        time: formatTimeRange(s.start_time, s.end_time),
        location: locationName,
        contractName: contractName,
        status: statusLabel,
      });
    }
  }
  return list;
};

export const getAvailableGuardsService = async (
  companyId?: string
): Promise<AvailableGuardItem[]> => {
  if (!companyId) return [];
  const data = await getAvailableGuardsRepository(companyId);
  if (!data || data.length === 0) return [];

  return data.map((g: any) => ({
    id: `#B-${g.user_id.slice(0, 4).toUpperCase()}`,
    name: g.profiles?.full_name || "Bảo vệ",
    certs: "CN: Tuần tra, Sơ cứu",
    phone: g.profiles?.phone_number || "",
    avatar: g.profiles?.avatar_url || "",
  }));
};

export const getGuardPerformanceRadarService = async (
  companyId?: string,
  filter: string = "hientai"
): Promise<GuardPerformanceRadarItem[]> => {
  const counts = await getGuardPerformanceRadarRepository(companyId, filter);

  const maxVal = Math.max(counts.onDutyCount, counts.completedCount, counts.lateCount, counts.absentCount, counts.replacementCount, 1);
  const calcScore = (val: number) => Math.min(100, Math.round((val / maxVal) * 90) + 10);

  return [
    {
      subject: "Đang trực",
      score: counts.onDutyCount > 0 ? calcScore(counts.onDutyCount) : 0,
      count: `${counts.onDutyCount}`,
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200/80",
    },
    {
      subject: "Hoàn thành",
      score: counts.completedCount > 0 ? calcScore(counts.completedCount) : 0,
      count: `${counts.completedCount}`,
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
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
};



