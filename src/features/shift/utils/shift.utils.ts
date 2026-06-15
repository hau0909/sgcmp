import {
  Shift,
  ShiftAssignment,
  ShiftWithAssignments,
  TimeSlot,
} from "./../type";

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
