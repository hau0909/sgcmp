"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { requestGetAllGuards } from "@/features/guards/api/guard.api";
import type { GuardListItem, GuardProfileItem } from "@/features/guards/type";

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

export default function GuardListScreen() {
  const router = useRouter();

  const [guards, setGuards] = useState<GuardListItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchGuards = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await requestGetAllGuards();

        if (!result.success) {
          throw new Error(result.message);
        }

        setGuards(result.data);
      } catch (error: unknown) {
        setGuards([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách bảo vệ",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchGuards();
  }, []);

  const filteredGuards = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    const guardsWithIndex = guards.map((guard, index) => ({
      guard,
      displayIndex: index + 1,
    }));

    if (!keyword) {
      return guardsWithIndex;
    }

    return guardsWithIndex.filter(({ guard, displayIndex }) => {
      const profile = getGuardProfile(guard.profiles);

      return (
        String(displayIndex).includes(keyword) ||
        profile?.full_name?.toLowerCase().includes(keyword) ||
        profile?.phone_number?.includes(keyword)
      );
    });
  }, [guards, searchValue]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-slate-950">
            Danh sách nhân viên bảo vệ
          </h1>

          <p className="mt-1 text-sm text-slate-600">
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
        <div className="border-b border-slate-300 p-3">
          <div className="relative w-full md:max-w-[390px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Tìm kiếm theo STT, Họ tên, SĐT..."
              className="h-9 w-full border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-left">
            <thead>
              <tr className="bg-sky-200/80 text-xs font-bold uppercase text-slate-950">
                <th className="w-[100px] px-4 py-3">STT</th>

                <th className="w-[120px] px-4 py-3">Ảnh bảo vệ</th>

                <th className="w-[240px] px-4 py-3">Họ và tên</th>

                <th className="w-[180px] px-4 py-3">Số điện thoại</th>

                <th className="w-[110px] px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Đang tải danh sách bảo vệ...
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-red-600"
                  >
                    {errorMessage}
                  </td>
                </tr>
              ) : filteredGuards.length > 0 ? (
                filteredGuards.map(({ guard, displayIndex }) => {
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
                            alt={`Ảnh của ${
                              profile.full_name ?? "nhân viên bảo vệ"
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

                      <td className="px-4 py-3 font-semibold text-slate-950">
                        {profile?.full_name ?? "Chưa cập nhật"}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {profile?.phone_number ?? "Chưa cập nhật"}
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
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    {searchValue.trim()
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
            Hiển thị{" "}
            {filteredGuards.length > 0 ? `1-${filteredGuards.length}` : "0"}{" "}
            trong số {guards.length} kết quả
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              aria-label="Trang trước"
              className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
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
              disabled
              aria-label="Trang sau"
              className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
