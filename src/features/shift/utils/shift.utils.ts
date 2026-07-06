import type {
  Shift,
  ShiftAssignment,
  ShiftWithAssignments,
  TimeSlot,
  GuardShiftItem,
  GuardShiftGroupedByDate,
  SplitShiftSegment,
} from "../type";

export const formatTime = (date: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
};

export const getSlotIdByShift = (shift: Shift) => {
  const start = formatTime(shift.start_time);
  const end = formatTime(shift.end_time);

  return `${start}-${end}`;
};

export const getShiftCellKey = (location: string, slotId: string) => {
  return `${location}-${slotId}`;
};

export const mergeShiftsWithAssignments = (
  shifts: Shift[],
  assignments: ShiftAssignment[],
): ShiftWithAssignments[] => {
  return shifts.map((shift) => ({
    ...shift,
    assignments: assignments.filter(
      (assignment) => assignment.shift_id === shift.shift_id,
    ),
  }));
};

export const getUniqueLocations = (shifts: Shift[]) => {
  return Array.from(new Set(shifts.map((shift) => shift.location)));
};

export const getShiftStyle = (shiftName: string) => {
  const name = shiftName.toLowerCase();

  if (name.includes("sáng")) {
    return "border-emerald-400 bg-emerald-50 text-emerald-700";
  }

  if (name.includes("chiều")) {
    return "border-blue-400 bg-blue-50 text-blue-700";
  }

  if (name.includes("đêm")) {
    return "border-slate-400 bg-slate-100 text-slate-700";
  }

  return "border-sky-400 bg-sky-100 text-sky-700";
};

export const isShiftInSlot = (shift: Shift, slot: TimeSlot) => {
  const slotId = getSlotIdByShift(shift);

  return slotId === slot.id;
};

export const formatDateKey = (dateValue: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(new Date(dateValue));

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
};

export const formatTimes = (dateValue: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(dateValue));
};

export const groupShiftsByDate = (
  shifts: GuardShiftItem[],
): GuardShiftGroupedByDate => {
  return shifts.reduce<GuardShiftGroupedByDate>((result, shift) => {
    if (!result[shift.date]) {
      result[shift.date] = [];
    }

    result[shift.date].push(shift);

    return result;
  }, {});
};

export const addDaysToDateKey = (dateKey: string, days: number) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
};

export const startOfWeekMondayDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekDay = date.getUTCDay();
  const diff = weekDay === 0 ? -6 : 1 - weekDay;

  return addDaysToDateKey(dateKey, diff);
};

export const formatShiftTime = (startTime: string, endTime: string) => {
  const start = new Date(startTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const end = new Date(endTime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return `${start} - ${end}`;
};

export const isValidUuid = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(value);
};

export const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const formatMinutesToTime = (minutes: number): string => {
  const normalized = (minutes % (24 * 60) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const calculateDurationMinutes = (startTime: string, endTime: string): number => {
  const startMin = toMinutes(startTime);
  let endMin = toMinutes(endTime);
  if (endMin <= startMin) {
    endMin += 24 * 60;
  }
  return endMin - startMin;
};

export const parseBookingSlot = (raw: string): { start: string; end: string } | null => {
  const parts = raw.split("-");
  if (parts.length < 2) return null;
  const start = parts[0].trim();
  const end = parts[1].trim();
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return null;
  return { start, end };
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  originalDurationMinutes: number;
  splitDurationMinutes: number;
};

export const validateSplitSegments = (
  originalSlot: string,
  segments: SplitShiftSegment[]
): ValidationResult => {
  const errors: string[] = [];

  const parsed = parseBookingSlot(originalSlot);
  if (!parsed) {
    return {
      isValid: false,
      errors: ["Khung giờ gốc không hợp lệ."],
      originalDurationMinutes: 0,
      splitDurationMinutes: 0,
    };
  }

  const originalDuration = calculateDurationMinutes(parsed.start, parsed.end);
  const origStartMin = toMinutes(parsed.start);

  if (segments.length === 0) {
    return {
      isValid: false,
      errors: ["Danh sách ca tách không được để trống."],
      originalDurationMinutes: originalDuration,
      splitDurationMinutes: 0,
    };
  }

  // Map each segment with its relative start/end minutes
  const mappedSegments = segments.map((seg) => {
    const sMin = toMinutes(seg.startTime);
    const dur = calculateDurationMinutes(seg.startTime, seg.endTime);
    // Relative start minutes from original slot start time
    const startRel = (sMin - origStartMin + 24 * 60) % (24 * 60);
    return {
      ...seg,
      startRel,
      endRel: startRel + dur,
      dur,
    };
  });

  // Sort by startRel ascending
  mappedSegments.sort((a, b) => a.startRel - b.startRel);

  // 1. Check each segment duration <= 8h
  let hasSegmentExceeds8h = false;
  mappedSegments.forEach((seg) => {
    if (seg.dur > 8 * 60) {
      hasSegmentExceeds8h = true;
    }
  });
  if (hasSegmentExceeds8h) {
    errors.push("Ca trực không được vượt quá 8 tiếng.");
  }

  // 2. Check gaps and overlaps
  let hasGap = false;
  let hasOverlap = false;

  // Check if first segment starts at 0
  if (mappedSegments[0].startRel !== 0) {
    hasGap = true;
  }

  for (let i = 1; i < mappedSegments.length; i++) {
    const prevEnd = mappedSegments[i - 1].endRel;
    const currStart = mappedSegments[i].startRel;
    if (currStart > prevEnd) {
      hasGap = true;
    } else if (currStart < prevEnd) {
      hasOverlap = true;
    }
  }

  if (hasGap) {
    errors.push("Các ca tách phải liên tục, không được bị hở thời gian.");
  }
  if (hasOverlap) {
    errors.push("Các ca tách không được trùng thời gian.");
  }

  // 3. Check total duration
  const totalSplitDuration = mappedSegments.reduce((sum, seg) => sum + seg.dur, 0);
  if (totalSplitDuration !== originalDuration) {
    errors.push("Tổng thời gian sau khi tách phải bằng tổng thời gian ca ban đầu.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    originalDurationMinutes: originalDuration,
    splitDurationMinutes: totalSplitDuration,
  };
};