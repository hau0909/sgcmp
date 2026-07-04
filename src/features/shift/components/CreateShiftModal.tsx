"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  SquarePen,
  UserRound,
  X,
} from "lucide-react";

import type { GuardListItem } from "@/features/guards/type";
import { requestGetGuardsByContract } from "@/features/guards/api/guard.api";
import {
  requestCreateWorkShift,
  requestGetShiftContracts,
  requestGetGuardAvailability,
  requestGetLatestShiftDate,
  requestGetScheduledShiftDates,
} from "../api/shift.api";
import type {
  ContractOption,
  ShiftSlot,
  ShiftSlotConfigStatus,
  GuardShiftStatus,
  SplitShiftSegment,
} from "../type";
import {
  toMinutes,
  formatMinutesToTime,
  calculateDurationMinutes,
  validateSplitSegments,
  parseBookingSlot,
} from "../utils/shift.utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const GUARD_PAGE_SIZE = 10;
const MAX_SHIFT_HOURS = 8;

const DAY_LABEL_MAP: Record<string, number> = {
  // Vietnamese
  "thứ 2": 1, "thứ 3": 2, "thứ 4": 3, "thứ 5": 4, "thứ 6": 5, "thứ 7": 6, "chủ nhật": 0,
  // English
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0,
  // Numeric strings (stored as "1"–"7" in some DBs; 7 = Sunday)
  "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 0,
  // Numeric strings ISO (0 = Sunday, 1 = Monday…)
  "0": 0,
};

type PeriodUnit = "week" | "month" | "year";
type FilterMode = "all" | "available" | "conflict" | "unavailable";

// ─── Props ────────────────────────────────────────────────────────────────────

type CreateShiftModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateVN = (date: string) =>
  new Intl.DateTimeFormat("vi-VN").format(new Date(date));

const getGuardProfile = (profiles: GuardListItem["profiles"]) => {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
};

const diffMinutes = calculateDurationMinutes;

/** Add N minutes to "HH:mm" → "HH:mm" (wraps past midnight) */
const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/** Max allowed end time for a given start (8 h cap) */
const maxEnd = (start: string): string => addMinutes(start, MAX_SHIFT_HOURS * 60);

/** Format a Date object to local YYYY-MM-DD string */
const formatLocalDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** Next calendar date string */
const nextDate = (date: string): string => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
};

/** ISO string with +07:00 offset */
const toISO = (date: string, time: string): string =>
  `${date}T${time}:00+07:00`;

/**
 * Generate all dates in [contractStart, contractEnd] ∩ [contractStart, contractStart+period]
 * that match the target weekday numbers.
 */
const generateDates = (
  contractStart: string,
  contractEnd: string,
  targetDays: number[],
  unit: PeriodUnit,
  value: number,
): string[] => {
  const cStart = new Date(`${contractStart}T00:00:00`);
  const cEnd = new Date(`${contractEnd}T00:00:00`);

  const periodEnd = new Date(cStart);
  if (unit === "week") periodEnd.setDate(periodEnd.getDate() + value * 7);
  else if (unit === "month") periodEnd.setMonth(periodEnd.getMonth() + value);
  else periodEnd.setFullYear(periodEnd.getFullYear() + value);
  // Subtract 1 day to make the end date inclusive of the period duration
  periodEnd.setDate(periodEnd.getDate() - 1);

  const from = cStart;
  const to = periodEnd < cEnd ? periodEnd : cEnd;

  const dates: string[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    if (targetDays.includes(cur.getDay())) {
      dates.push(formatLocalDate(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

/**
 * Find the first date starting from baseDate (inclusive) up to endDate (inclusive)
 * that matches the target weekday numbers.
 */
const getNextValidWorkingDay = (
  baseDate: string,
  endDate: string,
  targetDays: number[],
): string | null => {
  try {
    const cEnd = new Date(`${endDate}T00:00:00`);
    const cur = new Date(`${baseDate}T00:00:00`);
    while (cur <= cEnd) {
      if (targetDays.includes(cur.getDay())) {
        return formatLocalDate(cur);
      }
      cur.setDate(cur.getDate() + 1);
    }
  } catch { }
  return null;
};

/** Auto-configure a single booking time slot string into a ShiftSlot */
const buildSlot = (raw: string, index: number): ShiftSlot => {
  const parsed = parseBookingSlot(raw);

  if (!parsed) {
    return {
      slotIndex: index,
      bookingTimeSlot: raw,
      bookingStart: "",
      bookingEnd: "",
      startTime: "",
      endTime: "",
      configStatus: "invalid",
      segments: [],
    };
  }

  const dur = diffMinutes(parsed.start, parsed.end);
  const exceedsMax = dur > MAX_SHIFT_HOURS * 60;

  const startMin = toMinutes(parsed.start);
  let endMin = toMinutes(parsed.end);
  if (endMin <= startMin) endMin += 24 * 60;

  const initialSegment: SplitShiftSegment = {
    id: Math.random().toString(36).substr(2, 9),
    startTime: parsed.start,
    endTime: exceedsMax ? "" : parsed.end,
    startMinutes: startMin,
    endMinutes: exceedsMax ? startMin : endMin,
    durationMinutes: exceedsMax ? 0 : dur,
  };

  return {
    slotIndex: index,
    bookingTimeSlot: raw,
    bookingStart: parsed.start,
    bookingEnd: parsed.end,
    startTime: parsed.start,            // always auto-set from booking
    endTime: exceedsMax ? "" : parsed.end, // blank when coordinator must adjust
    configStatus: exceedsMax ? "needs_adjustment" : "configured",
    segments: [initialSegment],
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const GuardListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="w-full rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="min-w-0 flex-1">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-64 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    ))}
  </div>
);

type InfoRowProps = { label: string; value: string };
const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="grid grid-cols-[130px_1fr] gap-4">
    <span className="whitespace-nowrap text-slate-500">{label}:</span>
    <span className="text-right font-medium leading-5 text-slate-800">{value}</span>
  </div>
);

// Status config for guard badges
const GUARD_STATUS_CFG: Record<
  GuardShiftStatus,
  { label: string; badge: string; dot: string }
> = {
  available: {
    label: "Sẵn sàng",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  selected: {
    label: "Đã chọn",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-600",
  },
  assigned: {
    label: "Đã phân công",
    badge: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  },
  conflict: {
    label: "Xung đột ca",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-500",
  },
  unavailable: {
    label: "Không khả dụng",
    badge: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

// Status config for slot badges


// ─── Main Component ───────────────────────────────────────────────────────────

export function CreateShiftModal({ open, onClose, onCreated }: CreateShiftModalProps) {
  // ── Contract & basic info ──────────────────────────────────────────────────
  const [contractId, setContractId] = useState("");
  const [shiftName, setShiftName] = useState("");
  const [location, setLocation] = useState("");
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [latestShiftDate, setLatestShiftDate] = useState<string | null>(null);
  const [isLoadingLatestDate, setIsLoadingLatestDate] = useState(false);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [isLoadingScheduledDates, setIsLoadingScheduledDates] = useState(false);

  // ── Free-time availability filters ─────────────────────────────────────────
  const [freeTimeMode, setFreeTimeMode] = useState<"shift" | "day" | "week" | "month" | "custom">("shift");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customStartTime, setCustomStartTime] = useState("00:00");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customEndTime, setCustomEndTime] = useState("23:59");

  // ── Shift slots (auto-populated from booking) ──────────────────────────────
  const [slots, setSlots] = useState<ShiftSlot[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // ── Period generation ──────────────────────────────────────────────────────
  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>("week");
  const [periodValue, setPeriodValue] = useState<number | "">(1);

  // ── Guard list ─────────────────────────────────────────────────────────────
  const [guards, setGuards] = useState<GuardListItem[]>([]);
  const [guardPage, setGuardPage] = useState(1);
  const [guardTotal, setGuardTotal] = useState(0);
  const [guardTotalPages, setGuardTotalPages] = useState(1);
  const [isLoadingGuards, setIsLoadingGuards] = useState(false);
  const [guardErrorMessage, setGuardErrorMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // ── Guard selection & conflict detection ──────────────────────────────────
  const [selectedGuardIds, setSelectedGuardIds] = useState<string[]>([]);
  // guardId → true means conflict exists for active slot
  const [conflictMap, setConflictMap] = useState<Record<string, boolean>>({});
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // ── Submission state ───────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [generationWarnings, setGenerationWarnings] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const conflictTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubmittingRef = useRef(false);

  // ── Derived values ─────────────────────────────────────────────────────────
  const selectedContract = useMemo(
    () => contracts.find((c) => c.contract_id === contractId),
    [contracts, contractId],
  );

  const requiredGuards = selectedContract?.guards_per_slot ?? 1;
  const activeSlot = slots[activeSlotIndex] ?? null;

  const configuredSlots = useMemo(
    () => slots.filter((s) => s.configStatus === "configured"),
    [slots],
  );
  const pendingSlots = useMemo(
    () => slots.filter((s) => s.configStatus === "needs_adjustment"),
    [slots],
  );

  const targetDays = useMemo<number[]>(() => {
    if (!selectedContract) return [];
    return (selectedContract.day_per_week ?? [])
      .map((d) => DAY_LABEL_MAP[d.toLowerCase().trim()])
      .filter((n): n is number => n !== undefined);
  }, [selectedContract]);

  const generationStartDate = useMemo<string>(() => {
    if (!selectedContract || targetDays.length === 0) return "";
    if (!latestShiftDate) {
      return getNextValidWorkingDay(
        selectedContract.start_date,
        selectedContract.end_date,
        targetDays,
      ) ?? "";
    }
    try {
      const dayAfterLatest = nextDate(latestShiftDate);
      return getNextValidWorkingDay(
        dayAfterLatest,
        selectedContract.end_date,
        targetDays,
      ) ?? "";
    } catch {
      return getNextValidWorkingDay(
        selectedContract.start_date,
        selectedContract.end_date,
        targetDays,
      ) ?? "";
    }
  }, [selectedContract, latestShiftDate, targetDays]);

  const totalContractWorkingDays = useMemo<number>(() => {
    if (!selectedContract || targetDays.length === 0) return 0;
    const cStart = new Date(`${selectedContract.start_date}T00:00:00`);
    const cEnd = new Date(`${selectedContract.end_date}T00:00:00`);
    let count = 0;
    const cur = new Date(cStart);
    while (cur <= cEnd) {
      if (targetDays.includes(cur.getDay())) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [selectedContract, targetDays]);

  const scheduledCount = useMemo<number>(() => {
    if (!selectedContract || targetDays.length === 0 || scheduledDates.length === 0) return 0;
    const cStart = new Date(`${selectedContract.start_date}T00:00:00`);
    const cEnd = new Date(`${selectedContract.end_date}T00:00:00`);

    let count = 0;
    for (const dStr of scheduledDates) {
      try {
        const dObj = new Date(`${dStr}T00:00:00`);
        if (dObj >= cStart && dObj <= cEnd && targetDays.includes(dObj.getDay())) {
          count++;
        }
      } catch { }
    }
    return count;
  }, [selectedContract, targetDays, scheduledDates]);

  const isFullyScheduled = useMemo<boolean>(() => {
    if (!selectedContract) return false;
    return totalContractWorkingDays > 0 && (!generationStartDate || scheduledCount >= totalContractWorkingDays);
  }, [totalContractWorkingDays, scheduledCount, generationStartDate, selectedContract]);

  const isCapped = useMemo<boolean>(() => {
    if (!selectedContract || !generationStartDate || !periodValue || periodValue <= 0) return false;
    const val = Number(periodValue);
    if (isNaN(val)) return false;

    const cStart = new Date(`${generationStartDate}T00:00:00`);
    const cEnd = new Date(`${selectedContract.end_date}T00:00:00`);

    const periodEnd = new Date(cStart);
    if (periodUnit === "week") {
      periodEnd.setDate(periodEnd.getDate() + val * 7);
    } else if (periodUnit === "month") {
      periodEnd.setMonth(periodEnd.getMonth() + val);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + val);
    }
    periodEnd.setDate(periodEnd.getDate() - 1);

    return periodEnd > cEnd;
  }, [selectedContract, generationStartDate, periodValue, periodUnit]);

  const generatedDates = useMemo<string[]>(() => {
    if (!selectedContract || targetDays.length === 0 || !periodValue || periodValue <= 0 || !generationStartDate || isFullyScheduled) return [];
    return generateDates(
      generationStartDate,
      selectedContract.end_date,
      targetDays,
      periodUnit,
      periodValue,
    );
  }, [selectedContract, targetDays, periodUnit, periodValue, generationStartDate, isFullyScheduled]);

  const periodError = useMemo<string | null>(() => {
    if (!selectedContract) return null;
    if (isFullyScheduled) {
      return "Hợp đồng đã hoàn thành phân công tất cả các ngày làm việc.";
    }
    if (periodValue === "" || periodValue === undefined || periodValue === null) {
      return "Vui lòng nhập chu kỳ tạo ca.";
    }
    const val = Number(periodValue);
    if (isNaN(val) || val <= 0) {
      return "Chu kỳ tạo ca phải lớn hơn 0.";
    }
    if (!Number.isInteger(val)) {
      return "Chu kỳ tạo ca phải là số nguyên.";
    }
    if (periodUnit === "week" && val > 52) {
      return "Chu kỳ tối đa là 52 tuần.";
    }
    if (periodUnit === "month" && val > 12) {
      return "Chu kỳ tối đa là 12 tháng.";
    }
    if (periodUnit === "year" && val > 1) {
      return "Chu kỳ tối đa là 1 năm.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cEnd = new Date(`${selectedContract.end_date}T00:00:00`);

    if (today > cEnd) {
      return `Hợp đồng đã kết thúc vào ngày ${formatDateVN(selectedContract.end_date)}. Không thể tạo ca trực.`;
    }

    if (generationStartDate && generationStartDate > selectedContract.end_date) {
      return `Tất cả ca trực cho đến ngày kết thúc hợp đồng (${formatDateVN(selectedContract.end_date)}) đã được tạo.`;
    }

    const cStart = new Date(`${generationStartDate}T00:00:00`);

    const periodEnd = new Date(cStart);
    if (periodUnit === "week") {
      periodEnd.setDate(periodEnd.getDate() + val * 7);
    } else if (periodUnit === "month") {
      periodEnd.setMonth(periodEnd.getMonth() + val);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + val);
    }
    // Subtract 1 day to make the end date inclusive of the period duration
    periodEnd.setDate(periodEnd.getDate() - 1);

    if (periodEnd < cStart) {
      return `Chu kỳ kết thúc vào ngày ${formatDateVN(formatLocalDate(periodEnd))}, trước ngày hợp đồng bắt đầu (${formatDateVN(selectedContract.start_date)}).`;
    }

    if (generatedDates.length === 0) {
      return "Không có ngày nào khớp với lịch trực trong chu kỳ này.";
    }
    return null;
  }, [selectedContract, generationStartDate, periodValue, periodUnit, generatedDates, isFullyScheduled]);

  const readySlots = useMemo(
    () => slots.filter((s) => s.configStatus === "configured" && s.segments && s.segments.length > 0),
    [slots],
  );

  const totalSegmentsCount = useMemo(() => {
    return readySlots.reduce((sum, slot) => sum + (slot.segments?.length || 0), 0);
  }, [readySlots]);

  const totalShiftsToCreate = generatedDates.length * totalSegmentsCount;

  const guardStartResult = guardTotal > 0 ? (guardPage - 1) * GUARD_PAGE_SIZE + 1 : 0;
  const guardEndResult =
    guardTotal > 0 ? Math.min(guardPage * GUARD_PAGE_SIZE, guardTotal) : 0;

  // ── Guard status resolver ──────────────────────────────────────────────────
  const resolveGuardStatus = useCallback(
    (guardId: string, profileStatus: string | null): GuardShiftStatus => {
      if (profileStatus !== "active") return "unavailable";
      if (selectedGuardIds.includes(guardId)) return "selected";
      if (conflictMap[guardId] === true) return "conflict";
      return "available";
    },
    [selectedGuardIds, conflictMap],
  );

  // ── Slot validation errors ─────────────────────────────────────────────────
  const slotErrors = useMemo<Record<number, string[]>>(() => {
    const errs: Record<number, string[]> = {};
    slots.forEach((slot, i) => {
      const validation = validateSplitSegments(slot.bookingTimeSlot, slot.segments || []);
      if (!validation.isValid) {
        errs[i] = validation.errors;
      }

      // Overnight contract boundary validation:
      if (slot.segments && selectedContract && generatedDates.length > 0) {
        const lastGeneratedDate = generatedDates[generatedDates.length - 1];
        if (lastGeneratedDate === selectedContract.end_date) {
          const hasOvernightSegment = slot.segments.some(
            (seg) => seg.startTime && seg.endTime && seg.endTime <= seg.startTime
          );
          if (hasOvernightSegment) {
            if (!errs[i]) errs[i] = [];
            errs[i].push(
              `Ca qua đêm bắt đầu vào ngày cuối hợp đồng (${formatDateVN(selectedContract.end_date)}) sẽ kết thúc sau khi hợp đồng hết hạn.`
            );
          }
        }
      }
    });
    return errs;
  }, [slots, selectedContract, generatedDates]);

  // ── Submit readiness ───────────────────────────────────────────────────────
  const canSubmit = Boolean(
    contractId &&
    shiftName.trim() &&
    location.trim() &&
    readySlots.length > 0 &&
    slots.every((s) => s.configStatus === "configured") &&
    Object.keys(slotErrors).length === 0 &&
    selectedGuardIds.length === requiredGuards &&
    generatedDates.length > 0 &&
    !periodError &&
    !isSubmitting,
  );

  // ── Data: contracts ────────────────────────────────────────────────────────
  const fetchContracts = useCallback(async () => {
    try {
      setIsLoadingContracts(true);
      const res = await requestGetShiftContracts();
      setContracts(res.data ?? []);
    } catch {
      setContracts([]);
    } finally {
      setIsLoadingContracts(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchContracts();
  }, [open, fetchContracts]);

  // ── Data: debounce search ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setDebouncedSearch(searchKeyword.trim());
      setGuardPage(1);
    }, 400);
    return () => window.clearTimeout(id);
  }, [open, searchKeyword]);

  // ── Data: guards ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const fetch = async () => {
      try {
        setIsLoadingGuards(true);
        setGuardErrorMessage("");

        if (!contractId) {
          setGuards([]);
          setGuardTotal(0);
          setGuardTotalPages(1);
          return;
        }

        const res = await requestGetGuardsByContract({
          contractId,
          page: guardPage,
          limit: GUARD_PAGE_SIZE,
          search: debouncedSearch,
        });

        if (cancelled) return;
        if (!res.success) throw new Error(res.message);

        setGuards(res.data.guards ?? []);
        setGuardTotal(res.data.pagination.total ?? 0);
        setGuardTotalPages(res.data.pagination.totalPages || 1);
      } catch (err) {
        if (cancelled) return;
        setGuards([]);
        setGuardTotal(0);
        setGuardTotalPages(1);
        setGuardErrorMessage(
          err instanceof Error ? err.message : "Không thể tải danh sách bảo vệ.",
        );
      } finally {
        if (!cancelled) setIsLoadingGuards(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [open, guardPage, debouncedSearch, contractId]);

  useEffect(() => {
    if (generatedDates.length > 0) {
      setCustomStartDate(generatedDates[0]);
      setCustomEndDate(generatedDates[0]);
    }
  }, [generatedDates]);

  // ── Conflict check: re-run when active slot time or guard list changes ─────
  useEffect(() => {
    if (guards.length === 0) return;

    if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);

    conflictTimerRef.current = setTimeout(async () => {
      const allIds = guards
        .map((g) => getGuardProfile(g.profiles)?.user_id)
        .filter((id): id is string => Boolean(id));

      if (allIds.length === 0) return;

      let startISO = "";
      let endISO = "";
      const refDate = generatedDates[0] ?? formatLocalDate(new Date());

      if (freeTimeMode === "shift") {
        if (!activeSlot?.bookingStart || !activeSlot?.bookingEnd) return;
        startISO = toISO(refDate, activeSlot.bookingStart);
        endISO =
          activeSlot.bookingEnd <= activeSlot.bookingStart
            ? toISO(nextDate(refDate), activeSlot.bookingEnd)
            : toISO(refDate, activeSlot.bookingEnd);
      } else if (freeTimeMode === "day") {
        startISO = toISO(refDate, "00:00");
        endISO = toISO(refDate, "23:59");
      } else if (freeTimeMode === "week") {
        startISO = toISO(refDate, "00:00");
        try {
          const wEnd = new Date(`${refDate}T00:00:00`);
          wEnd.setDate(wEnd.getDate() + 7);
          endISO = toISO(formatLocalDate(wEnd), "23:59");
        } catch {
          endISO = toISO(refDate, "23:59");
        }
      } else if (freeTimeMode === "month") {
        startISO = toISO(refDate, "00:00");
        try {
          const mEnd = new Date(`${refDate}T00:00:00`);
          mEnd.setMonth(mEnd.getMonth() + 1);
          endISO = toISO(formatLocalDate(mEnd), "23:59");
        } catch {
          endISO = toISO(refDate, "23:59");
        }
      } else if (freeTimeMode === "custom") {
        if (!customStartDate || !customEndDate) return;
        startISO = toISO(customStartDate, customStartTime || "00:00");
        endISO = toISO(customEndDate, customEndTime || "23:59");
      }

      if (!startISO || !endISO) return;

      try {
        setIsCheckingConflicts(true);
        const res = await requestGetGuardAvailability({
          guardIds: allIds,
          startTime: startISO,
          endTime: endISO,
        });

        if (res.data) setConflictMap(res.data);
      } catch {
        // best-effort
      } finally {
        setIsCheckingConflicts(false);
      }
    }, 600);

    return () => {
      if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    freeTimeMode,
    customStartDate,
    customStartTime,
    customEndDate,
    customEndTime,
    activeSlot?.bookingStart,
    activeSlot?.bookingEnd,
    guards,
    generatedDates,
  ]);

  // ── Form reset ─────────────────────────────────────────────────────────────
  const resetForm = () => {
    setContractId("");
    setShiftName("");
    setLocation("");
    setSlots([]);
    setActiveSlotIndex(0);
    setPeriodUnit("week");
    setPeriodValue(1);
    setLatestShiftDate(null);
    setScheduledDates([]);
    setSelectedGuardIds([]);
    setConflictMap({});
    setSearchKeyword("");
    setDebouncedSearch("");
    setGuards([]);
    setGuardPage(1);
    setGuardTotal(0);
    setGuardTotalPages(1);
    setGuardErrorMessage("");
    setSubmitError("");
    setSubmitSuccess("");
    setGenerationWarnings([]);
    setGenerationProgress(null);
    setFilterMode("all");
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  // ── Contract selection → auto-populate slots ───────────────────────────────
  const handleSelectContract = async (value: string) => {
    setContractId(value);
    setSubmitError("");
    setSubmitSuccess("");
    setSelectedGuardIds([]);
    setConflictMap({});
    setLatestShiftDate(null);
    setScheduledDates([]);

    if (!value) {
      setLocation("");
      setSlots([]);
      return;
    }

    const contract = contracts.find((c) => c.contract_id === value);
    if (!contract) return;

    setLocation(contract.address);

    setIsLoadingLatestDate(true);
    setIsLoadingScheduledDates(true);
    try {
      const [latestRes, scheduledRes] = await Promise.all([
        requestGetLatestShiftDate(value),
        requestGetScheduledShiftDates(value),
      ]);
      setLatestShiftDate(latestRes.data);
      setScheduledDates(scheduledRes.data);
    } catch (err) {
      console.error("Lấy thông tin ca trực hợp đồng thất bại:", err);
      setLatestShiftDate(null);
      setScheduledDates([]);
    } finally {
      setIsLoadingLatestDate(false);
      setIsLoadingScheduledDates(false);
    }

    // Auto-populate slots from booking time_slots
    const autoSlots: ShiftSlot[] = (contract.time_slots ?? []).map((raw, i) =>
      buildSlot(raw, i),
    );
    setSlots(autoSlots);
    setActiveSlotIndex(0);
  };

  // ── Segment time edit & split shifts ──────────────────────────────────────
  const handleSegmentTimeChange = (
    slotIdx: number,
    segIdx: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSlots((prev) => {
      const updated = [...prev];
      const slot = updated[slotIdx];
      if (!slot) return prev;

      const segments = [...(slot.segments || [])];
      const segment = segments[segIdx];
      if (!segment) return prev;

      const updatedSeg = { ...segment, [field]: value };

      const startMin = toMinutes(updatedSeg.startTime);
      let endMin = toMinutes(updatedSeg.endTime);
      if (updatedSeg.endTime) {
        if (endMin <= startMin) endMin += 24 * 60;
        updatedSeg.startMinutes = startMin;
        updatedSeg.endMinutes = endMin;
        updatedSeg.durationMinutes = endMin - startMin;
      } else {
        updatedSeg.startMinutes = startMin;
        updatedSeg.endMinutes = startMin;
        updatedSeg.durationMinutes = 0;
      }

      segments[segIdx] = updatedSeg;

      const validation = validateSplitSegments(slot.bookingTimeSlot, segments);

      updated[slotIdx] = {
        ...slot,
        segments,
        configStatus: validation.isValid ? "configured" : "needs_adjustment",
      };
      return updated;
    });
    setSubmitError("");
  };

  const handleAddSegment = (slotIdx: number) => {
    setSlots((prev) => {
      const updated = [...prev];
      const slot = updated[slotIdx];
      if (!slot) return prev;

      const segments = [...(slot.segments || [])];
      if (segments.length === 0) return prev;

      const lastSeg = segments[segments.length - 1];
      if (!lastSeg.endTime) return prev;

      const newStart = lastSeg.endTime;

      const parsedOriginal = parseBookingSlot(slot.bookingTimeSlot);
      if (!parsedOriginal) return prev;

      const origEnd = parsedOriginal.end;

      const remainingMin = calculateDurationMinutes(newStart, origEnd);
      if (remainingMin <= 0) return prev;

      let newEnd = "";
      if (remainingMin > 8 * 60) {
        newEnd = addMinutes(newStart, 8 * 60);
      } else {
        newEnd = origEnd;
      }

      const startMin = toMinutes(newStart);
      let endMin = toMinutes(newEnd);
      if (endMin <= startMin) endMin += 24 * 60;

      const newSeg: SplitShiftSegment = {
        id: Math.random().toString(36).substr(2, 9),
        startTime: newStart,
        endTime: newEnd,
        startMinutes: startMin,
        endMinutes: endMin,
        durationMinutes: calculateDurationMinutes(newStart, newEnd),
      };

      const newSegments = [...segments, newSeg];
      const validation = validateSplitSegments(slot.bookingTimeSlot, newSegments);

      updated[slotIdx] = {
        ...slot,
        segments: newSegments,
        configStatus: validation.isValid ? "configured" : "needs_adjustment",
      };
      return updated;
    });
    setSubmitError("");
  };

  const handleRemoveSegment = (slotIdx: number, segIdx: number) => {
    setSlots((prev) => {
      const updated = [...prev];
      const slot = updated[slotIdx];
      if (!slot) return prev;

      const segments = (slot.segments || []).filter((_, idx) => idx !== segIdx);
      const validation = validateSplitSegments(slot.bookingTimeSlot, segments);

      updated[slotIdx] = {
        ...slot,
        segments,
        configStatus: validation.isValid ? "configured" : "needs_adjustment",
      };
      return updated;
    });
    setSubmitError("");
  };

  // ── Guard toggle ───────────────────────────────────────────────────────────
  const handleToggleGuard = (guard: GuardListItem) => {
    setSubmitError("");
    setSubmitSuccess("");

    const profile = getGuardProfile(guard.profiles);
    if (!profile?.user_id) return;

    const status = resolveGuardStatus(profile.user_id, profile.status);
    if (status === "conflict" || status === "unavailable") return;

    const isSelected = selectedGuardIds.includes(profile.user_id);
    if (isSelected) {
      setSelectedGuardIds((prev) => prev.filter((id) => id !== profile.user_id));
      return;
    }
    if (selectedGuardIds.length >= requiredGuards) return;
    setSelectedGuardIds((prev) => [...prev, profile.user_id]);
  };

  // ── Submit: batch shift generation ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedContract || isSubmitting || isSubmittingRef.current) return;

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess("");
      setGenerationWarnings([]);

      const addDays = (dStr: string, days: number): string => {
        if (days === 0) return dStr;
        const d = new Date(`${dStr}T00:00:00`);
        d.setDate(d.getDate() + days);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      };

      // Full pool of active, non-conflicting guards (for auto-replacement)
      const allActiveIds = guards
        .map((g) => {
          const p = getGuardProfile(g.profiles);
          if (!p?.user_id) return null;
          return p.status === "active" ? p.user_id : null;
        })
        .filter((id): id is string => Boolean(id));

      const warnings: string[] = [];
      let created = 0;
      let skipped = 0;
      const total = totalShiftsToCreate;

      setGenerationProgress({ current: 0, total });

      for (const date of generatedDates) {
        for (const slot of readySlots) {
          const startISO = toISO(date, slot.bookingStart);
          const endISO =
            slot.bookingEnd <= slot.bookingStart
              ? toISO(nextDate(date), slot.bookingEnd)
              : toISO(date, slot.bookingEnd);

          // Per-date conflict check
          let assignedIds = [...selectedGuardIds];

          try {
            const cRes = await requestGetGuardAvailability({
              guardIds: allActiveIds,
              startTime: startISO,
              endTime: endISO,
            });

            const dateMap = cRes.data ?? {};

            // Remove selected guards who conflict on this date
            const conflictFree = selectedGuardIds.filter((id) => !dateMap[id]);

            if (conflictFree.length < requiredGuards) {
              // Auto-fill replacements from the active pool
              const replacements = allActiveIds
                .filter((id) => !dateMap[id] && !conflictFree.includes(id))
                .slice(0, requiredGuards - conflictFree.length);

              assignedIds = [...conflictFree, ...replacements];

              if (assignedIds.length < requiredGuards) {
                warnings.push(
                  `${formatDateVN(date)} (${slot.bookingStart}–${slot.bookingEnd}): ` +
                  `Không đủ bảo vệ (${assignedIds.length}/${requiredGuards}).`,
                );
              }
            } else {
              assignedIds = conflictFree.slice(0, requiredGuards);
            }
          } catch {
            // best-effort; fall back to selected IDs
          }

          // Strict date-range validation for the shift
          const lastSeg = slot.segments && slot.segments.length > 0
            ? slot.segments[slot.segments.length - 1]
            : null;

          if (!lastSeg) continue;

          const origStartMin = toMinutes(slot.bookingStart);
          const sMin = toMinutes(lastSeg.startTime);
          const dur = calculateDurationMinutes(lastSeg.startTime, lastSeg.endTime);
          const startRel = (sMin - origStartMin + 24 * 60) % (24 * 60);
          const endOffsetDays = Math.floor((origStartMin + startRel + dur) / (24 * 60));
          const shiftEndDateStr = addDays(date, endOffsetDays);

          if (date < selectedContract.start_date) {
            warnings.push(
              `${formatDateVN(date)} (${slot.bookingStart}–${slot.bookingEnd}): ` +
              `Ca trực bắt đầu trước ngày hiệu lực hợp đồng (${formatDateVN(selectedContract.start_date)}).`,
            );
            skipped += slot.segments?.length || 1;
            continue;
          }
          if (shiftEndDateStr > selectedContract.end_date) {
            warnings.push(
              `${formatDateVN(date)} (${slot.bookingStart}–${slot.bookingEnd}): ` +
              `Ca trực kết thúc vào ngày ${formatDateVN(shiftEndDateStr)}, vượt quá ngày kết thúc hợp đồng (${formatDateVN(selectedContract.end_date)}).`,
            );
            skipped += slot.segments?.length || 1;
            continue;
          }

          try {
            // Build the segments splits payload
            const splitsPayload = (slot.segments || []).map((seg) => {
              const segSMin = toMinutes(seg.startTime);
              const segDur = calculateDurationMinutes(seg.startTime, seg.endTime);
              const segStartRel = (segSMin - origStartMin + 24 * 60) % (24 * 60);

              const startOffsetDays = Math.floor((origStartMin + segStartRel) / (24 * 60));
              const endOffsetDays = Math.floor((origStartMin + segStartRel + segDur) / (24 * 60));

              const segStartDate = addDays(date, startOffsetDays);
              const segEndDate = addDays(date, endOffsetDays);

              return {
                start_time: toISO(segStartDate, seg.startTime),
                end_time: toISO(segEndDate, seg.endTime),
              };
            });

            const res = await requestCreateWorkShift({
              contract_id: contractId,
              shift_name: shiftName.trim(),
              start_time: splitsPayload[0].start_time,
              end_time: splitsPayload[0].end_time,
              required_guards: requiredGuards,
              location,
              guard_id: assignedIds,
              original_slot: slot.bookingTimeSlot,
              splits: splitsPayload,
            });

            if (res.data && Array.isArray(res.data)) {
              created += res.data.length;
            } else {
              created++;
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : "";
            if (errMsg.includes("đã tồn tại") || errMsg.includes("already exists")) {
              skipped += slot.segments?.length || 1;
              continue;
            }
            warnings.push(
              `${formatDateVN(date)} (${slot.bookingStart}–${slot.bookingEnd}): ` +
              (errMsg || "Tạo thất bại"),
            );
            skipped += slot.segments?.length || 1;
          }

          setGenerationProgress({ current: created + skipped, total });
        }
      }

      setGenerationWarnings(warnings);

      if (created > 0) {
        setSubmitSuccess(
          `Đã tạo thêm ${created} ca trực mới.` +
          (skipped > 0 ? ` (Đã bỏ qua ${skipped} ca trùng lặp)` : "") +
          (warnings.length > 0 ? `. Có ${warnings.length} cảnh báo.` : ""),
        );
        await onCreated?.();
        // Re-fetch latest shift date, scheduled dates and contracts
        try {
          const [latestRes, scheduledRes] = await Promise.all([
            requestGetLatestShiftDate(contractId),
            requestGetScheduledShiftDates(contractId),
          ]);
          setLatestShiftDate(latestRes.data);
          setScheduledDates(scheduledRes.data);
          await fetchContracts();
        } catch { }
      } else if (skipped > 0) {
        setSubmitSuccess(`Tất cả ca trực (${skipped} ca) trong chu kỳ này đã được tạo trước đó.`);
        await onCreated?.();
      } else {
        setSubmitError("Không có ca trực nào được tạo thành công.");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Tạo ca trực thất bại",
      );
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      setGenerationProgress(null);
    }
  };

  // ── Guard list filter ──────────────────────────────────────────────────────
  const filteredGuards = useMemo(() => {
    return guards.filter((guard) => {
      const profile = getGuardProfile(guard.profiles);
      if (!profile?.user_id) return false;
      const status = resolveGuardStatus(profile.user_id, profile.status);
      if (filterMode === "available") return status === "available";
      if (filterMode === "conflict") return status === "conflict";
      if (filterMode === "unavailable") return status === "unavailable";
      return true;
    });
  }, [guards, filterMode, resolveGuardStatus]);

  const statusCounts = useMemo(() => {
    const counts = { available: 0, conflict: 0, unavailable: 0, selected: 0 };
    guards.forEach((guard) => {
      const profile = getGuardProfile(guard.profiles);
      if (!profile?.user_id) return;
      const status = resolveGuardStatus(profile.user_id, profile.status);
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  }, [guards, resolveGuardStatus]);

  if (!open) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex h-[calc(100vh-32px)] w-full max-w-7xl xl:max-w-[1380px] flex-col overflow-hidden rounded-lg bg-white shadow-xl">

        {/* ── Header ── */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-700 text-white">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tạo ca trực & Phân công bảo vệ</h2>
              <p className="mt-1 text-sm text-slate-500">
                Hệ thống tự động cấu hình ca từ lịch booking và tạo theo chu kỳ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isSubmitting}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[420px_1fr] lg:grid-cols-[500px_1fr] xl:grid-cols-[560px_1fr]">

          {/* ────────────────── LEFT PANEL ────────────────── */}
          <div className="min-h-0 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-200 p-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-bold uppercase text-blue-700">
              <FileText size={17} />
              <span>Thông tin ca trực</span>
            </div>

            <div className="space-y-5 pb-4">

              {/* Contract selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Hợp đồng</label>
                <select
                  value={contractId}
                  onChange={(e) => handleSelectContract(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    {isLoadingContracts ? "Đang tải hợp đồng..." : "Chọn hợp đồng"}
                  </option>
                  {contracts.map((c) => (
                    <option key={c.contract_id} value={c.contract_id}>
                      {c.code} — {c.address} ({c.scheduled_days_count ?? 0}/{c.total_working_days_count ?? 0} ngày trực)
                    </option>
                  ))}
                </select>
                {!isLoadingContracts && contracts.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">Chưa có hợp đồng để tạo ca trực.</p>
                )}
              </div>

              {/* Contract info card */}
              {selectedContract && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-blue-800">Thông tin hợp đồng</p>
                  <div className="space-y-2 text-sm text-slate-700">
                    <InfoRow label="Khách hàng" value={selectedContract.customer_name} />
                    <InfoRow label="Công ty" value={selectedContract.company_name} />
                    <InfoRow label="Dịch vụ" value={selectedContract.service_name} />
                    <InfoRow label="Địa điểm" value={selectedContract.address} />
                    <InfoRow
                      label="Mô tả yêu cầu"
                      value={selectedContract.description || "Không có mô tả"}
                    />
                    <InfoRow
                      label="Số bảo vệ / ca"
                      value={`${selectedContract.guards_per_slot} bảo vệ`}
                    />
                    <InfoRow
                      label="Thời hạn HĐ"
                      value={`${formatDateVN(selectedContract.start_date)} — ${formatDateVN(selectedContract.end_date)}`}
                    />
                    <InfoRow
                      label="Ngày trực / tuần"
                      value={
                        selectedContract.day_per_week?.length
                          ? selectedContract.day_per_week.join(", ")
                          : "Chưa cập nhật"
                      }
                    />

                    {/* Progress Bar & Scheduled Status */}
                    {!isLoadingScheduledDates && totalContractWorkingDays > 0 && (
                      <div className="mt-3 border-t border-blue-100 pt-3">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-blue-800">
                          <span>Tiến độ phân công:</span>
                          <span className={`px-2 py-0.5 rounded font-bold text-xs shadow-sm ${isFullyScheduled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}>
                            {scheduledCount} / {totalContractWorkingDays} ngày ({((scheduledCount / totalContractWorkingDays) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isFullyScheduled ? "bg-emerald-500" : "bg-blue-600"
                              }`}
                            style={{ width: `${Math.min(100, (scheduledCount / totalContractWorkingDays) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isLoadingLatestDate || isLoadingScheduledDates ? (
                      <div className="pt-2 text-xs text-blue-600 animate-pulse font-medium">
                        Đang kiểm tra lịch ca trực đã tồn tại...
                      </div>
                    ) : (
                      <div className="mt-2 rounded bg-white/60 p-2.5 text-xs text-slate-700 border border-blue-200">
                        {isFullyScheduled ? (
                          <p className="font-semibold text-emerald-700">
                            ✓ Hợp đồng đã hoàn thành phân công tất cả các ngày làm việc ({scheduledCount}/{totalContractWorkingDays} ngày).
                          </p>
                        ) : latestShiftDate ? (
                          <p>
                            ✓ Hợp đồng đã có ca trực đến ngày{" "}
                            <span className="font-semibold text-blue-800">{formatDateVN(latestShiftDate)}</span>.{" "}
                            Lần tạo tiếp theo bắt đầu từ ngày{" "}
                            <span className="font-semibold text-emerald-700">{formatDateVN(generationStartDate)}</span>.
                          </p>
                        ) : (
                          <p>
                            Lần tạo đầu tiên bắt đầu từ ngày hiệu lực hợp đồng{" "}
                            <span className="font-semibold text-emerald-700">{formatDateVN(selectedContract.start_date)}</span>.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Vị trí trực cụ thể</label>
                <div className="relative">
                  <MapPin size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); setSubmitError(""); }}
                    placeholder="Ví dụ: Sảnh chính tầng 1"
                    className="w-full rounded-md border border-slate-300 px-9 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Shift name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tên ca trực</label>
                <div className="relative">
                  <SquarePen size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={shiftName}
                    onChange={(e) => { setShiftName(e.target.value); setSubmitError(""); }}
                    placeholder="Ví dụ: Ca sáng cửa hàng hoa"
                    className="w-full rounded-md border border-slate-300 px-9 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* ── Booking time slots (auto-populated) ── */}
              {selectedContract && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Khung giờ booking
                    </label>
                    {slots.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                          <CheckCircle2 size={10} />
                          {configuredSlots.length} hợp lệ
                        </span>
                        {pendingSlots.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                            <AlertTriangle size={10} />
                            {pendingSlots.length} cần điều chỉnh
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {slots.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-300 py-6 text-center">
                      <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm text-slate-400">
                        {selectedContract.time_slots?.length === 0
                          ? "Hợp đồng chưa có khung giờ booking."
                          : "Đang tải khung giờ..."}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* ── Chip grid ── */}
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot, i) => {
                          const isActive = i === activeSlotIndex;
                          const hasError = !!slotErrors[i];
                          const isValid =
                            slot.configStatus === "configured" && !hasError;
                          const needsEdit =
                            slot.configStatus === "needs_adjustment";
                          const isInvalid =
                            slot.configStatus === "invalid" || hasError;

                          const chipColor = isInvalid
                            ? "border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                            : needsEdit
                              ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

                          const timeLabel =
                            slot.segments && slot.segments.length > 0
                              ? slot.segments
                                  .map((seg) =>
                                    seg.startTime && seg.endTime
                                      ? `${seg.startTime}–${seg.endTime}`
                                      : seg.startTime
                                        ? `${seg.startTime}–?`
                                        : "?"
                                  )
                                  .join(" | ")
                              : slot.bookingTimeSlot;

                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() =>
                                setActiveSlotIndex(isActive ? -1 : i)
                              }
                              title={
                                needsEdit
                                  ? "Khung giờ > 8h — click để chỉnh sửa"
                                  : isInvalid
                                    ? "Không hợp lệ — click để chỉnh sửa"
                                    : "Hợp lệ — click để xem"
                              }
                              className={`flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold shadow-sm transition-all ${chipColor} ${isActive
                                ? "ring-2 ring-blue-400 ring-offset-2"
                                : ""
                                }`}
                            >
                              <Clock size={13} />
                              {timeLabel}
                              {isValid && (
                                <CheckCircle2
                                  size={13}
                                  className="text-emerald-600"
                                />
                              )}
                              {(needsEdit || isInvalid) && (
                                <AlertTriangle size={13} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* ── Inline edit panel ── */}
                      {activeSlotIndex >= 0 && slots[activeSlotIndex] && (() => {
                        const slot = slots[activeSlotIndex];
                        const errs = slotErrors[activeSlotIndex] || [];
                        const bookingDurMin =
                          slot.bookingStart && slot.bookingEnd
                            ? diffMinutes(slot.bookingStart, slot.bookingEnd)
                            : 0;
                        const exceedsMax = bookingDurMin > 8 * 60;

                        // Calculate split duration and validation
                        const validation = validateSplitSegments(slot.bookingTimeSlot, slot.segments || []);
                        const canAddMore = validation.splitDurationMinutes < validation.originalDurationMinutes && 
                          slot.segments && slot.segments.length > 0 && 
                          slot.segments[slot.segments.length - 1].endTime !== "";

                        return (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                            {/* Panel header */}
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Ca {activeSlotIndex + 1} · Booking:{" "}
                                <span className="font-bold text-slate-700">
                                  {slot.bookingTimeSlot}
                                </span>
                                {bookingDurMin > 0 && (
                                  <span className="ml-1 font-normal text-slate-400">
                                    ({Math.round(bookingDurMin / 60)}h)
                                  </span>
                                )}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${slot.configStatus === "configured" && errs.length === 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                                  }`}
                              >
                                {slot.configStatus === "configured" && errs.length === 0 ? (
                                  <CheckCircle2 size={10} />
                                ) : (
                                  <AlertTriangle size={10} />
                                )}
                                {slot.configStatus === "configured" && errs.length === 0
                                  ? "Hợp lệ"
                                  : "Cần điều chỉnh"}
                              </span>
                            </div>

                            {/* Warning alert if exceeds 8h */}
                            {exceedsMax && !validation.isValid && (
                              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold">Cảnh báo: Ca trực gốc vượt quá 8 tiếng ({Math.round(bookingDurMin / 60)} tiếng).</p>
                                  <p className="mt-1">Vui lòng điều chỉnh thời gian và bấm nút <strong className="font-bold">+</strong> để tách thành các ca nhỏ ≤ 8 tiếng.</p>
                                </div>
                              </div>
                            )}

                            {/* Segments List */}
                            <div className="space-y-3">
                              {(slot.segments || []).map((seg, segIdx) => {
                                return (
                                  <div key={seg.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="text-xs font-semibold text-slate-500 w-16">
                                      Ca nhỏ {segIdx + 1}
                                    </span>
                                    
                                    {/* Start time input */}
                                    <div className="flex-1">
                                      <div className="relative">
                                        <Clock size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                          type="time"
                                          value={seg.startTime}
                                          onChange={(e) => handleSegmentTimeChange(activeSlotIndex, segIdx, "startTime", e.target.value)}
                                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 pr-6 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                        />
                                      </div>
                                    </div>

                                    <span className="text-slate-400">—</span>

                                    {/* End time input */}
                                    <div className="flex-1">
                                      <div className="relative">
                                        <Clock size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                          type="time"
                                          value={seg.endTime}
                                          onChange={(e) => handleSegmentTimeChange(activeSlotIndex, segIdx, "endTime", e.target.value)}
                                          className="w-full rounded border border-slate-300 bg-white px-2 py-1 pr-6 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                                        />
                                      </div>
                                    </div>

                                    {/* Duration Badge */}
                                    {seg.startTime && seg.endTime && (
                                      <span className="text-xs font-medium text-slate-500 bg-slate-200/60 px-2 py-1 rounded">
                                        {Math.round(calculateDurationMinutes(seg.startTime, seg.endTime) / 6) / 10}h
                                      </span>
                                    )}

                                    {/* Delete button (only for index > 0) */}
                                    {segIdx > 0 && (
                                      <button
                                        key={`del-${seg.id}`}
                                        type="button"
                                        onClick={() => handleRemoveSegment(activeSlotIndex, segIdx)}
                                        className="p-1 rounded text-red-500 hover:bg-red-50"
                                        title="Xóa ca nhỏ này"
                                      >
                                        <X size={15} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Add segment button and status */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                              <div className="text-xs text-slate-500">
                                Tổng thời gian đã chia:{" "}
                                <span className="font-semibold text-slate-700">
                                  {Math.round(validation.splitDurationMinutes / 6) / 10}h
                                </span>{" "}
                                / {Math.round(validation.originalDurationMinutes / 6) / 10}h
                              </div>

                              {!canAddMore && validation.splitDurationMinutes >= validation.originalDurationMinutes ? (
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                  Đã chia đủ thời gian
                                </span>
                              ) : !canAddMore ? (
                                <button
                                  type="button"
                                  disabled
                                  title="Không thể thêm ca mới vì đã đủ tổng thời gian hoặc ca trước chưa hợp lệ"
                                  className="flex items-center gap-1 rounded bg-slate-100 text-slate-400 px-2.5 py-1 text-xs font-semibold cursor-not-allowed border border-slate-200"
                                >
                                  + Thêm ca tách
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddSegment(activeSlotIndex)}
                                  className="flex items-center gap-1 rounded bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-semibold hover:bg-blue-100 border border-blue-200 transition"
                                >
                                  <span className="font-bold text-sm">+</span> Thêm ca tách
                                </button>
                              )}
                            </div>

                            {/* Validation errors */}
                            {errs.length > 0 && (
                              <div className="mt-2 space-y-1 rounded bg-red-50 border border-red-100 p-2.5">
                                {errs.map((msg, idx) => (
                                  <p key={idx} className="flex items-start gap-1.5 text-xs text-red-600">
                                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                    <span>{msg}</span>
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Overnight note */}
                            {slot.segments && slot.segments.some(seg => seg.startTime && seg.endTime && seg.endTime <= seg.startTime) && (
                              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                                <Clock size={12} />
                                Có ca nhỏ kết thúc vào ngày hôm sau.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* ── Period generation ── */}
              {selectedContract && (
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Chu kỳ tạo ca
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={52}
                      value={periodValue}
                      disabled={isFullyScheduled}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPeriodValue(val === "" ? "" : Number(val));
                      }}
                      className={`w-24 rounded-md border px-3 py-2.5 text-sm outline-none ${isFullyScheduled
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        : periodError
                          ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          : "border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        }`}
                    />
                    <div className="flex flex-1 overflow-hidden rounded-md border border-slate-300">
                      {(["week", "month", "year"] as PeriodUnit[]).map((unit) => {
                        const labels = { week: "Tuần", month: "Tháng", year: "Năm" };
                        const isSelected = periodUnit === unit;
                        return (
                          <button
                            key={unit}
                            type="button"
                            disabled={isFullyScheduled}
                            onClick={() => setPeriodUnit(unit)}
                            className={`flex-1 py-2.5 text-sm font-medium transition ${isFullyScheduled
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : isSelected
                                ? "bg-blue-700 text-white"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            {labels[unit]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Immediate validation error or preview pill */}
                  {periodError ? (
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-500">
                      <AlertTriangle size={12} />
                      {periodError}
                    </p>
                  ) : generatedDates.length > 0 && readySlots.length > 0 ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                        ✓ {totalShiftsToCreate} ca trực · {generatedDates.length} ngày × {totalSegmentsCount} ca
                      </span>
                      <span className="text-xs text-slate-400">
                        trong {periodValue} {periodUnit === "week" ? "tuần" : periodUnit === "month" ? "tháng" : "năm"}
                      </span>
                    </div>
                  ) : selectedContract ? (
                    <p className="mt-2 text-xs text-slate-400">
                      {readySlots.length === 0
                        ? "Cần ít nhất 1 ca hợp lệ để xem trước."
                        : ""}
                    </p>
                  ) : null}

                  {/* Capped cycle warning note */}
                  {!isFullyScheduled && isCapped && !periodError && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 p-2 rounded">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <span>
                        Cảnh báo: Chu kỳ tạo ca vượt quá ngày kết thúc hợp đồng. Hệ thống sẽ chỉ tạo ca cho các ngày còn lại đến hết ngày kết thúc hợp đồng ({formatDateVN(selectedContract.end_date)}).
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Guard count (read-only) */}
              {selectedContract && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Số lượng bảo vệ cần / ca
                  </label>
                  <input
                    type="text"
                    value={`${requiredGuards} bảo vệ`}
                    readOnly
                    className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Số lượng bảo vệ lấy từ hợp đồng, không thể chỉnh sửa.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ────────────────── RIGHT PANEL ────────────────── */}
          <div className="flex min-h-0 flex-col overflow-y-auto p-6">
            {/* Section heading */}
            <div className="shrink-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase text-blue-700">
                  <ShieldCheck size={17} />
                  <span>Phân công bảo vệ</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCheckingConflicts && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Loader2 size={12} className="animate-spin" />
                      Kiểm tra lịch...
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-600">
                    Đã chọn:{" "}
                    <span className="font-bold text-blue-700">
                      {selectedGuardIds.length}/{requiredGuards}
                    </span>{" "}
                    bảo vệ
                  </span>
                </div>
              </div>

              {/* Free-time Filter Section */}
              <div className="mb-4 rounded-md border border-slate-200 bg-slate-50/50 p-3">
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Lọc bảo vệ rảnh (Không trùng ca):
                </label>
                <div className="grid grid-cols-5 gap-1 rounded bg-slate-200/50 p-0.5">
                  {(["shift", "day", "week", "month", "custom"] as const).map((mode) => {
                    const labels = {
                      shift: "Theo ca",
                      day: "Cả ngày",
                      week: "1 Tuần",
                      month: "1 Tháng",
                      custom: "Tự chọn",
                    };
                    const isSelected = freeTimeMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setFreeTimeMode(mode);
                          setGuardPage(1);
                        }}
                        className={`py-1 text-[10px] sm:text-[11px] font-medium rounded transition ${isSelected
                          ? "bg-blue-600 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-200"
                          }`}
                      >
                        {labels[mode]}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date/Time Range Fields */}
                {freeTimeMode === "custom" && (
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Bắt đầu</label>
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-blue-500"
                        />
                        <input
                          type="time"
                          value={customStartTime}
                          onChange={(e) => setCustomStartTime(e.target.value)}
                          className="rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Kết thúc</label>
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-blue-500"
                        />
                        <input
                          type="time"
                          value={customEndTime}
                          onChange={(e) => setCustomEndTime(e.target.value)}
                          className="rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter chips */}
              <div className="mb-3 flex flex-wrap gap-2">
                {(["all", "available", "conflict", "unavailable"] as const).map((mode) => {
                  const count =
                    mode === "all" ? guards.length : statusCounts[mode];
                  const isActive = filterMode === mode;

                  const colorMap: Record<string, string> = {
                    all: isActive ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600",
                    available: isActive ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700",
                    conflict: isActive ? "bg-red-600 text-white" : "bg-red-50 text-red-600",
                    unavailable: isActive ? "bg-slate-500 text-white" : "bg-slate-100 text-slate-500",
                  };

                  const labelMap: Record<string, string> = {
                    all: "Tất cả",
                    available: "Sẵn sàng",
                    conflict: "Xung đột",
                    unavailable: "Không khả dụng",
                  };

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setFilterMode(mode); setGuardPage(1); }}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${colorMap[mode]}`}
                    >
                      <Filter size={10} />
                      {labelMap[mode]}
                      <span className="ml-0.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-semibold">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm tên, SĐT, email..."
                    className="w-full rounded-md border border-slate-300 px-10 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Active slot context */}
              {activeSlot?.startTime && activeSlot.endTime && (
                <div className="mb-3 flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  <Clock size={12} />
                  <span>
                    Đang kiểm tra khả năng cho ca{" "}
                    <strong>{activeSlot.startTime}–{activeSlot.endTime}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Guard list */}
            <div className="min-h-[250px] md:min-h-[350px] flex-1 space-y-3 overflow-y-auto pr-1">
              {isLoadingGuards ? (
                <GuardListSkeleton />
              ) : guardErrorMessage ? (
                <p className="py-6 text-center text-sm text-red-500">{guardErrorMessage}</p>
              ) : filteredGuards.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  {debouncedSearch
                    ? "Không tìm thấy bảo vệ phù hợp."
                    : filterMode !== "all"
                      ? "Không có bảo vệ trong trạng thái này."
                      : "Chưa có bảo vệ để phân công."}
                </p>
              ) : (
                filteredGuards.map((guard) => {
                  const profile = getGuardProfile(guard.profiles);
                  const uid = profile?.user_id ?? "";
                  const status = resolveGuardStatus(uid, profile?.status ?? null);
                  const cfg = GUARD_STATUS_CFG[status];
                  const isDisabled = status === "conflict" || status === "unavailable";

                  return (
                    <button
                      key={guard.guard_id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleToggleGuard(guard)}
                      className={`w-full rounded-md border p-4 text-left transition ${status === "selected"
                        ? "border-blue-600 bg-blue-50"
                        : status === "assigned"
                          ? "border-indigo-300 bg-indigo-50/40"
                          : status === "conflict"
                            ? "border-red-200 bg-red-50/30"
                            : status === "unavailable"
                              ? "border-slate-200 bg-slate-50 opacity-60"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                        } ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar with status dot */}
                        <div className="relative">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                            {profile?.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.full_name ?? "Guard"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound size={22} />
                            )}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${cfg.dot}`}
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {profile?.full_name ?? "Chưa cập nhật"}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}
                            >
                              {status === "selected" && <CheckCircle2 size={10} />}
                              {status === "conflict" && <AlertTriangle size={10} />}
                              {cfg.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {profile?.phone_number ?? "—"} · {profile?.email ?? "—"}
                          </p>
                        </div>

                        {/* Selection circle */}
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${status === "selected"
                            ? "border-blue-700 bg-blue-700"
                            : "border-slate-300 bg-white"
                            }`}
                        >
                          {status === "selected" && (
                            <CheckCircle2 size={14} className="text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex shrink-0 flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <p>
                {isLoadingGuards
                  ? "Đang tải danh sách bảo vệ..."
                  : `Hiển thị ${guardStartResult}–${guardEndResult} trong số ${guardTotal} bảo vệ`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={guardPage <= 1 || isLoadingGuards}
                  onClick={() => setGuardPage((p) => Math.max(p - 1, 1))}
                  aria-label="Trang trước"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" className="h-8 min-w-8 rounded-md bg-sky-400 px-2 text-sm font-semibold text-white">
                  {guardPage}
                </button>
                <span className="px-2 text-sm text-slate-500">/ {guardTotalPages}</span>
                <button
                  type="button"
                  disabled={guardPage >= guardTotalPages || isLoadingGuards}
                  onClick={() => setGuardPage((p) => Math.min(p + 1, guardTotalPages))}
                  aria-label="Trang sau"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

          {/* Generation progress bar */}
          {generationProgress && (
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  Đang tạo ca trực...
                </span>
                <span>{generationProgress.current}/{generationProgress.total}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (generationProgress.current / generationProgress.total) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Warnings */}
          {generationWarnings.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-700">
                <AlertTriangle size={15} />
                {generationWarnings.length} cảnh báo phân công
              </div>
              <ul className="ml-4 list-disc space-y-0.5 text-xs text-amber-700">
                {generationWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {submitSuccess && (
            <p className="text-right text-sm font-medium text-emerald-600">{submitSuccess}</p>
          )}
          {submitError && (
            <p className="text-right text-sm font-medium text-red-600">{submitError}</p>
          )}

          <div className="flex items-center justify-between">
            {slots.length > 0 && (
              <p className="text-xs text-slate-500">
                {configuredSlots.length}/{slots.length} ca hợp lệ
                {pendingSlots.length > 0 && (
                  <span className="ml-2 text-amber-600">
                    · {pendingSlots.length} cần điều chỉnh
                  </span>
                )}
              </p>
            )}
            <div className="ml-auto flex gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="cursor-pointer rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                className="cursor-pointer rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Đang tạo {totalShiftsToCreate} ca...
                  </span>
                ) : (
                  `Lưu & Tạo ca`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
