"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import type { DateRange } from "../types";

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_NAMES = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function toDateOnly(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function formatVN(d: Date) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

// ─── CalendarMonth ────────────────────────────────────────────────────────────

type CalendarMonthProps = {
    year: number;
    month: number;
    range: DateRange;
    hovered: Date | null;
    onDayClick: (d: Date) => void;
    onDayHover: (d: Date | null) => void;
};

function CalendarMonth({
    year,
    month,
    range,
    hovered,
    onDayClick,
    onDayHover,
}: CalendarMonthProps) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDow = getFirstDayOfWeek(year, month);
    const cells: (Date | null)[] = [];

    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    const effectiveEnd = range.start && !range.end && hovered ? hovered : range.end;

    function dayState(d: Date) {
        const { start } = range;
        const eff = effectiveEnd;

        const rangeStart = start && eff ? (start <= eff ? start : eff) : start;
        const rangeEnd = start && eff ? (start <= eff ? eff : start) : null;

        const isStart = !!rangeStart && isSameDay(d, rangeStart);
        const isEnd = !!rangeEnd && isSameDay(d, rangeEnd);
        const inRange =
            !!rangeStart && !!rangeEnd && d > rangeStart && d < rangeEnd;

        return { isStart, isEnd, inRange };
    }

    return (
        <div className="min-w-[240px]">
            <p className="mb-3 text-center text-sm font-semibold text-slate-800">
                {MONTH_NAMES[month]} {year}
            </p>

            <div className="grid grid-cols-7 gap-y-1">
                {WEEKDAYS.map((wd) => (
                    <div
                        key={wd}
                        className="py-1 text-center text-[11px] font-semibold text-slate-400"
                    >
                        {wd}
                    </div>
                ))}

                {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;

                    const { isStart, isEnd, inRange } = dayState(day);
                    const today = isSameDay(day, toDateOnly(new Date()));
                    const highlight = isStart || isEnd;

                    const bg = highlight
                        ? "bg-blue-600 text-white font-semibold rounded-lg"
                        : inRange
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-100 rounded-lg";

                    const roundLeft = isStart ? "rounded-l-lg" : "";
                    const roundRight = isEnd ? "rounded-r-lg" : "";

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => onDayClick(toDateOnly(day))}
                            onMouseEnter={() => onDayHover(toDateOnly(day))}
                            onMouseLeave={() => onDayHover(null)}
                            className={`
                                relative flex h-8 w-full cursor-pointer items-center justify-center
                                text-xs transition select-none
                                ${inRange ? `${roundLeft} ${roundRight}` : ""}
                                ${bg}
                            `}
                        >
                            {day.getDate()}
                            {today && !highlight && (
                                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────

type DateRangePickerProps = {
    value: DateRange;
    onChange: (range: DateRange) => void;
};

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const today = toDateOnly(new Date());
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState<Date | null>(null);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const rightMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const rightYear = viewMonth === 11 ? viewYear + 1 : viewYear;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    function handleDayClick(d: Date) {
        if (!value.start || (value.start && value.end)) {
            onChange({ start: d, end: null });
        } else {
            if (d < value.start) {
                onChange({ start: d, end: value.start });
            } else {
                onChange({ start: value.start, end: d });
            }
            setOpen(false);
            setHovered(null);
        }
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
        else setViewMonth((m) => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
        else setViewMonth((m) => m + 1);
    }

    function clearRange() {
        onChange({ start: null, end: null });
    }

    const displayText = useMemo(() => {
        if (value.start && value.end) return `${formatVN(value.start)} - ${formatVN(value.end)}`;
        if (value.start) return `${formatVN(value.start)} - ...`;
        return "Chọn khoảng thời gian";
    }, [value]);

    const hasValue = !!(value.start || value.end);

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`flex h-11 w-full items-center gap-2 rounded-lg border px-3 text-sm transition
                    ${open
                        ? "border-blue-500 bg-white ring-2 ring-blue-100"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400"
                    }
                    ${hasValue ? "text-slate-900" : "text-slate-400"}
                `}
            >
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="flex-1 text-left">{displayText}</span>
                {hasValue ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearRange(); }}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                ) : (
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                )}
            </button>

            {/* Popover */}
            {open && (
                <div
                    ref={popoverRef}
                    className="absolute left-0 top-[calc(100%+6px)] z-50 w-max rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
                >
                    {/* Navigation */}
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex gap-8">
                            <span className="text-sm font-semibold text-slate-700">
                                {MONTH_NAMES[viewMonth]} {viewYear}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">
                                {MONTH_NAMES[rightMonth]} {rightYear}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Two calendars */}
                    <div className="flex gap-6">
                        <CalendarMonth
                            year={viewYear}
                            month={viewMonth}
                            range={value}
                            hovered={hovered}
                            onDayClick={handleDayClick}
                            onDayHover={setHovered}
                        />
                        <div className="w-px self-stretch bg-slate-100" />
                        <CalendarMonth
                            year={rightYear}
                            month={rightMonth}
                            range={value}
                            hovered={hovered}
                            onDayClick={handleDayClick}
                            onDayHover={setHovered}
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <p className="text-xs text-slate-500">
                            {!value.start
                                ? "Chọn ngày bắt đầu"
                                : !value.end
                                    ? "Chọn ngày kết thúc"
                                    : `${formatVN(value.start)} → ${formatVN(value.end)}`}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={clearRange}
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                                Xóa
                            </button>
                            <button
                                type="button"
                                disabled={!value.start || !value.end}
                                onClick={() => setOpen(false)}
                                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
