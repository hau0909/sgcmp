"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, MapPin, MoreVertical, UserRound } from "lucide-react";
import type {
  ShiftAssignment,
  ShiftAssignmentStatus,
  ShiftWithAssignments,
} from "../type";
import { getShiftStyle } from "../utils/shift.utils";

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
  position: TooltipPosition;
};

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const TOOLTIP_WIDTH = 340;
const TOOLTIP_GAP = 12;

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

const formatTime = (date: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
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

function ShiftTooltip({ shift, statusLabel, position }: ShiftTooltipProps) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999] w-[340px] rounded-md border border-slate-200 bg-white p-4 text-left shadow-2xl"
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
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {statusLabel}
          </p>
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
              <div
                key={assignment.assignment_id}
                className="flex items-center justify-between gap-3 rounded bg-slate-50 px-2 py-1.5"
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
            ))}
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
  const statusLabel = getStatusLabel(firstAssignment.status);

  const handleMouseEnter = () => {
    if (!cardRef.current) {
      return;
    }

    setTooltipPosition(getTooltipPosition(cardRef.current));
  };

  const handleMouseLeave = () => {
    setTooltipPosition(null);
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative hover:bg-blue-200 transition-all duration-300 cursor-pointer flex h-full w-full flex-col justify-between rounded-md border p-3 shadow-sm ${getShiftStyle(
          shift.shift_name,
        )}`}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <span
            className={`w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusStyle(
              firstAssignment.status,
            )}`}
          >
            {statusLabel}
          </span>

          <button type="button" className="text-slate-500 hover:text-slate-800">
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
            <MapPin size={14} />

            <p className="line-clamp-1">{shift.location}</p>
          </div>
        </div>
      </div>

      {tooltipPosition ? (
        <ShiftTooltip
          shift={shift}
          statusLabel={statusLabel}
          position={tooltipPosition}
        />
      ) : null}
    </>
  );
}
