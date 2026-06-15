import type { ShiftWithAssignments, TimeSlot } from "../type";
import { getShiftCellKey, getSlotIdByShift } from "../utils/shift.utils";
import { ShiftCard } from "./ShiftCard";

type ShiftScheduleTableProps = {
  timeSlots: TimeSlot[];
  locations: string[];
  shifts: ShiftWithAssignments[];
};

type ShiftSegment = {
  id: string;
  startIndex: number;
  span: number;
  shift: ShiftWithAssignments;
};

const LOCATION_COLUMN_WIDTH = 220;
const TIME_SLOT_COLUMN_WIDTH = 220;

const getDateTimeValue = (date: string) => {
  return new Date(date).getTime();
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
  const isSameLocation = previousShift.location === currentShift.location;

  const previousEndTime = getDateTimeValue(previousShift.end_time);
  const currentStartTime = getDateTimeValue(currentShift.start_time);

  return isSameGuard && isSameLocation && previousEndTime === currentStartTime;
};

const createMergedShift = (
  shifts: ShiftWithAssignments[],
): ShiftWithAssignments => {
  const firstShift = shifts[0];
  const lastShift = shifts[shifts.length - 1];
  const firstAssignment = firstShift.assignments[0];

  return {
    ...firstShift,
    shift_id: shifts.map((shift) => shift.shift_id).join("-"),
    shift_name: shifts.map((shift) => shift.shift_name).join(" + "),
    start_time: firstShift.start_time,
    end_time: lastShift.end_time,
    required_guards: 1,
    assignments: [
      {
        ...firstAssignment,
        note:
          shifts.length > 1
            ? `${shifts.length} ca liên tục`
            : firstAssignment.note,
      },
    ],
  };
};

const buildShiftSegments = (
  location: string,
  shifts: ShiftWithAssignments[],
  timeSlots: TimeSlot[],
): ShiftSegment[] => {
  const locationShifts = shifts
    .filter((shift) => shift.location === location)
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

export function ShiftScheduleTable({
  timeSlots,
  locations,
  shifts,
}: ShiftScheduleTableProps) {
  const tableWidth =
    LOCATION_COLUMN_WIDTH + timeSlots.length * TIME_SLOT_COLUMN_WIDTH;

  const gridTemplateColumns = `${LOCATION_COLUMN_WIDTH}px repeat(${timeSlots.length}, ${TIME_SLOT_COLUMN_WIDTH}px)`;

  const emptyShiftMap = new Map<string, ShiftWithAssignments>();

  shifts.forEach((shift) => {
    const isEmpty = shift.assignments.length < shift.required_guards;

    if (!isEmpty) {
      return;
    }

    const slotId = getSlotIdByShift(shift);
    const key = getShiftCellKey(shift.location, slotId);

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
            MỤC TIÊU / VỊ TRÍ
          </div>

          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              className="border-r border-slate-300 p-4 text-center font-bold text-slate-900 last:border-r-0"
            >
              {slot.label}
            </div>
          ))}
        </div>

        {locations.map((location) => {
          const segments = buildShiftSegments(location, shifts, timeSlots);

          return (
            <div
              key={location}
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
                <p className="font-semibold text-slate-900">{location}</p>
                <p className="mt-1 text-sm text-slate-500">Vị trí trực</p>
              </div>

              {timeSlots.map((slot, index) => {
                const key = getShiftCellKey(location, slot.id);
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
