import type { ShiftWithAssignments, TimeSlot } from "../type";
import { getShiftCellKey, getSlotIdByShift } from "../utils/shift.utils";
import { ShiftCard } from "./ShiftCard";
import { ShiftWeekScheduleTable } from "./ShiftWeekScheduleTable";

type ShiftScheduleTableProps = {
  viewMode?: "day" | "week";
  locations: string[];
  shifts: ShiftWithAssignments[];
  selectedLocation?: string;
  weekStartDate?: string;
};

type ShiftSegment = {
  id: string;
  startIndex: number;
  span: number;
  shift: ShiftWithAssignments;
};

const LOCATION_COLUMN_WIDTH = 220;
const TIME_SLOT_COLUMN_WIDTH = 220;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

const getDateTimeValue = (date: string) => {
  return new Date(date).getTime();
};

const getShiftContractAddress = (shift: ShiftWithAssignments) => {
  return shift.contract_address || "Chưa cập nhật địa điểm";
};

const formatVietnamTime = (date: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
};

const getMinutesFromTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
};

const createTimeSlotFromShift = (shift: ShiftWithAssignments): TimeSlot => {
  const start = formatVietnamTime(shift.start_time);
  const end = formatVietnamTime(shift.end_time);

  return {
    id: getSlotIdByShift(shift),
    label: `${start} - ${end}`,
    start,
    end,
  };
};

const getDisplayTimeSlots = (shifts: ShiftWithAssignments[]) => {
  const slotMap = new Map<string, TimeSlot>();

  shifts.forEach((shift) => {
    const slotId = getSlotIdByShift(shift);

    if (!slotMap.has(slotId)) {
      slotMap.set(slotId, createTimeSlotFromShift(shift));
    }
  });

  return Array.from(slotMap.values()).sort(
    (a, b) => getMinutesFromTime(a.start) - getMinutesFromTime(b.start),
  );
};

const isContinuousShift = (
  previousShift: ShiftWithAssignments,
  currentShift: ShiftWithAssignments,
) => {
  const previousAssignment = previousShift.assignments[0];
  const currentAssignment = currentShift.assignments[0];

  if (!previousAssignment || !currentAssignment) {
    return false;
  }

  const isSameGuard =
    previousAssignment.guard_id === currentAssignment.guard_id;

  const isSameContractAddress =
    getShiftContractAddress(previousShift) ===
    getShiftContractAddress(currentShift);

  const isSameSpecificLocation =
    previousShift.location === currentShift.location;

  const previousEndTime = getDateTimeValue(previousShift.end_time);
  const currentStartTime = getDateTimeValue(currentShift.start_time);

  return (
    isSameGuard &&
    isSameContractAddress &&
    isSameSpecificLocation &&
    previousEndTime === currentStartTime
  );
};

const createMergedShift = (
  shifts: ShiftWithAssignments[],
): ShiftWithAssignments => {
  const firstShift = shifts[0];
  const lastShift = shifts[shifts.length - 1];

  const assignmentMap = new Map<
    string,
    ShiftWithAssignments["assignments"][0]
  >();

  shifts.forEach((shift) => {
    shift.assignments.forEach((assignment) => {
      if (!assignmentMap.has(assignment.guard_id)) {
        assignmentMap.set(assignment.guard_id, {
          ...assignment,
          note:
            shifts.length > 1
              ? `${shifts.length} ca liên tục`
              : assignment.note,
        });
      }
    });
  });

  return {
    ...firstShift,
    shift_id: shifts.map((shift) => shift.shift_id).join("-"),
    shift_name: shifts.map((shift) => shift.shift_name).join(" + "),
    start_time: firstShift.start_time,
    end_time: lastShift.end_time,
    required_guards: firstShift.required_guards,
    assignments: Array.from(assignmentMap.values()),
  };
};

const createSegment = (
  groupedShifts: ShiftWithAssignments[],
  timeSlots: TimeSlot[],
): ShiftSegment | null => {
  const firstShift = groupedShifts[0];

  const startSlotId = getSlotIdByShift(firstShift);
  const startIndex = timeSlots.findIndex((slot) => slot.id === startSlotId);

  if (startIndex === -1) {
    return null;
  }

  return {
    id: groupedShifts.map((shift) => shift.shift_id).join("-"),
    startIndex,
    span: groupedShifts.length,
    shift: createMergedShift(groupedShifts),
  };
};

const buildShiftSegments = (
  contractAddress: string,
  shifts: ShiftWithAssignments[],
  timeSlots: TimeSlot[],
): ShiftSegment[] => {
  const locationShifts = shifts
    .filter((shift) => getShiftContractAddress(shift) === contractAddress)
    .filter((shift) => shift.assignments.length >= shift.required_guards)
    .sort(
      (a, b) => getDateTimeValue(a.start_time) - getDateTimeValue(b.start_time),
    );

  const segments: ShiftSegment[] = [];
  let currentGroup: ShiftWithAssignments[] = [];

  locationShifts.forEach((shift) => {
    if (currentGroup.length === 0) {
      currentGroup = [shift];
      return;
    }

    const previousShift = currentGroup[currentGroup.length - 1];

    if (isContinuousShift(previousShift, shift)) {
      currentGroup.push(shift);
      return;
    }

    const segment = createSegment(currentGroup, timeSlots);

    if (segment) {
      segments.push(segment);
    }

    currentGroup = [shift];
  });

  if (currentGroup.length > 0) {
    const segment = createSegment(currentGroup, timeSlots);

    if (segment) {
      segments.push(segment);
    }
  }

  return segments;
};

export function ShiftScheduleTable({
  viewMode = "day",
  locations,
  shifts,
  selectedLocation = "all",
  weekStartDate,
}: ShiftScheduleTableProps) {
  if (viewMode === "week") {
    return (
      <ShiftWeekScheduleTable
        shifts={shifts}
        selectedLocation={selectedLocation}
        weekStartDate={weekStartDate}
      />
    );
  }

  const displayLocations =
    selectedLocation === "all"
      ? locations
      : locations.filter((location) => location === selectedLocation);

  const visibleShifts = shifts.filter((shift) =>
    displayLocations.includes(getShiftContractAddress(shift)),
  );

  const displayTimeSlots = getDisplayTimeSlots(visibleShifts);

  if (visibleShifts.length === 0 || displayTimeSlots.length === 0) {
    return (
      <div className="rounded-sm border border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-500">
          Không có ca trực trong ngày này.
        </p>
      </div>
    );
  }

  const tableWidth =
    LOCATION_COLUMN_WIDTH + displayTimeSlots.length * TIME_SLOT_COLUMN_WIDTH;

  const gridTemplateColumns = `${LOCATION_COLUMN_WIDTH}px repeat(${displayTimeSlots.length}, ${TIME_SLOT_COLUMN_WIDTH}px)`;

  const emptyShiftMap = new Map<string, ShiftWithAssignments>();

  visibleShifts.forEach((shift) => {
    const isEmpty = shift.assignments.length < shift.required_guards;

    if (!isEmpty) {
      return;
    }

    const contractAddress = getShiftContractAddress(shift);
    const slotId = getSlotIdByShift(shift);
    const key = getShiftCellKey(contractAddress, slotId);

    emptyShiftMap.set(key, shift);
  });

  return (
    <div className="relative overflow-x-auto rounded-sm border border-slate-300 bg-white">
      <div style={{ width: `${tableWidth}px` }}>
        <div
          className="grid bg-blue-100"
          style={{
            gridTemplateColumns,
          }}
        >
          <div className="sticky left-0 z-30 border-r border-slate-300 bg-blue-100 p-4 font-bold text-slate-900">
            ĐỊA ĐIỂM / VỊ TRÍ
          </div>

          {displayTimeSlots.map((slot) => (
            <div
              key={slot.id}
              className="border-r border-slate-300 p-4 text-center font-bold text-slate-900 last:border-r-0"
            >
              {slot.label}
            </div>
          ))}
        </div>

        {displayLocations.map((contractAddress) => {
          const segments = buildShiftSegments(
            contractAddress,
            visibleShifts,
            displayTimeSlots,
          );

          return (
            <div
              key={contractAddress}
              className="grid border-t border-slate-300"
              style={{
                gridTemplateColumns,
              }}
            >
              <div
                className="sticky left-0 z-20 min-h-[130px] border-r border-slate-300 bg-white p-4"
                style={{
                  gridColumn: 1,
                  gridRow: 1,
                }}
              >
                <p className="font-semibold text-slate-900">
                  {contractAddress}
                </p>
                <p className="mt-1 text-sm text-slate-500">Địa điểm hợp đồng</p>
              </div>

              {displayTimeSlots.map((slot, index) => {
                const key = getShiftCellKey(contractAddress, slot.id);
                const emptyShift = emptyShiftMap.get(key);

                return (
                  <div
                    key={slot.id}
                    className="min-h-[130px] border-r border-slate-300 p-2 last:border-r-0"
                    style={{
                      gridColumn: index + 2,
                      gridRow: 1,
                    }}
                  >
                    {emptyShift ? <ShiftCard shift={emptyShift} /> : null}
                  </div>
                );
              })}

              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="z-10 p-2"
                  style={{
                    gridColumn: `${segment.startIndex + 2} / span ${
                      segment.span
                    }`,
                    gridRow: 1,
                  }}
                >
                  <ShiftCard shift={segment.shift} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
