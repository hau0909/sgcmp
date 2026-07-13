"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShiftDetailModal } from "./ShiftDetailModal";
import {
  Clock,
  MapPin,
  MoreVertical,
  UserRound,
  SquarePen,
  Camera,
} from "lucide-react";
import type {
  ShiftAssignment,
  ShiftAssignmentStatus,
  ShiftWithAssignments,
} from "../type";
import { getShiftStyle } from "../utils/shift.utils";
import { formatTime as formatTimeHelper } from "@/utils/dateTime";

type ShiftCardProps = {
  shift: ShiftWithAssignments;
};

type TooltipPosition = {
  top: number;
  left: number;
};

type ShiftTooltipProps = {
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
            Tên ca trực
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {shift.shift_name || "Chưa cập nhật"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Địa điểm
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {shift.contract_address || "Chưa cập nhật"}
          </p>
          {shift.location && (
            <p className="mt-0.5 text-xs text-slate-500">
              Vị trí: {shift.location}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Ảnh điểm danh
          </p>
          {assignment.checkin_image ? (
            <div className="mt-2 relative aspect-video w-full overflow-hidden rounded border border-slate-200">
              <img
                src={assignment.checkin_image.image_url}
                alt="Ảnh điểm danh"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-2 flex aspect-video w-full flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 text-slate-400">
              <Camera size={24} className="text-slate-300" />
              <span className="mt-1.5 text-xs text-slate-500 font-medium">Chưa có ảnh điểm danh</span>
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
            {assignment.guard_name || "Chưa cập nhật"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusStyle(
            assignment.status,
          )}`}
        >
          {getStatusLabel(assignment.status)}
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

const TOOLTIP_WIDTH = 340;
const TOOLTIP_GAP = 12;

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
          Thay thế
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

const getStatusLabel = (status: ShiftAssignmentStatus) => {
  if (status === "assigned") {
    return "Đã phân công";
  }

  if (status === "completed") {
    return "Đang trực";
  }

  if (status === "late") {
    return "Đi trễ";
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

  if (status === "late") {
    return "bg-amber-100 text-amber-700 border-amber-300";
  }

  return "bg-red-100 text-red-700 border-red-300";
};

const formatTime = (date: string) => {
  return formatTimeHelper(date);
};

const getContractAddress = (shift: ShiftWithAssignments) => {
  return shift.contract_address || "Chưa cập nhật địa điểm hợp đồng";
};

const getMainGuardName = (assignment: ShiftAssignment | undefined) => {
  return assignment?.guard_name || "Chưa cập nhật";
};

const getTooltipPosition = (element: HTMLDivElement): TooltipPosition => {
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

function ShiftTooltip({ shift, statusLabel, hasReplacement, position, onMouseEnter, onMouseLeave }: ShiftTooltipProps) {
  const firstAssignment = shift.assignments[0];
  return createPortal(
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="pointer-events-auto fixed z-[9999] w-[340px] rounded-md border border-slate-200 bg-white p-4 text-left shadow-2xl"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Trạng thái
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusStyle(
                firstAssignment.status,
              )}`}
            >
              {statusLabel}
            </span>
            {hasReplacement && (
              <span className="rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                Thay thế
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Thời gian ca trực
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
            Bảo vệ trực ({shift.assignments.length}/{shift.required_guards})
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
            Tên ca trực
          </p>
          <div className="mt-1 flex items-start gap-2 text-sm text-slate-800">
            <SquarePen size={15} className="mt-0.5 shrink-0" />
            <span>{shift.shift_name || "Chưa cập nhật"} </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Địa điểm hợp đồng
          </p>
          <div className="mt-1 flex items-start gap-2 text-sm text-slate-800">
            <MapPin size={15} className="mt-0.5 shrink-0" />
            <span>{getContractAddress(shift)}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">
            Vị trí trực cụ thể
          </p>
          <div className="mt-1 flex items-start gap-2 text-sm text-slate-800">
            <MapPin size={15} className="mt-0.5 shrink-0" />
            <span>{shift.location || "Chưa cập nhật vị trí trực"}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ShiftCard({ shift }: ShiftCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const firstAssignment = shift.assignments[0];
  const extraGuardCount = shift.assignments.length - 1;
  const hasReplacement = shift.assignments.some(
    (assign) =>
      (assign.replacement_guard_ids && assign.replacement_guard_ids.length > 0) ||
      (assign.replacement_guards && assign.replacement_guards.length > 0)
  );
  const statusLabel = getStatusLabel(firstAssignment.status);

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
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          setShowTooltip(false);
          setIsDetailOpen(true);
        }}
        className={`relative hover:bg-blue-200 transition-all duration-300 cursor-pointer flex h-full w-full flex-col justify-between rounded-md border p-3 shadow-sm ${getShiftStyle(
          shift.shift_name,
        )}`}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusStyle(
                firstAssignment.status,
              )}`}
            >
              {statusLabel}
            </span>
            {hasReplacement && (
              <span className="w-fit rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                Thay thế
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailOpen(true);
            }}
            className="text-slate-500 hover:text-slate-800"
          >
            <MoreVertical size={15} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserRound size={17} />

            <p className="line-clamp-1 font-semibold text-slate-900">
              {getMainGuardName(firstAssignment)}
              {extraGuardCount > 0 ? (
                <span className="ml-1 font-bold text-blue-700">
                  +{extraGuardCount}
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <SquarePen size={14} />

            <p className="line-clamp-1">{shift.shift_name}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} />

            <p className="line-clamp-1">{shift.location}</p>
          </div>
        </div>
      </div>

      {showTooltip && tooltipPosition && !isDetailOpen ? (
        <ShiftTooltip
          shift={shift}
          statusLabel={statusLabel}
          hasReplacement={hasReplacement}
          position={tooltipPosition}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      ) : null}

      <ShiftDetailModal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        shift={shift}
      />
    </>
  );
}
