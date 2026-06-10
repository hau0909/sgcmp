"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit,
  FileBadge,
  History,
  IdCard,
  Mail,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";

export type GuardStatus = "available" | "working" | "leave";

export type Guard = {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  identityNumber: string;
  address: string;
  position: string;
  experience: string;
  height: string;
  weight: string;
  skills: string[];
  status: GuardStatus;
  username: string;
  mobileStatus: "activated" | "not-activated";
  avatarUrl: string;
};

export const guards: Guard[] = [
  {
    id: "1",
    code: "BV-001",
    fullName: "Nguyễn Văn Hùng",
    phone: "0901234567",
    email: "hung.nv@sgcmp.com",
    gender: "Nam",
    dateOfBirth: "12/05/1990",
    identityNumber: "012345678901",
    address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    position: "Bảo vệ nội bộ",
    experience: "5 năm",
    height: "175 cm",
    weight: "75 kg",
    skills: ["Võ thuật cơ bản", "PCCC & CHCN", "Sơ cấp cứu"],
    status: "available",
    username: "0901234567",
    mobileStatus: "activated",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "2",
    code: "BV-002",
    fullName: "Trần Đình Trung",
    phone: "0918765432",
    email: "trung.td@sgcmp.com",
    gender: "Nam",
    dateOfBirth: "20/08/1992",
    identityNumber: "079234567890",
    address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
    position: "Bảo vệ ca đêm",
    experience: "3 năm",
    height: "170 cm",
    weight: "70 kg",
    skills: ["Lái xe", "Giám sát camera"],
    status: "working",
    username: "0918765432",
    mobileStatus: "activated",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "3",
    code: "BV-003",
    fullName: "Lê Hoàng Nam",
    phone: "0933445566",
    email: "nam.lh@sgcmp.com",
    gender: "Nam",
    dateOfBirth: "15/03/1995",
    identityNumber: "031456789012",
    address: "88 Trần Hưng Đạo, Quận 5, TP.HCM",
    position: "Bảo vệ sự kiện",
    experience: "2 năm",
    height: "172 cm",
    weight: "72 kg",
    skills: ["Sơ cấp cứu"],
    status: "leave",
    username: "0933445566",
    mobileStatus: "not-activated",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
  },
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
    className: "border-green-200 bg-green-50 text-green-700",
    dotClassName: "bg-green-500",
  },
  working: {
    label: "Đang trong ca",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  leave: {
    label: "Đang nghỉ phép",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    dotClassName: "bg-slate-400",
  },
};

const recentShifts = [
  {
    date: "24/10/2023",
    target: "Tòa nhà Bitexco - Cổng chính",
    time: "06:00 - 18:00",
    status: "Hoàn thành",
    statusClassName: "bg-green-50 text-green-700 border-green-200",
  },
  {
    date: "23/10/2023",
    target: "Tòa nhà Bitexco - Hầm xe B1",
    time: "18:00 - 06:00 (+1)",
    status: "Hoàn thành",
    statusClassName: "bg-green-50 text-green-700 border-green-200",
  },
  {
    date: "21/10/2023",
    target: "Vincom Center - Sảnh Lễ tân",
    time: "06:00 - 18:00",
    status: "Hoàn thành",
    statusClassName: "bg-green-50 text-green-700 border-green-200",
  },
  {
    date: "20/10/2023",
    target: "Vincom Center - Tuần tra Tầng 1",
    time: "06:00 - 18:00",
    status: "Nghỉ phép",
    statusClassName: "bg-white text-slate-600 border-slate-300",
  },
];

export default function GuardDetailPage() {
  const router = useRouter();
  const params = useParams();

  const guardId = Array.isArray(params.id) ? params.id[0] : params.id;

  const guard = useMemo(() => {
    return guards.find((item) => item.id === guardId);
  }, [guardId]);

  if (!guard) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="rounded-md border border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Không tìm thấy hồ sơ bảo vệ.
          </p>
        </div>
      </div>
    );
  }

  const status = statusConfig[guard.status];
  const isMobileActivated = guard.mobileStatus === "activated";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <img
            src={guard.avatarUrl}
            alt={guard.fullName}
            className="h-16 w-16 border border-slate-300 object-cover shadow-sm"
          />

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-950">
                {guard.fullName}
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                />
                {status.label}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <IdCard className="h-3.5 w-3.5 text-blue-800" />
                {guard.code}
              </span>

              <span className="flex items-center gap-1">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-slate-500" />
                {guard.position}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
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
              <InfoItem label="Họ và tên" value={guard.fullName} />
              <InfoItem label="Ngày sinh" value={guard.dateOfBirth} />
              <InfoItem label="Giới tính" value={guard.gender} />
              <InfoItem label="CCCD/CMND" value={guard.identityNumber} />

              <div className="md:col-span-2">
                <InfoItem label="Địa chỉ thường trú" value={guard.address} />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <FileBadge className="h-4 w-4 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Kỹ năng & thể chất
              </h2>
            </div>

            <div className="grid gap-x-12 gap-y-5 md:grid-cols-3">
              <InfoItem label="Kinh nghiệm làm việc" value={guard.experience} />
              <InfoItem label="Chiều cao" value={guard.height} />
              <InfoItem label="Cân nặng" value={guard.weight} />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-slate-500">
                Chứng chỉ nghiệp vụ
              </p>

              <div className="flex flex-wrap gap-2">
                {guard.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
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
                    {guard.phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {guard.email}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-blue-200 pb-3">
              <Smartphone className="h-4 w-4 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800">
                Trạng thái mobile app
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-slate-600">Tên đăng nhập</p>
                <p className="font-bold text-slate-950">{guard.username}</p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-slate-600">Trạng thái</p>

                {isMobileActivated ? (
                  <p className="flex items-center gap-1 text-sm font-bold text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã kích hoạt
                  </p>
                ) : (
                  <p className="flex items-center gap-1 text-sm font-bold text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    Chưa kích hoạt
                  </p>
                )}
              </div>

              <button
                type="button"
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Cấp lại mật khẩu
              </button>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-300 px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-800" />
            <h2 className="text-base font-bold text-slate-950">
              Lịch sử ca trực gần đây
            </h2>
          </div>

          <button
            type="button"
            className="text-sm font-bold text-blue-800 hover:underline"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="bg-sky-200/80 text-xs font-bold uppercase text-slate-700">
                <th className="w-[150px] px-5 py-3">Ngày</th>
                <th className="px-5 py-3">Mục tiêu</th>
                <th className="w-[220px] px-5 py-3">Thời gian ca</th>
                <th className="w-[170px] px-5 py-3">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {recentShifts.map((shift) => (
                <tr
                  key={`${shift.date}-${shift.target}`}
                  className="border-t border-slate-200 text-sm text-slate-800"
                >
                  <td className="px-5 py-3 font-medium">{shift.date}</td>

                  <td className="px-5 py-3 font-bold text-slate-950">
                    {shift.target}
                  </td>

                  <td className="px-5 py-3 font-medium">{shift.time}</td>

                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${shift.statusClassName}`}
                    >
                      {shift.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
