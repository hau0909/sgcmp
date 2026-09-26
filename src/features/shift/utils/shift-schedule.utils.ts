export const DAY_LABEL_MAP: Record<string, number> = {
  "thứ 2": 1, "thứ 3": 2, "thứ 4": 3, "thứ 5": 4, "thứ 6": 5, "thứ 7": 6, "chủ nhật": 0,
  t2: 1, t3: 2, t4: 3, t5: 4, t6: 5, t7: 6, cn: 0,
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0,
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
};

export interface ContractDateScheduleInput {
  start_date?: string | null;
  end_date?: string | null;
}

export interface ContractWorkingScheduleResult {
  totalWorkingDays: number;
  scheduledDays: number;
}

/**
 * Thuật toán tính tổng số ngày làm việc theo hợp đồng và số ngày đã được xếp ca
 * @param contract Thông tin ngày bắt đầu/kết thúc hợp đồng
 * @param dayPerWeek Danh sách các thứ làm việc trong tuần (vd: ["Thứ 2", "Thứ 4", "Thứ 6"])
 * @param scheduledDatesSet Tập hợp các chuỗi ngày (YYYY-MM-DD) đã có ca trực được tạo
 */
export function calculateContractWorkingAndScheduledDays(
  contract: ContractDateScheduleInput,
  dayPerWeek: string[],
  scheduledDatesSet: Set<string>
): ContractWorkingScheduleResult {
  const targetDays = (dayPerWeek || [])
    .map((d) => DAY_LABEL_MAP[d.toLowerCase().trim()])
    .filter((n): n is number => n !== undefined);

  let totalWorkingDays = 0;
  let scheduledDays = 0;

  if (contract.start_date && contract.end_date && targetDays.length > 0) {
    const cStart = new Date(`${contract.start_date}T00:00:00`);
    const cEnd = new Date(`${contract.end_date}T00:00:00`);

    // 1. Tính tổng số ngày làm việc theo lịch hợp đồng
    const cur = new Date(cStart);
    while (cur <= cEnd) {
      if (targetDays.includes(cur.getDay())) {
        totalWorkingDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    // 2. Tính số ngày đã được lên ca nằm trong hạn hợp đồng và đúng thứ
    for (const dStr of Array.from(scheduledDatesSet)) {
      try {
        const dObj = new Date(`${dStr}T00:00:00`);
        if (dObj >= cStart && dObj <= cEnd && targetDays.includes(dObj.getDay())) {
          scheduledDays++;
        }
      } catch {
        // bỏ qua định dạng ngày không hợp lệ
      }
    }
  }

  return {
    totalWorkingDays,
    scheduledDays,
  };
}
