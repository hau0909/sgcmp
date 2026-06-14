import { ChevronLeft, ChevronRight, MapPin, Plus } from "lucide-react";

type ShiftToolbarProps = {
  viewMode: "day" | "week";
  selectedLocation: string;
  locations: string[];
  onChangeViewMode: (mode: "day" | "week") => void;
  onChangeLocation: (location: string) => void;
  onClickAdd: () => void;
};

export function ShiftToolbar({
  viewMode,
  selectedLocation,
  locations,
  onChangeViewMode,
  onChangeLocation,
  onClickAdd,
}: ShiftToolbarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center rounded-md border border-slate-300 bg-white p-1">
        <button
          type="button"
          onClick={() => onChangeViewMode("day")}
          className={`rounded px-5 py-2 text-sm font-medium ${
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
          className={`rounded px-5 py-2 text-sm font-medium ${
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
          className="rounded border border-slate-300 bg-white p-2 hover:bg-slate-100"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          className="rounded border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Hôm nay
        </button>

        <button
          type="button"
          className="rounded border border-slate-300 bg-white p-2 hover:bg-slate-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex min-w-[220px] items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2">
          <MapPin size={17} className="text-slate-500" />

          <select
            value={selectedLocation}
            onChange={(event) => onChangeLocation(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          >
            <option value="all">Tất cả Mục tiêu</option>

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
          className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Plus size={16} />
          THÊM CA TRỰC
        </button>
      </div>
    </div>
  );
}