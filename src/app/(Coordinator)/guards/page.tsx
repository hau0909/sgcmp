"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
type GuardStatus = "available" | "working" | "leave";

type Guard = {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  skills: string[];
  status: GuardStatus;
};

const guards: Guard[] = [
  {
    id: "1",
    code: "BV-001",
    fullName: "Nguyễn Văn Hùng",
    phone: "0901234567",
    skills: ["Võ thuật", "PCCC"],
    status: "available",
  },
  {
    id: "2",
    code: "BV-002",
    fullName: "Trần Đình Trung",
    phone: "0918765432",
    skills: ["Lái xe", "Giám sát camera"],
    status: "working",
  },
  {
    id: "3",
    code: "BV-003",
    fullName: "Lê Hoàng Nam",
    phone: "0933445566",
    skills: ["Sơ cấp cứu"],
    status: "leave",
  },
];

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "available", label: "Đang trống lịch" },
  { value: "working", label: "Đang trong ca" },
  { value: "leave", label: "Đang nghỉ phép" },
];

const statusConfig: Record<
  GuardStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  available: {
    label: "Đang trống lịch",
    className: "bg-green-50 text-green-700 border-green-200",
    dotClassName: "bg-green-500",
  },
  working: {
    label: "Đang trong ca",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotClassName: "bg-blue-500",
  },
  leave: {
    label: "Đang nghỉ phép",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dotClassName: "bg-slate-400",
  },
};

export default function GuardListScreen() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();
  const filteredGuards = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return guards.filter((guard) => {
      const matchesSearch =
        guard.code.toLowerCase().includes(keyword) ||
        guard.fullName.toLowerCase().includes(keyword) ||
        guard.phone.includes(keyword);

      const matchesStatus =
        statusFilter === "all" || guard.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchValue, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-950">
            Danh sách nhân viên bảo vệ
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý hồ sơ và tình trạng làm việc của đội ngũ bảo vệ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/guards/add")}
          className="cursor-pointer flex h-10 items-center gap-2 bg-blue-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
        >
          <Plus className="h-4 w-4" />
          Thêm bảo vệ
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-300 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-300 p-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-[390px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm kiếm theo Mã NV, Họ tên, SĐT..."
              className="h-9 w-full border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white"
            />
          </div>

          <div className="relative w-full md:w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 w-full appearance-none border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-700"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="bg-sky-200/80 text-xs font-bold uppercase text-slate-950">
                <th className="w-[90px] px-4 py-3">Mã NV</th>
                <th className="w-[220px] px-4 py-3">Họ và tên</th>
                <th className="w-[150px] px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Chứng chỉ / Kỹ năng</th>
                <th className="w-[160px] px-4 py-3">Trạng thái</th>
                <th className="w-[110px] px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filteredGuards.length > 0 ? (
                filteredGuards.map((guard) => {
                  const status = statusConfig[guard.status];

                  return (
                    <tr
                      key={guard.id}
                      className="border-t border-slate-200 text-sm text-slate-800 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">{guard.code}</td>

                      <td className="px-4 py-3 font-bold text-slate-950">
                        {guard.fullName}
                      </td>

                      <td className="px-4 py-3 font-medium">{guard.phone}</td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {guard.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                          />
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/guards/${guard.id}`);
                          }}
                          className="cursor-pointer text-sm font-semibold text-blue-700 hover:underline"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy nhân viên bảo vệ phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>Hiển thị 1-{filteredGuards.length} trong số 45 kết quả</p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="h-8 w-8 bg-sky-400 text-sm font-semibold text-white"
            >
              1
            </button>

            <button
              type="button"
              className="h-8 w-8 border border-slate-300 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              2
            </button>

            <button
              type="button"
              className="h-8 w-8 border border-slate-300 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              3
            </button>

            <span className="flex h-8 w-8 items-center justify-center text-slate-500">
              ...
            </span>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-600 transition hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
