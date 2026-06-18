import type {
  Shift,
  ShiftAssignment,
  ShiftWithAssignments,
  TimeSlot,
  GuardShiftItem,
  GuardShiftGroupedByDate,
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
