import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react";

type ShiftToolbarProps = {
  viewMode: "day" | "week";
  selectedLocation: string;
  locations: string[];
  currentDate: string;
  onChangeViewMode: (mode: "day" | "week") => void;
  onChangeLocation: (location: string) => void;
  onChangeDate: (date: string) => void;
  onClickAdd: () => void;
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

  const handlePrevious = () => {
    const nextDate =
      viewMode === "day"
        ? addDaysToDateKey(currentDate, -1)
        : addDaysToDateKey(currentDate, -7);

    onChangeDate(nextDate);
  };

  const handleNext = () => {
    const nextDate =
      viewMode === "day"
        ? addDaysToDateKey(currentDate, 1)
        : addDaysToDateKey(currentDate, 7);

    onChangeDate(nextDate);
  };

  const handleToday = () => {
    onChangeDate(getVietnamTodayKey());
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex h-10 items-center border border-slate-300 bg-white p-1">
        <button
          type="button"
          onClick={() => onChangeViewMode("day")}
          className={`h-8 px-5 text-sm font-medium ${
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
          className={`h-8 px-5 text-sm font-medium ${
            viewMode === "week"
              ? "bg-blue-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Tuần
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          className="flex h-10 w-10 items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={handleToday}
          className="h-10 cursor-pointer min-w-[220px] border border-slate-300 bg-white px-4 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700"
        >
          {dateTitle}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex h-10 w-10 items-center justify-center border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 min-w-[220px] items-center gap-2 border border-slate-300 bg-white px-4">
          <MapPin size={17} className="text-slate-500" />

          <select
            value={selectedLocation}
            onChange={(event) => onChangeLocation(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          >
            <option value="all">Tất cả vị trí</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onClickAdd}
          className="flex h-10 cursor-pointer items-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Plus size={16} />
          THÊM CA TRỰC
        </button>
      </div>
    </div>
  );
}
