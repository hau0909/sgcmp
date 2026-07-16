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
} from "../repository/dashboard.repository";
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
  const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

  const startOf7DaysAgo = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate(), 0, 0, 0, 0).toISOString();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

  const shifts = await getWeeklyShiftsData(companyId, startOf7DaysAgo, endOfToday);

  // Initialize past 7 days list
  const daysList = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
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
    { status: "Đang trực", count: onDuty },
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
        origLabel = "Đang trực";
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
        status: origLabel
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
            status: "Thay ca"
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
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0).toISOString();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

  // 1. Attendance & Replacements
  const shifts = await getRecentShiftsAndAssignments(companyId, startOfYesterday, endOfToday);
  
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

    if (isToday) {
      return time;
    } else if (isYesterday) {
      return `Hôm qua, ${time}`;
    } else {
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${time}`;
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
  const reports = await getRecentReports(companyId, 10);
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
  const contracts = await getRecentContracts(companyId, 10);
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
  const bookings = await getRecentBookings(companyId, 5);
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
  const activatedCoordinators = await getRecentCoordinators(5);
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

  return activities.slice(0, 20); // Top 20 activities
};
