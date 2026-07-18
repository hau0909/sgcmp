"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { requestGetAllGuards } from "@/features/guards/api/guard.api";
import { requestGetGuardAvailability } from "@/features/shift/api/shift.api";
import type { GuardListItem, GuardProfileItem } from "@/features/guards/type";
import { getEndOfDayInTimeZone, getUserTimeZone } from "@/utils/dateTime";

const PAGE_SIZE = 10;

const getGuardProfile = (
  profiles: GuardListItem["profiles"],
): GuardProfileItem | null => {
  if (!profiles) {
    return null;
  }

  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
};

const GuardTableSkeleton = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-t border-slate-200">
          <td className="px-4 py-3">
            <div className="h-4 w-8 animate-pulse rounded bg-slate-200" />
          </td>

          <td className="px-4 py-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
          </td>

          <td className="px-4 py-3">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-slate-200" />
          </td>

          <td className="px-4 py-3">
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          </td>

          <td className="px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </td>

          <td className="px-4 py-3">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          </td>

          <td className="px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          </td>

          <td className="px-4 py-3 text-center">
            <div className="mx-auto h-4 w-14 animate-pulse rounded bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
};

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

const CustomSelect = ({ value, onChange, options, placeholder }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative inline-block min-w-[170px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 w-full items-center justify-between border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-700 focus:bg-white rounded-lg cursor-pointer ${
          value ? "font-bold text-slate-950" : ""
        }`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 w-full min-w-[170px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                opt.value === value
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function GuardListScreen() {
  const router = useRouter();

  const [guards, setGuards] = useState<GuardListItem[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const workStatusOptions = [
    { value: "", label: "Lịch hôm nay (Tất cả)" },
    { value: "on_duty", label: "Đang trực" },
    { value: "assigned", label: "Phân công" },
    { value: "available", label: "Đang rảnh" },
  ];

  const statusOptions = [
    { value: "", label: "Trạng thái (Tất cả)" },
    { value: "active", label: "Hoạt động" },
    { value: "unactive", label: "Vô hiệu hóa" },
  ];

  const genderOptions = [
    { value: "", label: "Giới tính (Tất cả)" },
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
  ];
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  const [workStatusFilter, setWorkStatusFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalGuards, setTotalGuards] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [availability, setAvailability] = useState<
    Record<string, { isOnDuty: boolean; hasUpcomingShiftToday: boolean }>
  >({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setCurrentPage(1);
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [genderFilter, statusFilter, workStatusFilter]);

  useEffect(() => {
    let isCancelled = false;

    const fetchGuards = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await requestGetAllGuards({
          page: currentPage,
          limit: PAGE_SIZE,
          search: debouncedSearchValue,
          gender: genderFilter,
          status: statusFilter,
          workStatus: workStatusFilter,
        });

        if (isCancelled) {
          return;
        }

        if (!result.success) {
          throw new Error(result.message);
        }

        setGuards(result.data.guards);
        setTotalGuards(result.data.pagination.total);
        setTotalPages(result.data.pagination.totalPages || 1);
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        setGuards([]);
        setTotalGuards(0);
        setTotalPages(1);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách bảo vệ",
        );
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void fetchGuards();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedSearchValue, genderFilter, statusFilter, workStatusFilter]);

  useEffect(() => {
    if (guards.length === 0) {
      setAvailability({});
      return;
    }

    let isCancelled = false;

    const fetchAvailability = async () => {
      try {
        const guardUserIds = guards
          .map((g) => getGuardProfile(g.profiles)?.user_id)
          .filter((id): id is string => !!id);

        if (guardUserIds.length === 0) return;

        const now = new Date();
        const nowStr = now.toISOString();
        // Shift endTime forward by 1 second to cover exact boundary starts
        const nowPlus1sStr = new Date(now.getTime() + 1000).toISOString();

        // Calculate today's end time in user local time
        const todayEnd = getEndOfDayInTimeZone(now, getUserTimeZone());

        const [nowResult, futureResult] = await Promise.all([
          requestGetGuardAvailability({
            guardIds: guardUserIds,
            startTime: nowStr,
            endTime: nowPlus1sStr,
          }),
          requestGetGuardAvailability({
            guardIds: guardUserIds,
            startTime: nowStr,
            endTime: todayEnd,
          }),
        ]);

        if (isCancelled) return;

        const nowData = nowResult.data || {};
        const futureData = futureResult.data || {};

        const mapped: Record<string, { isOnDuty: boolean; hasUpcomingShiftToday: boolean }> = {};
        for (const userId of guardUserIds) {
          const nowVal = nowData[userId];
          const futureVal = futureData[userId];
          mapped[userId] = {
            isOnDuty: nowVal ? (typeof nowVal === "object" ? !!(nowVal as any).hasConflict : !!nowVal) : false,
            hasUpcomingShiftToday: futureVal ? (typeof futureVal === "object" ? !!(futureVal as any).hasConflict : !!futureVal) : false,
          };
        }

        setAvailability(mapped);
      } catch (error) {
        console.error("Error fetching guard availability:", error);
      }
    };

    void fetchAvailability();

    return () => {
      isCancelled = true;
    };
  }, [guards]);

  const guardsWithIndex = useMemo(() => {
    return guards.map((guard, index) => ({
      guard,
      displayIndex: (currentPage - 1) * PAGE_SIZE + index + 1,
    }));
  }, [guards, currentPage]);

  const startResult = totalGuards > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;

  const endResult =
    totalGuards > 0 ? Math.min(currentPage * PAGE_SIZE, totalGuards) : 0;

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Danh sách nhân viên bảo vệ
          </h1>

          <p className="mt-1 text-md text-slate-600">
            Quản lý hồ sơ của đội ngũ bảo vệ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/guards/add")}
          className="flex h-10 cursor-pointer items-center gap-2 bg-blue-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
        >
          <Plus className="h-4 w-4" />
          Thêm bảo vệ
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-300 bg-white">
        <div className="border-b border-slate-300 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:max-w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Tìm kiếm theo họ tên, SĐT, email..."
              className="h-9 w-full border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white rounded-lg"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CustomSelect
              value={workStatusFilter}
              onChange={setWorkStatusFilter}
              options={workStatusOptions}
              placeholder="Lịch hôm nay (Tất cả)"
            />

            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Trạng thái (Tất cả)"
            />

            <CustomSelect
              value={genderFilter}
              onChange={setGenderFilter}
              options={genderOptions}
              placeholder="Giới tính (Tất cả)"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-left">
            <thead>
              <tr className="bg-sky-200/80 text-xs font-bold uppercase text-slate-950">
                <th className="w-[100px] px-4 py-3">STT</th>
                <th className="w-[120px] px-4 py-3">Ảnh</th>
                <th className="w-[240px] px-4 py-3">Họ và tên</th>
                <th className="w-[120px] px-4 py-3">Giới tính</th>
                <th className="w-[180px] px-4 py-3">Số điện thoại</th>
                <th className="w-[180px] px-4 py-3">Lịch hôm nay</th>
                <th className="w-[160px] px-4 py-3">Trạng thái</th>
                <th className="w-[110px] px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <GuardTableSkeleton />
              ) : errorMessage ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-red-600"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : guardsWithIndex.length > 0 ? (
                guardsWithIndex.map(({ guard, displayIndex }) => {
                  const profile = getGuardProfile(guard.profiles);

                  return (
                    <tr
                      key={guard.guard_id}
                      className="border-t border-slate-200 text-sm text-slate-800 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">{displayIndex}</td>

                      <td className="px-4 py-3">
                        {profile?.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={`Ảnh của ${profile.full_name ?? "nhân viên bảo vệ"
                              }`}
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                            <UserRound className="h-5 w-5" />
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-950">
                        <div className="font-semibold">{profile?.full_name ?? "Chưa cập nhật"}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{profile?.email ?? "Chưa cập nhật"}</div>
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {(() => {
                          const g = profile?.gender?.trim().toLowerCase();
                          if (g === "male" || g === "nam") return "Nam";
                          if (g === "female" || g === "nữ" || g === "nu") return "Nữ";
                          return profile?.gender ?? "Chưa cập nhật";
                        })()}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {profile?.phone_number ?? "Chưa cập nhật"}
                      </td>

                      <td className="px-4 py-3">
                        {profile?.user_id && availability[profile.user_id] === undefined ? (
                          <span className="text-xs text-slate-400">Đang kiểm tra...</span>
                        ) : profile?.user_id && availability[profile.user_id]?.isOnDuty ? (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            ĐANG TRỰC
                          </span>
                        ) : profile?.user_id && availability[profile.user_id]?.hasUpcomingShiftToday ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            PHÂN CÔNG
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            ĐANG RẢNH
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {profile?.status === "active" ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                            HOẠT ĐỘNG
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                            VÔ HIỆU HÓA
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/guards/${guard.guard_id}`)
                          }
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
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    {debouncedSearchValue
                      ? "Không tìm thấy nhân viên bảo vệ phù hợp."
                      : "Chưa có nhân viên bảo vệ."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>
            Hiển thị {startResult}-{endResult} trong số {totalGuards} kết quả
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!canGoPrevious || loading}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              aria-label="Trang trước"
              className="flex h-8 w-8 cursor-pointer hover:bg-gray-300 transition-all duration-300 items-center justify-center border border-slate-300 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="h-8 min-w-8 bg-sky-400 px-2 text-sm font-semibold text-white"
            >
              {currentPage}
            </button>

            <span className="px-2 text-sm text-slate-500">/ {totalPages}</span>

            <button
              type="button"
              disabled={!canGoNext || loading}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              aria-label="Trang sau"
              className="flex h-8 w-8 cursor-pointer hover:bg-gray-300 transition-all duration-300 items-center justify-center border border-slate-300 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
