"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Edit, Mail, Phone, User, UserRound } from "lucide-react";

import { requestGetGuardDetail } from "@/features/guards/api/guard.api";
import type { GuardDetail, GuardDetailProfile } from "@/features/guards/type";

const getProfile = (
  profiles: GuardDetail["profiles"],
): GuardDetailProfile | null => {
  if (!profiles) {
    return null;
  }

  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
};

const formatDate = (date: string | null | undefined): string => {
  if (!date) {
    return "Chưa cập nhật";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("vi-VN").format(parsedDate);
};

const formatGender = (gender: string | null | undefined): string => {
  if (!gender) {
    return "Chưa cập nhật";
  }

  const normalizedGender = gender.trim().toLowerCase();

  if (normalizedGender === "male") {
    return "Nam";
  }

  if (normalizedGender === "female") {
    return "Nữ";
  }

  return gender;
};

export default function GuardDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();

  const guardId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [guard, setGuard] = useState<GuardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchGuardDetail = async () => {
      if (!guardId) {
        setErrorMessage("Không tìm thấy bảo vệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const result = await requestGetGuardDetail(guardId);

        if (!result.success || !result.data) {
          throw new Error(result.message);
        }

        setGuard(result.data);
      } catch (error: unknown) {
        setGuard(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin bảo vệ",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchGuardDetail();
  }, [guardId]);

  const profile = useMemo(() => {
    return guard ? getProfile(guard.profiles) : null;
  }, [guard]);

  const identity = guard?.identity ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <div className="rounded-md border border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            Đang tải thông tin bảo vệ...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !guard) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="rounded-md border border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-red-600">
            {errorMessage || "Không tìm thấy hồ sơ bảo vệ"}
          </p>
        </div>
      </div>
    );
  }

  const fullName = profile?.full_name ?? "Chưa cập nhật";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Quay lại"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={`Ảnh của ${fullName}`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-md border border-slate-300 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-slate-300 bg-slate-200 text-slate-500">
              <UserRound className="h-7 w-7" />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-950">{fullName}</h1>

            <p className="mt-2 text-sm font-medium text-slate-600">
              Thông tin chi tiết nhân viên bảo vệ
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/guards/${guard.guard_id}/edit`)}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
          Chỉnh sửa hồ sơ
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <User className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Thông tin cá nhân
              </h2>
            </div>

            <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
              <InfoItem label="Họ và tên" value={fullName} />

              <InfoItem
                label="Ngày sinh"
                value={formatDate(profile?.date_of_birth)}
              />

              <InfoItem
                label="Giới tính"
                value={formatGender(profile?.gender)}
              />

              <InfoItem
                label="CCCD/CMND"
                value={identity?.identity_id ?? "Chưa cập nhật"}
              />

              <InfoItem
                label="Ngày cấp"
                value={formatDate(identity?.issue_date)}
              />

              <InfoItem
                label="Nơi cấp"
                value={identity?.issue_place ?? "Chưa cập nhật"}
              />

              <div className="md:col-span-2">
                <InfoItem
                  label="Địa chỉ thường trú"
                  value={profile?.address ?? "Chưa cập nhật"}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <Mail className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Thông tin liên hệ
              </h2>
            </div>

            <div className="space-y-5">
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-slate-500" />

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Số điện thoại
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {profile?.phone_number ?? "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-slate-500" />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Email</p>

                  <p className="mt-1 break-all text-sm font-bold text-slate-950">
                    {profile?.email ?? "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
