import { checkDateOverlap, checkTimeOverlap } from "@/utils/calcTime";

export interface BookingScheduleCriteria {
  booking_id?: string;
  start_date: string;
  end_date: string;
  day_per_week: string[];
  time_slots: string[];
}

/**
 * Thuật toán phát hiện xung đột lịch đặt dịch vụ 3 chiều:
 * 1. Dải ngày giao thoa (Date Overlap)
 * 2. Thứ trong tuần trùng lặp (Day of Week Overlap)
 * 3. Khung giờ trong ngày chồng lấn (Time Slot Overlap)
 */
export function findOverlappingBookings<T extends BookingScheduleCriteria>(
  target: BookingScheduleCriteria,
  existingList: T[]
): T[] {
  const overlappingItems: T[] = [];

  for (const existing of existingList) {
    // Chiều 1: Kiểm tra dải ngày có giao thoa không
    if (!checkDateOverlap(target.start_date, target.end_date, existing.start_date, existing.end_date)) {
      continue;
    }

    // Chiều 2: Kiểm tra các thứ trong tuần có ngày nào trùng không
    const existingDays = (existing.day_per_week as string[]) || [];
    const daysOverlap = target.day_per_week.some((d) => existingDays.includes(d));
    if (!daysOverlap) {
      continue;
    }

    // Chiều 3: Kiểm tra các khung giờ trong ngày có bị giao thoa không
    const existingTimeSlots = (existing.time_slots as string[]) || [];
    const timeOverlap = target.time_slots.some((newSlot) =>
      existingTimeSlots.some((existSlot) => checkTimeOverlap(newSlot, existSlot))
    );

    if (timeOverlap) {
      overlappingItems.push(existing);
    }
  }

  return overlappingItems;
}
