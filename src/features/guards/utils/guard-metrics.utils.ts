import type { GuardPerformanceSummaryData } from "../type";

export interface RawShiftAssignment {
  guard_id: string;
  status: string | null;
  check_in_time: string | null;
  replacement_guard_ids?: string[] | null;
  is_overtime?: boolean;
  overtime_minutes?: number | null;
}

export interface RawShiftItem {
  shift_id: string;
  start_time: string | null;
  shift_assignments?: RawShiftAssignment[];
}

/**
 * Thuật toán tính toán bộ chỉ số KPI chuyên cần và tăng ca bảo vệ
 * Nhận dữ liệu ca trực & phân công đã query từ DB, thực hiện phân loại trạng thái và tính các tỷ lệ %
 */
export function calculateGuardPerformanceMetrics(
  shifts: RawShiftItem[] | null | undefined,
  guard_id?: string,
  nowMs: number = Date.now()
): GuardPerformanceSummaryData {
  if (!shifts || shifts.length === 0) {
    return {
      attendance_rate: {
        percentage: 0.0,
        trend_percentage: 0.0,
        total_shifts: 0,
        total_assignments: 0,
        absent_count: 0,
        absent_percentage: 0.0,
      },
      total_absent_count: {
        count: 0,
        total_shifts: 0,
      },
      late_rate: {
        percentage: 0.0,
        late_shift_count: 0,
        total_shifts: 0,
      },
      on_time_rate: {
        percentage: 0.0,
        trend_percentage: 0.0,
        on_time_shift_count: 0,
        total_shifts: 0,
      },
      completed_rate: {
        percentage: 0.0,
        count: 0,
      },
      late_check_in_rate: {
        percentage: 0.0,
        count: 0,
      },
      replacement_rate: {
        percentage: 0.0,
        count: 0,
      },
      overtime_summary: {
        total_overtime_minutes: 0,
        total_overtime_hours: 0,
        overtime_shifts_count: 0,
      },
    };
  }

  let totalAssignedShifts = 0;
  let evaluableAssignedShifts = 0;
  let attendedShifts = 0;
  let lateCheckInShifts = 0;
  let onTimeCheckInShifts = 0;
  let absentShifts = 0;
  let lateCheckInTimeShifts = 0;
  let replacementShifts = 0;
  let totalOvertimeMinutes = 0;
  let overtimeShiftsCount = 0;
  const guardShiftsSet = new Set<string>();

  shifts.forEach((shift) => {
    const shiftStartTime = shift.start_time ? new Date(shift.start_time).getTime() : null;
    const assignments = shift.shift_assignments || [];

    assignments.forEach((assignment) => {
      if (guard_id && assignment.guard_id !== guard_id) {
        return;
      }
      guardShiftsSet.add(shift.shift_id);
      totalAssignedShifts += 1;
      const status = (assignment.status || "").toLowerCase();
      const checkInTime = assignment.check_in_time ? new Date(assignment.check_in_time).getTime() : null;

      const isReplacement = Array.isArray(assignment.replacement_guard_ids) && assignment.replacement_guard_ids.length > 0;
      const isFutureUnstarted = status === "assigned" && shiftStartTime !== null && shiftStartTime > nowMs;
      const isAttended = Boolean(
        checkInTime ||
        status === "completed" ||
        status === "checkout" ||
        status === "present" ||
        status === "late" ||
        status === "trễ" ||
        status === "ontime" ||
        status === "đúng giờ"
      );

      if ((assignment.is_overtime || Number(assignment.overtime_minutes) > 0) && isAttended) {
        overtimeShiftsCount += 1;
        totalOvertimeMinutes += Number(assignment.overtime_minutes) || 0;
      }

      const isReplacementStatus = status === "replacement" || status === "thay ca";
      const hasReplacement = isReplacement || isReplacementStatus;

      if (hasReplacement) {
        replacementShifts += 1;
      }

      if (!isFutureUnstarted) {
        evaluableAssignedShifts += 1;
        if (status === "absent" || status === "vắng mặt" || isReplacementStatus || (hasReplacement && !checkInTime)) {
          absentShifts += 1;
        } else if (status === "assigned") {
          if (shiftStartTime && nowMs >= shiftStartTime) {
            absentShifts += 1;
          }
        } else if (status === "late" || status === "trễ") {
          if (checkInTime) {
            attendedShifts += 1;
            lateCheckInShifts += 1;
            lateCheckInTimeShifts += 1;
          } else {
            absentShifts += 1;
          }
        } else if (status === "completed" || status === "checkout" || status === "present" || status === "đúng giờ" || status === "ontime") {
          attendedShifts += 1;
          onTimeCheckInShifts += 1;
        } else {
          if (checkInTime) {
            attendedShifts += 1;
          } else {
            absentShifts += 1;
          }
        }
      }
    });
  });

  const distinctShiftsCount = guard_id ? guardShiftsSet.size : shifts.length;
  const effectiveAssignedShifts = Math.max(0, evaluableAssignedShifts);

  const attendancePercentage = effectiveAssignedShifts > 0
    ? Number(((attendedShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : (totalAssignedShifts > 0 && absentShifts === 0 ? 100.0 : 0.0);

  const absentPercentage = effectiveAssignedShifts > 0
    ? Number(((absentShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const latePercentage = effectiveAssignedShifts > 0
    ? Number(((lateCheckInShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const onTimePercentage = effectiveAssignedShifts > 0
    ? Number(((onTimeCheckInShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const lateCheckInPercentage = effectiveAssignedShifts > 0
    ? Number(((lateCheckInTimeShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const replacementPercentage = totalAssignedShifts > 0
    ? Number(((replacementShifts / totalAssignedShifts) * 100).toFixed(1))
    : 0.0;

  return {
    attendance_rate: {
      percentage: attendancePercentage,
      trend_percentage: 0.0,
      total_shifts: distinctShiftsCount,
      total_assignments: totalAssignedShifts,
      absent_count: absentShifts,
      absent_percentage: absentPercentage,
    },
    total_absent_count: {
      count: absentShifts,
      total_shifts: totalAssignedShifts,
    },
    late_rate: {
      percentage: latePercentage,
      late_shift_count: lateCheckInShifts,
      total_shifts: attendedShifts,
    },
    on_time_rate: {
      percentage: onTimePercentage,
      trend_percentage: 0.0,
      on_time_shift_count: onTimeCheckInShifts,
      total_shifts: attendedShifts,
    },
    completed_rate: {
      percentage: onTimePercentage,
      count: onTimeCheckInShifts,
    },
    late_check_in_rate: {
      percentage: lateCheckInPercentage,
      count: lateCheckInTimeShifts,
    },
    replacement_rate: {
      percentage: replacementPercentage,
      count: replacementShifts,
    },
    overtime_summary: {
      total_overtime_minutes: totalOvertimeMinutes,
      total_overtime_hours: Number((totalOvertimeMinutes / 60).toFixed(1)),
      overtime_shifts_count: overtimeShiftsCount,
    },
  };
}
