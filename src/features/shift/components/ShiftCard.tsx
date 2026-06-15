import { MapPin, MoreVertical, UserRound } from "lucide-react";
import type { ShiftAssignmentStatus, ShiftWithAssignments } from "../type";
import { getShiftStyle } from "../utils/shift.utils";

type ShiftCardProps = {
  shift: ShiftWithAssignments;
};

const getStatusLabel = (status: ShiftAssignmentStatus) => {
  if (status === "assigned") {
    return "Đã phân công";
  }

  if (status === "completed") {
    return "Hoàn thành";
  }

  return "Vắng mặt";
};

const getStatusStyle = (status: ShiftAssignmentStatus) => {
  if (status === "assigned") {
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  }

  if (status === "completed") {
    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  }

  return "bg-red-100 text-red-700 border-red-300";
};

export function ShiftCard({ shift }: ShiftCardProps) {
  const isEmpty = shift.assignments.length < shift.required_guards;

  if (isEmpty) {
    return (
      <button
        type="button"
        className="flex h-full min-h-[58px] w-full items-center justify-center rounded-md border border-dashed border-red-400 bg-red-50 text-sm font-medium text-red-500 hover:bg-red-100"
      >
        Trống lịch
      </button>
    );
  }

  const assignment = shift.assignments[0];

  return (
    <div
      className={`flex h-full w-full flex-col justify-between rounded-md border p-3 shadow-sm ${getShiftStyle(
        shift.shift_name,
      )}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusStyle(
            assignment.status,
          )}`}
        >
          {getStatusLabel(assignment.status)}
        </span>

        <button type="button" className="text-slate-500 hover:text-slate-800">
          <MoreVertical size={15} />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <UserRound size={17} />

          <p className="font-semibold text-slate-900">
            {assignment.guard_name}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <MapPin size={14} />

          <p className="line-clamp-1">{shift.location}</p>
        </div>
      </div>
    </div>
  );
}
