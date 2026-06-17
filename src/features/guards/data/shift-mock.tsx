import type { ShiftItem } from "@/features/guards/components/ShiftCard";

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatGuardShiftDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createGuardMockShifts = (
  weekStart: Date,
): Record<string, ShiftItem[]> => {
  const monday = formatGuardShiftDateKey(addDays(weekStart, 0));
  const tuesday = formatGuardShiftDateKey(addDays(weekStart, 1));
  const wednesday = formatGuardShiftDateKey(addDays(weekStart, 2));
  const thursday = formatGuardShiftDateKey(addDays(weekStart, 3));
  const saturday = formatGuardShiftDateKey(addDays(weekStart, 5));

  return {
    [monday]: [
      {
        id: "shift-001",
        time: "08:00 - 16:00 (8h)",
        location: "Tòa nhà Alpha - Sảnh chính",
        company: "SGCMP Security",
        status: "assigned",
      },
    ],
    [tuesday]: [
      {
        id: "shift-002",
        time: "06:00 - 14:00 (8h)",
        location: "Tòa nhà Alpha - Bãi xe B1",
        company: "SGCMP Security",
        status: "completed",
      },
      {
        id: "shift-003",
        time: "14:00 - 22:00 (8h)",
        location: "Tòa nhà Alpha - Cổng phụ",
        company: "SGCMP Security",
        status: "assigned",
      },
    ],
    [wednesday]: [
      {
        id: "shift-004",
        time: "08:00 - 16:00 (8h)",
        location: "Trung tâm thương mại Lotus - Tầng G",
        company: "Lotus Property Management",
        status: "assigned",
      },
      {
        id: "shift-005",
        time: "18:00 - 22:00 (4h)",
        location: "Trung tâm thương mại Lotus - Khu giao hàng",
        company: "Lotus Property Management",
        status: "assigned",
      },
    ],
    [thursday]: [
      {
        id: "shift-006",
        time: "16:00 - 00:00 (8h)",
        location: "Kho vận Mekong - Cổng số 2",
        company: "Mekong Logistics",
        status: "absent",
      },
    ],
    [saturday]: [
      {
        id: "shift-007",
        time: "22:00 - 06:00 (8h)",
        location: "Bệnh viện An Tâm - Cổng cấp cứu",
        company: "An Tâm Hospital",
        status: "assigned",
      },
    ],
  };
};
