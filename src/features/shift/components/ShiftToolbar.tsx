import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Plus, Calendar, ChevronDown } from "lucide-react";

type ShiftToolbarProps = {
  viewMode: "day" | "week";
  selectedLocation: string;
  locations: { address: string; status: string }[];
  currentDate: string;
  onChangeViewMode: (mode: "day" | "week") => void;
  onChangeLocation: (location: string) => void;
  onChangeDate: (date: string) => void;
  onClickAdd: () => void;
};

const getContractStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "completed":
      return "Hoàn thành";
    case "cancelled":
      return "Hủy bỏ";
    default:
      return status;
  }
};

const getContractStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "#16a34a"; // green-600
    case "completed":
      return "#2563eb"; // blue-600
    case "cancelled":
      return "#dc2626"; // red-600
    default:
      return "inherit";
  }
};

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

const getVietnamTodayKey = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
};

const getMaxDateKey = () => {
  const todayKey = getVietnamTodayKey();
  const [year, month, day] = todayKey.split("-").map(Number);
  return `${year + 1}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

const addDaysToDateKey = (dateKey: string, days: number) => {
  const date = createUtcDateFromDateKey(dateKey);

  date.setUTCDate(date.getUTCDate() + days);

  return formatUtcDateKey(date);
};

const getStartOfWeekKey = (dateKey: string) => {
  const date = createUtcDateFromDateKey(dateKey);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + diff);

  return formatUtcDateKey(date);
};

const getDateParts = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return {
    year,
    month,
    day,
  };
};

const formatDayTitle = (dateKey: string) => {
  const { year, month, day } = getDateParts(dateKey);

  return `${day} Th${month}, ${year}`;
};

const formatWeekTitle = (dateKey: string) => {
  const startOfWeekKey = getStartOfWeekKey(dateKey);
  const endOfWeekKey = addDaysToDateKey(startOfWeekKey, 6);

  const start = getDateParts(startOfWeekKey);
  const end = getDateParts(endOfWeekKey);

  if (start.year !== end.year) {
    return `${start.day} Th${start.month}, ${start.year} - ${end.day} Th${end.month}, ${end.year}`;
  }

  return `${start.day} Th${start.month} - ${end.day} Th${end.month}, ${end.year}`;
};

const formatWeekRangeDisplay = (dateKey: string) => {
  const startOfWeekKey = getStartOfWeekKey(dateKey);
  const endOfWeekKey = addDaysToDateKey(startOfWeekKey, 6);

  const start = getDateParts(startOfWeekKey);
  const end = getDateParts(endOfWeekKey);

  const startStr = `${String(start.day).padStart(2, "0")}/${String(start.month).padStart(2, "0")}/${start.year}`;
  const endStr = `${String(end.day).padStart(2, "0")}/${String(end.month).padStart(2, "0")}/${end.year}`;

  return `${startStr} - ${endStr}`;
};

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;
  const years = [];
  for (let y = 2000; y <= maxYear; y++) {
    years.push(y);
  }
  return years;
};

const getWeekOptionsForYear = (year: number) => {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay();
  const startMonday = new Date(jan1);
  const diff = jan1Day === 0 ? -6 : 1 - jan1Day;
  startMonday.setUTCDate(jan1.getUTCDate() + diff);

  const maxDateKey = getMaxDateKey();
  const options = [];

  for (let w = 0; w < 54; w++) {
    const start = new Date(startMonday);
    start.setUTCDate(startMonday.getUTCDate() + w * 7);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    if (start.getUTCFullYear() !== year && end.getUTCFullYear() !== year) {
      continue;
    }

    const startKey = formatUtcDateKey(start);
    const endKey = formatUtcDateKey(end);

    if (endKey < "2000-01-01") continue;
    if (startKey > maxDateKey) continue;

    const startStr = `${String(start.getUTCDate()).padStart(2, "0")}/${String(
      start.getUTCMonth() + 1
    ).padStart(2, "0")}/${start.getUTCFullYear()}`;
    const endStr = `${String(end.getUTCDate()).padStart(2, "0")}/${String(
      end.getUTCMonth() + 1
    ).padStart(2, "0")}/${end.getUTCFullYear()}`;

    options.push({
      value: startKey,
      label: `${startStr} - ${endStr}`,
    });
  }

  return options;
};

const YearDropdown = ({
  selectedYear,
  years,
  onChange,
}: {
  selectedYear: number;
  years: number[];
  onChange: (year: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center gap-1 border border-slate-300 bg-white px-3 hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-700 transition-colors"
      >
        <span className="text-xs text-slate-400 font-semibold uppercase mr-1">Năm</span>
        <span className="font-bold text-slate-800">{selectedYear}</span>
        <ChevronDown size={14} className="text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 bg-white border border-slate-200 shadow-xl max-h-60 overflow-y-auto rounded-xl py-1 min-w-[120px]">
          {years.map((y) => {
            const isSelected = y === selectedYear;
            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  onChange(y);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  isSelected
                    ? "font-bold bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DayPickerDropdown = ({
  value,
  minDate,
  maxDate,
  onChange,
  iconOnly = false,
}: {
  value: string;
  minDate: string;
  maxDate: string;
  onChange: (date: string) => void;
  iconOnly?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [currentDateObj, setCurrentDateObj] = useState(() => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  });

  const calendarYear = currentDateObj.getUTCFullYear();
  const calendarMonth = currentDateObj.getUTCMonth();

  useEffect(() => {
    const [y, m, d] = value.split("-").map(Number);
    setCurrentDateObj(new Date(Date.UTC(y, m - 1, d)));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayDateStr = () => {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  };

  const handleMonthChange = (offset: number) => {
    const nextDate = new Date(currentDateObj);
    nextDate.setUTCMonth(nextDate.getUTCMonth() + offset);
    
    const nextYear = nextDate.getUTCFullYear();
    const minYear = Number(minDate.split("-")[0]);
    const maxYear = Number(maxDate.split("-")[0]);
    
    if (nextYear < minYear || nextYear > maxYear) return;
    
    setCurrentDateObj(nextDate);
  };

  const generateDays = () => {
    const startOfMonth = new Date(Date.UTC(calendarYear, calendarMonth, 1));
    const startDayOfWeek = startOfMonth.getUTCDay();
    const adjustDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    const prevMonthLast = new Date(Date.UTC(calendarYear, calendarMonth, 0));
    const prevMonthDays = prevMonthLast.getUTCDate();
    for (let i = adjustDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const y = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      days.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }

    const daysInMonth = new Date(Date.UTC(calendarYear, calendarMonth + 1, 0)).getUTCDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month: calendarMonth, year: calendarYear, isCurrentMonth: true });
    }

    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const m = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const y = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      days.push({ day: i, month: m, year: y, isCurrentMonth: false });
    }

    return days;
  };

  const days = generateDays();
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-6 w-6 items-center justify-center rounded cursor-pointer hover:bg-slate-200 text-slate-500 focus:outline-none transition-colors"
          title="Chọn ngày cụ thể để nhảy nhanh đến tuần"
        >
          <Calendar size={16} className="shrink-0" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 items-center justify-between gap-2 border border-slate-300 bg-white px-3 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-700 min-w-[140px] transition-colors"
          title="Chọn ngày"
        >
          <span className="font-semibold text-slate-800">{displayDateStr()}</span>
          <Calendar size={15} className="text-slate-400 shrink-0" />
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-slate-800">
              {monthNames[calendarMonth]}, {calendarYear}
            </span>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dayNames.map((name) => (
              <span key={name} className="text-[11px] font-bold text-slate-400 uppercase">
                {name}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((dObj, idx) => {
              const dateStr = `${dObj.year}-${String(dObj.month + 1).padStart(2, "0")}-${String(dObj.day).padStart(2, "0")}`;
              const isSelected = dateStr === value;
              const isToday = () => {
                const today = new Date();
                return today.getFullYear() === dObj.year &&
                       today.getMonth() === dObj.month &&
                       today.getDate() === dObj.day;
              };
              
              const isOutOfRange = dateStr < minDate || dateStr > maxDate;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isOutOfRange}
                  onClick={() => {
                    onChange(dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-8 w-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : isToday()
                      ? "border border-blue-600 text-blue-600"
                      : dObj.isCurrentMonth
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-300 hover:bg-slate-50"
                  } disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
                >
                  {dObj.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const WeekDropdown = ({
  selectedWeekKey,
  weeks,
  onChange,
  onCalendarClick,
  minDayLimit,
  maxDayLimit,
}: {
  selectedWeekKey: string;
  weeks: { value: string; label: string }[];
  onChange: (weekKey: string) => void;
  onCalendarClick: (dateKey: string) => void;
  minDayLimit: string;
  maxDayLimit: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedWeek = weeks.find((w) => w.value === selectedWeekKey) || weeks[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex h-10 items-center border border-slate-300 bg-white rounded-lg focus-within:border-blue-700 overflow-hidden">
        <div className="flex h-full w-10 items-center justify-center border-r border-slate-200">
          <DayPickerDropdown
            value={selectedWeekKey}
            minDate={minDayLimit}
            maxDate={maxDayLimit}
            onChange={onCalendarClick}
            iconOnly={true}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-full min-w-[245px] items-center justify-between px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
        >
          <span>{selectedWeek?.label || "Chọn tuần"}</span>
          <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 bg-white border border-slate-200 shadow-xl max-h-80 overflow-y-auto rounded-xl py-2 min-w-[285px]">
          {weeks.map((w) => {
            const isSelected = w.value === selectedWeekKey;
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => {
                  onChange(w.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  isSelected
                    ? "font-bold bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export function ShiftToolbar({
  viewMode,
  selectedLocation,
  locations,
  currentDate,
  onChangeViewMode,
  onChangeLocation,
  onChangeDate,
  onClickAdd,
}: ShiftToolbarProps) {
  const dateTitle =
    viewMode === "day"
      ? formatDayTitle(currentDate)
      : formatWeekTitle(currentDate);

  const maxDateKey = getMaxDateKey();
  const selectedYear = Number(currentDate.split("-")[0]);
  const maxYear = Number(maxDateKey.split("-")[0]);

  const minDayLimit = selectedYear === 2000 ? "2000-01-01" : `${selectedYear}-01-01`;
  const maxDayLimit = selectedYear === maxYear ? maxDateKey : `${selectedYear}-12-31`;

  const handleSelectYear = (year: number) => {
    const parts = currentDate.split("-");
    const month = parts[1];
    const day = parts[2];
    
    let newDateKey = `${year}-${month}-${day}`;
    
    const parsed = createUtcDateFromDateKey(newDateKey);
    if (parsed.getUTCMonth() + 1 !== Number(month)) {
      const lastDay = new Date(Date.UTC(year, Number(month), 0));
      newDateKey = formatUtcDateKey(lastDay);
    }
    
    if (newDateKey > maxDateKey) {
      newDateKey = maxDateKey;
    }
    if (newDateKey < "2000-01-01") {
      newDateKey = "2000-01-01";
    }

    onChangeDate(newDateKey);
  };

  const isPrevDisabled =
    viewMode === "day"
      ? currentDate <= "2000-01-01"
      : getStartOfWeekKey(currentDate) <= getStartOfWeekKey("2000-01-01");

  const isNextDisabled =
    viewMode === "day"
      ? currentDate >= maxDateKey
      : getStartOfWeekKey(currentDate) >= getStartOfWeekKey(maxDateKey);

  const handlePrevious = () => {
    let nextDate =
      viewMode === "day"
        ? addDaysToDateKey(currentDate, -1)
        : addDaysToDateKey(currentDate, -7);

    if (nextDate < "2000-01-01") {
      nextDate = "2000-01-01";
    }
    onChangeDate(nextDate);
  };

  const handleNext = () => {
    let nextDate =
      viewMode === "day"
        ? addDaysToDateKey(currentDate, 1)
        : addDaysToDateKey(currentDate, 7);

    if (nextDate > maxDateKey) {
      nextDate = maxDateKey;
    }
    onChangeDate(nextDate);
  };

  const handleToday = () => {
    onChangeDate(getVietnamTodayKey());
  };

  const handleSelectDate = (date: string) => {
    if (!date) {
      return;
    }

    if (date < "2000-01-01") {
      onChangeDate("2000-01-01");
    } else if (date > maxDateKey) {
      onChangeDate(maxDateKey);
    } else {
      onChangeDate(date);
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex h-10 items-center border border-slate-300 bg-white p-1 rounded-lg">
        <button
          type="button"
          onClick={() => onChangeViewMode("day")}
          className={`h-8 px-5 text-sm font-medium rounded-md ${
            viewMode === "day"
              ? "bg-blue-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Ngày
        </button>

        <button
          type="button"
          onClick={() => onChangeViewMode("week")}
          className={`h-8 px-5 text-sm font-medium rounded-md ${
            viewMode === "week"
              ? "bg-blue-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Tuần
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isPrevDisabled}
          className="flex h-10 w-10 items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 rounded-lg"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={handleToday}
          className="h-10 min-w-[220px] cursor-pointer border border-slate-300 bg-white px-4 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700 rounded-lg"
          title="Bấm để quay về hôm nay"
        >
          {dateTitle}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled}
          className="flex h-10 w-10 items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 rounded-lg"
        >
          <ChevronRight size={18} />
        </button>

        {/* Bộ chọn năm */}
        <YearDropdown
          selectedYear={selectedYear}
          years={getYearOptions()}
          onChange={handleSelectYear}
        />

        {viewMode === "day" ? (
          <DayPickerDropdown
            value={currentDate}
            minDate={minDayLimit}
            maxDate={maxDayLimit}
            onChange={handleSelectDate}
          />
        ) : (
          <WeekDropdown
            selectedWeekKey={getStartOfWeekKey(currentDate)}
            weeks={getWeekOptionsForYear(selectedYear)}
            onChange={handleSelectDate}
            onCalendarClick={handleSelectDate}
            minDayLimit={minDayLimit}
            maxDayLimit={maxDayLimit}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 min-w-[220px] items-center gap-2 border border-slate-300 bg-white px-4 rounded-lg focus-within:border-blue-700 hover:bg-slate-100">
          <MapPin size={17} className="text-slate-500" />

          <select
            value={selectedLocation}
            onChange={(event) => onChangeLocation(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả vị trí</option>

            {locations.map((loc) => (
              <option
                key={loc.address}
                value={loc.address}
                style={{ color: getContractStatusColor(loc.status) }}
              >
                {loc.address} [{getContractStatusLabel(loc.status)}]
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onClickAdd}
          className="flex h-10 cursor-pointer items-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 rounded-lg"
        >
          <Plus size={16} />
          THÊM CA TRỰC
        </button>
      </div>
    </div>
  );
}
