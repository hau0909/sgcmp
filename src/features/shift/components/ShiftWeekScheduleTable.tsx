"use client";

import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { getUserTimeZone, getUserLocale, formatDate, formatTime as formatTimeHelper } from "@/utils/dateTime";
import { useTranslation } from "@/components/providers/LanguageProvider";
import {
  AlertTriangle,
  CalendarX,
  Clock,
  MapPin,
  UserRound,
  SquarePen,
  Camera,
} from "lucide-react";
import type {
  ShiftAssignment,
  ShiftAssignmentStatus,
  ShiftWithAssignments,
} from "../type";
import { ShiftDetailModal } from "./ShiftDetailModal";


type ShiftWeekScheduleTableProps = {
  shifts: ShiftWithAssignments[];
  selectedLocation: string;
  weekStartDate?: string;
};

type WeekDay = {
  date: string;
  dayLabel: string;
  dateLabel: string;
  isToday: boolean;
};

type TooltipPosition = {
  top: number;
  left: number;
};

type WeekShiftTooltipProps = {
  shift: ShiftWithAssignments;
  statusLabel: string;
  hasReplacement: boolean;
  position: TooltipPosition;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function GuardSubTooltip({
  assignment,
  shift,
  position,
}: {
  assignment: ShiftAssignment;
  shift: ShiftWithAssignments;
  position: TooltipPosition;
}) {
  const { dict } = useTranslation();
  return createPortal(
    <div
      className="pointer-events-none fixed z-[10000] w-[300px] rounded-md border border-slate-200 bg-white p-4 text-left shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_week?.shift_name || "Tên ca trực"}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {shift.shift_name || (dict?.shift_week?.unupdated || "Chưa cập nhật")}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_week?.location || "Địa điểm"}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {shift.contract_address || (dict?.shift_week?.unupdated || "Chưa cập nhật")}
          </p>
          {shift.location && (
            <p className="mt-0.5 text-xs text-slate-500">
              {dict?.shift_week?.position || "Vị trí"}: {shift.location}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_week?.checkin_image || "Ảnh điểm danh"}
          </p>
          {assignment.checkin_image ? (
            <div className="mt-2 relative aspect-video w-full overflow-hidden rounded border border-slate-200">
              <img
                src={assignment.checkin_image.image_url}
                alt={dict?.shift_week?.checkin_image || "Ảnh điểm danh"}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-2 flex aspect-video w-full flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 text-slate-400">
              <Camera size={24} className="text-slate-300" />
              <span className="mt-1.5 text-xs text-slate-500 font-medium">{dict?.shift_week?.no_checkin_image || "Chưa có ảnh điểm danh"}</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function GuardRow({
  assignment,
  shift,
}: {
  assignment: ShiftAssignment;
  shift: ShiftWithAssignments;
}) {
  const { dict } = useTranslation();
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [showSubTooltip, setShowSubTooltip] = useState(false);
  const [subTooltipPosition, setSubTooltipPosition] = useState<TooltipPosition | null>(null);

  const handleMouseEnter = () => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();

    let left = rect.right + 12;
    let top = rect.top;
    if (left + 300 > window.innerWidth - 12) {
      left = rect.left - 300 - 12;
    }
    setSubTooltipPosition({ top, left });
    setShowSubTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowSubTooltip(false);
  };

  return (
    <>
      <div
        ref={rowRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center justify-between gap-3 rounded bg-slate-50 px-2 py-1.5 hover:bg-blue-50 cursor-pointer transition-colors"
      >
        <div className="flex min-w-0 items-center gap-2">
          <UserRound size={15} className="shrink-0 text-slate-500" />

          <p className="truncate text-sm font-medium text-slate-800">
            {assignment.guard_name || (dict?.shift_week?.unupdated || "Chưa cập nhật")}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusStyle(
            assignment.status,
          )}`}
        >
          {getStatusLabel(assignment.status, dict)}
        </span>
      </div>

      {showSubTooltip && subTooltipPosition && (
        <GuardSubTooltip
          assignment={assignment}
          shift={shift}
          position={subTooltipPosition}
        />
      )}
    </>
  );
}

type WeekShiftCardProps = {
  shift: ShiftWithAssignments;
  onShiftClick: (shift: ShiftWithAssignments) => void;
};

const TOOLTIP_WIDTH = 340;
const TOOLTIP_GAP = 12;
const WEEK_DAY_COLUMN_WIDTH = 240;

function ReplacementGuardRow({
  repGuard,
  assignment,
  shift,
}: {
  repGuard: {
    guard_id: string;
    full_name: string;
    phone_number: string | null;
  };
  assignment: ShiftAssignment;
  shift: ShiftWithAssignments;
}) {
  const { dict } = useTranslation();
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [showSubTooltip, setShowSubTooltip] = useState(false);
  const [subTooltipPosition, setSubTooltipPosition] = useState<TooltipPosition | null>(null);

  const handleMouseEnter = () => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();

    let left = rect.right + 12;
    let top = rect.top;
    if (left + 300 > window.innerWidth - 12) {
      left = rect.left - 300 - 12;
    }
    setSubTooltipPosition({ top, left });
    setShowSubTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowSubTooltip(false);
  };

  return (
    <>
      <div
        ref={rowRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="ml-4 flex items-center justify-between gap-3 rounded bg-purple-50/50 px-2 py-1.5 border border-purple-100/50 hover:bg-purple-100/80 cursor-pointer transition-colors"
      >
        <div className="flex min-w-0 items-center gap-2">
          <UserRound size={13} className="shrink-0 text-purple-600" />
          <p className="truncate text-xs font-semibold text-purple-900">
            {repGuard.full_name}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-700">
          {dict?.shift_week?.replacement || "Thay thế"}
        </span>
      </div>

      {showSubTooltip && subTooltipPosition && (
        <GuardSubTooltip
          assignment={assignment}
          shift={shift}
          position={subTooltipPosition}
        />
      )}
    </>
  );
}

const getWeekDayLabels = (locale: string) => {
  const baseDate = new Date(Date.UTC(2026, 0, 5)); // 2026-01-05 is a Monday
  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(baseDate);
    date.setUTCDate(baseDate.getUTCDate() + i);
    return date.toLocaleDateString(locale, { weekday: "short" }).toUpperCase();
  });
};

const getStatusLabel = (status: ShiftAssignmentStatus, dict?: any) => {
  if (status === "assigned") {
    return dict?.coor_schedules?.assigned || "Đã phân công";
  }

  if (status === "completed") {
    return dict?.coor_schedules?.completed || dict?.coor_schedules?.on_duty || "Hoàn thành";
  }

  if (status === "late") {
    return dict?.coor_schedules?.late || "Đi trễ";
  }

  return dict?.coor_schedules?.absent || "Vắng mặt";
};

const getStatusStyle = (status: ShiftAssignmentStatus) => {
  if (status === "assigned") {
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  }

  if (status === "completed") {
    return "bg-emerald-100 text-emerald-700 border-emerald-300";
  }

  if (status === "late") {
    return "bg-amber-100 text-amber-700 border-amber-300";
  }

  return "bg-red-100 text-red-700 border-red-300";
};

const formatTime = (date: string) => {
  return formatTimeHelper(date);
};

const getLocalDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: getUserTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
};

const createUtcDateFromDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const formatUtcDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getStartOfWeekKey = (dateKey: string) => {
  const date = createUtcDateFromDateKey(dateKey);
  const day = date.getUTCDay();

  const diff = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + diff);

  return formatUtcDateKey(date);
};

const buildWeekDays = (weekStartDate?: string, locale?: string): WeekDay[] => {
  const userLocale = locale || getUserLocale();
  const weekDayLabels = getWeekDayLabels(userLocale);
  const todayKey = getLocalDateKey(new Date());

  const baseDateKey = weekStartDate ?? todayKey;
  const startOfWeekKey = getStartOfWeekKey(baseDateKey);
  const startOfWeek = createUtcDateFromDateKey(startOfWeekKey);

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(startOfWeek);

    date.setUTCDate(startOfWeek.getUTCDate() + index);

    const dateKey = formatUtcDateKey(date);
    const dateLabel = new Intl.DateTimeFormat(userLocale, {
      day: "numeric",
      month: "numeric",
    }).format(new Date(`${dateKey}T00:00:00`));

    return {
      date: dateKey,
      dayLabel: weekDayLabels[index],
      dateLabel,
      isToday: dateKey === todayKey,
    };
  });
};

const getShiftDateKey = (date: string) => {
  return getLocalDateKey(new Date(date));
};

const getDateTimeValue = (date: string) => {
  return new Date(date).getTime();
};

const getShiftContractAddress = (shift: ShiftWithAssignments, dict?: any) => {
  return shift.contract_address || (dict?.shift_schedule_table?.unupdated_location || "Chưa cập nhật địa điểm hợp đồng");
};

const getMainGuardName = (assignment: ShiftAssignment | undefined, dict?: any) => {
  return assignment?.guard_name || (dict?.shift_week?.unupdated || "Chưa cập nhật");
};

const getTooltipPosition = (element: HTMLButtonElement): TooltipPosition => {
  const rect = element.getBoundingClientRect();

  let left = rect.right + TOOLTIP_GAP;
  let top = rect.top;

  if (left + TOOLTIP_WIDTH > window.innerWidth - TOOLTIP_GAP) {
    left = rect.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
  }

  if (left < TOOLTIP_GAP) {
    left = TOOLTIP_GAP;
  }

  if (top < TOOLTIP_GAP) {
    top = TOOLTIP_GAP;
  }

  return {
    top,
    left,
  };
};

function WeekShiftTooltip({
  shift,
  statusLabel,
  hasReplacement,
  position,
  onMouseEnter,
  onMouseLeave,
}: WeekShiftTooltipProps) {
  const { dict } = useTranslation();
  const firstAssignment = shift.assignments[0];
  return createPortal(
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="pointer-events-auto fixed z-[9999] max-h-[520px] w-[340px] overflow-y-auto rounded-md border border-slate-200 bg-white p-4 text-left shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_week?.status || "Trạng thái"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusStyle(
                firstAssignment.status,
              )}`}
            >
              {statusLabel}
            </span>
            {hasReplacement && (
              <span className="rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                {dict?.shift_week?.replacement || "Thay thế"}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_week?.shift_time || "Thời gian ca trực"}
          </p>

          <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-800">
            <Clock size={15} />
            <span>
              {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {(dict?.shift_week?.assigned_guards || "Bảo vệ trực ({0}/{1})").replace("{0}", String(shift.assignments.length)).replace("{1}", String(shift.required_guards))}
          </p>

          <div className="mt-2 space-y-1.5">
            {shift.assignments.map((assignment) => (
              <div key={assignment.assignment_id} className="space-y-1">
                <GuardRow
                  assignment={assignment}
                  shift={shift}
                />
                {assignment.replacement_guards && assignment.replacement_guards.map((rep) => (
                  <ReplacementGuardRow
                    key={rep.guard_id}
                    repGuard={rep}
                    assignment={assignment}
                    shift={shift}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_week?.shift_name || "Tên ca trực"}
          </p>

          <div className="mt-1 flex items-start gap-2 text-sm text-slate-800">
            <SquarePen size={15} className="mt-0.5 shrink-0" />
            <span>{shift.shift_name || (dict?.shift_week?.unupdated || "Chưa cập nhật")}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_schedule_table?.contract_location_subtitle || "Địa điểm hợp đồng"}
          </p>

          <div className="mt-1 flex items-start gap-2 text-sm text-slate-800 min-w-0">
            <MapPin size={15} className="mt-0.5 shrink-0" />
            <span className="break-words whitespace-normal min-w-0 flex-1">{getShiftContractAddress(shift, dict)}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            {dict?.shift_week?.specific_location || "Vị trí trực cụ thể"}
          </p>

          <div className="mt-1 flex items-start gap-2 text-sm text-slate-800 min-w-0">
            <MapPin size={15} className="mt-0.5 shrink-0" />
            <span className="break-words whitespace-normal min-w-0 flex-1">{shift.location || (dict?.shift_week?.unupdated_position || "Chưa cập nhật vị trí trực")}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ShiftWeekScheduleTable({
  shifts,
  selectedLocation,
  weekStartDate,
}: ShiftWeekScheduleTableProps) {
  const [selectedShift, setSelectedShift] = useState<ShiftWithAssignments | null>(null);
  const { dict, locale: appLocale } = useTranslation();
  const bcp47Locale = appLocale === "en" ? "en-US" : "vi-VN";
  const weekDays = buildWeekDays(weekStartDate, bcp47Locale);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const filteredShifts = shifts
    .filter((shift) => {
      if (selectedLocation === "all") {
        return true;
      }

      return getShiftContractAddress(shift, dict) === selectedLocation;
    })
    .sort(
      (a, b) => getDateTimeValue(a.start_time) - getDateTimeValue(b.start_time),
    );

  const visibleWeekDays = weekDays
    .map((day) => ({
      ...day,
      shifts: filteredShifts.filter(
        (shift) => getShiftDateKey(shift.start_time) === day.date,
      ),
    }))
    .filter((day) => day.shifts.length > 0);

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      startX: event.pageX - scrollRef.current.offsetLeft,
      scrollLeft: scrollRef.current.scrollLeft,
    };

    setIsDragging(true);
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || !dragStateRef.current.isDragging) {
      return;
    }

    event.preventDefault();

    const x = event.pageX - scrollRef.current.offsetLeft;
    const walk = x - dragStateRef.current.startX;

    scrollRef.current.scrollLeft = dragStateRef.current.scrollLeft - walk;
  };

  const stopDragging = () => {
    dragStateRef.current.isDragging = false;
    setIsDragging(false);
  };

  if (visibleWeekDays.length === 0) {
    return (
      <div className="rounded-sm border border-slate-300 bg-white p-10 text-center text-slate-400">
        <CalendarX className="mx-auto" size={34} />
        <p className="mt-3 text-sm font-semibold">
          {dict?.shift_week?.no_shifts_this_week || "Không có ca trực trong tuần này"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`overflow-x-auto overflow-y-visible rounded-sm border border-slate-300 bg-white ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
      >
        <div
          style={{
            width: `${WEEK_DAY_COLUMN_WIDTH * visibleWeekDays.length}px`,
          }}
        >
          <div
            className="grid border-b border-slate-300"
            style={{
              gridTemplateColumns: `repeat(${visibleWeekDays.length}, ${WEEK_DAY_COLUMN_WIDTH}px)`,
            }}
          >
            {visibleWeekDays.map((day) => (
              <div
                key={day.date}
                className={`border-r border-slate-300 px-4 py-3 text-center ${day.isToday ? "bg-blue-700 text-white" : "bg-slate-100"
                  }`}
              >
                <p
                  className={`text-xs font-bold ${day.isToday ? "text-white" : "text-slate-600"
                    }`}
                >
                  {day.dayLabel}
                </p>

                <p
                  className={`text-xl font-bold ${day.isToday ? "text-white" : "text-slate-900"
                    }`}
                >
                  {day.dateLabel}
                </p>
              </div>
            ))}
          </div>

          <div
            className="grid min-h-[640px]"
            style={{
              gridTemplateColumns: `repeat(${visibleWeekDays.length}, ${WEEK_DAY_COLUMN_WIDTH}px)`,
            }}
          >
            {visibleWeekDays.map((day) => (
              <div
                key={day.date}
                className="min-h-[640px] border-r border-slate-300 bg-white p-3"
              >
                <div className="space-y-3">
                  {day.shifts.map((shift) => (
                    <WeekShiftCard
                      key={shift.shift_id}
                      shift={shift}
                      onShiftClick={(s) => setSelectedShift(s)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedShift && (
        <ShiftDetailModal
          open={!!selectedShift}
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </>
  );
}

function WeekShiftCard({ shift, onShiftClick }: WeekShiftCardProps) {
  const { dict } = useTranslation();
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);

  const isEmpty = shift.assignments.length < shift.required_guards;

  if (isEmpty) {
    return (
      <button
        type="button"
        onClick={() => onShiftClick(shift)}
        className="w-full rounded-md border border-dashed border-orange-400 bg-orange-50 px-3 py-2 text-left text-orange-700"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="whitespace-nowrap text-xs font-bold">
            {dict.coor_schedules?.no_guard_assigned || "CHƯA PHÂN CÔNG"}
          </p>
          <AlertTriangle size={14} />
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
          <Clock size={12} />
          <span className="whitespace-nowrap">
            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium min-w-0">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate" title={shift.location}>{shift.location}</span>
        </div>
      </button>
    );
  }

  const firstAssignment = shift.assignments[0];
  const extraGuardCount = shift.assignments.length - 1;
  const hasReplacement = shift.assignments.some(
    (assign) =>
      (assign.replacement_guard_ids && assign.replacement_guard_ids.length > 0) ||
      (assign.replacement_guards && assign.replacement_guards.length > 0)
  );
  const statusLabel = getStatusLabel(firstAssignment.status, dict);

  const [showTooltip, setShowTooltip] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (cardRef.current) {
      setTooltipPosition(getTooltipPosition(cardRef.current));
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  return (
    <>
      <button
        ref={cardRef}
        type="button"
        onClick={() => onShiftClick(shift)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full rounded-md border border-blue-200 bg-blue-100 px-3 py-2 text-left text-blue-900 shadow-sm transition-all duration-300 hover:bg-blue-200"
      >
        <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusStyle(
              firstAssignment.status,
            )}`}
          >
            {statusLabel}
          </span>
          {hasReplacement && (
            <span className="shrink-0 rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
              {dict?.shift_week?.replacement || "Thay thế"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-visible">
          <UserRound size={14} className="shrink-0" />

          <p className="whitespace-nowrap text-sm font-bold leading-5 text-blue-900">
            {getMainGuardName(firstAssignment, dict)}
            {extraGuardCount > 0 ? (
              <span className="ml-1 font-bold text-blue-700">
                +{extraGuardCount}
              </span>
            ) : null}
          </p>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-blue-800">
          <Clock size={13} className="shrink-0" />
          <span className="whitespace-nowrap">
            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
          <SquarePen size={12} className="shrink-0" />
          <span className="whitespace-nowrap">{shift.shift_name}</span>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-blue-700 min-w-0">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate" title={shift.location}>{shift.location}</span>
        </div>
      </button>

      {showTooltip && tooltipPosition ? (
        <WeekShiftTooltip
          shift={shift}
          statusLabel={statusLabel}
          hasReplacement={hasReplacement}
          position={tooltipPosition}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      ) : null}
    </>
  );
}
