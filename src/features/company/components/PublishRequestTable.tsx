"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PublishRequest {
  request_id: string;
  company_id: string;
  status: string;
  note: string | null;
  requested_at: string;
  companies: {
    company_name: string;
    owner_id: string;
    profiles: {
      full_name: string | null;
      email: string | null;
    } | null;
  } | null;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PUBLISH_REQUESTS: PublishRequest[] = [
  {
    request_id: "REQ-2026-001",
    company_id: "COMP-001",
    status: "pending",
    note: "Yêu cầu phê duyệt công khai công ty dịch vụ bảo vệ Bảo An. Đã hoàn thiện hồ sơ.",
    requested_at: "2026-06-28T08:30:00Z",
    companies: {
      company_name: "Công ty TNHH Dịch vụ Bảo vệ Bảo An",
      owner_id: "USER-001",
      profiles: {
        full_name: "Nguyễn Văn Hùng",
        email: "hung.nguyen@baoansecurity.vn",
      },
    },
  },
  {
    request_id: "REQ-2026-002",
    company_id: "COMP-002",
    status: "approved",
    note: "Đã kiểm tra đầy đủ giấy phép kinh doanh và chứng chỉ nghiệp vụ.",
    requested_at: "2026-06-27T14:15:00Z",
    companies: {
      company_name: "Công ty Cổ phần Thăng Long Security",
      owner_id: "USER-002",
      profiles: {
        full_name: "Trần Thị Mai",
        email: "mai.tran@thanglongsec.com",
      },
    },
  },
  {
    request_id: "REQ-2026-003",
    company_id: "COMP-003",
    status: "pending",
    note: "Cập nhật lại hình ảnh hoạt động và giấy phép mới cấp lại.",
    requested_at: "2026-06-27T09:45:00Z",
    companies: {
      company_name: "Tập đoàn Vệ sĩ Toàn Cầu Global Guard",
      owner_id: "USER-003",
      profiles: {
        full_name: "Lê Hoàng Nam",
        email: "nam.le@globalguard.vn",
      },
    },
  },
  {
    request_id: "REQ-2026-004",
    company_id: "COMP-004",
    status: "rejected",
    note: "Thiếu giấy chứng nhận đủ điều kiện về an ninh trật tự.",
    requested_at: "2026-06-25T16:20:00Z",
    companies: {
      company_name: "Công ty TNHH Vệ sĩ Sài Gòn 247",
      owner_id: "USER-004",
      profiles: {
        full_name: "Phạm Quốc Cường",
        email: "cuong.pham@saigon247.vn",
      },
    },
  },
  {
    request_id: "REQ-2026-005",
    company_id: "COMP-005",
    status: "approved",
    note: "Hồ sơ hợp lệ, yêu cầu đăng tải công khai lên hệ thống.",
    requested_at: "2026-06-24T11:00:00Z",
    companies: {
      company_name: "Công ty Dịch vụ Vệ sĩ Đại Việt",
      owner_id: "USER-005",
      profiles: {
        full_name: "Vũ Minh Trí",
        email: "tri.vu@daivietsecurity.com",
      },
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${minute}`;
  } catch {
    return dateStr;
  }
};

const getInitials = (name: string) => {
  if (!name) return "CO";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

type StatusKey = "pending" | "approved" | "rejected" | string;

const STATUS_CONFIG: Record<
  StatusKey,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Chờ duyệt",
    bg: "bg-[#fef3c7]",
    text: "text-[#b45309]",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  approved: {
    label: "Đã duyệt",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: "Từ chối",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? {
    label: status.toUpperCase(),
    bg: "bg-[#f3f4f6]",
    text: "text-[#374151]",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  };

// ─── Component ───────────────────────────────────────────────────────────────

export default function PublishRequestTable() {
  const [requests, setRequests] = React.useState<PublishRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    // Simulation delay for smooth UI preview
    setTimeout(() => {
      setRequests(MOCK_PUBLISH_REQUESTS);
      setLoading(false);
    }, 400);
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          <span className="animate-pulse">
            Đang tải danh sách yêu cầu công khai...
          </span>
        </div>
      </div>
    );
  }

  // ── Main Render ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
        <span className="hover:text-primary cursor-pointer transition-colors">
          Doanh nghiệp
        </span>
        <ChevronRight className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
        <span className="text-primary font-bold">Yêu cầu công khai</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Danh sách yêu cầu công khai
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Xem xét và xử lý các yêu cầu đăng công khai thông tin công ty lên
            hệ thống.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded text-sm font-medium hover:bg-surface-container-low transition-colors text-on-surface"
        >
          <RefreshCw className="w-4 h-4 text-on-surface-variant" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#b45309]" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Chờ duyệt
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-[#dcfce7] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#166534]" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Đã phê duyệt
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">
              {approvedCount}
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-error-container flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-error" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Từ chối
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">
              {rejectedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#d5e3ff] border-b border-outline-variant">
              <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[70px] text-center whitespace-nowrap">
                STT
              </th>
              <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap">
                Tên công ty
              </th>
              <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[160px] text-center whitespace-nowrap">
                Trạng thái
              </th>
              <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[180px] text-center whitespace-nowrap">
                Ngày giờ
              </th>
              <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[140px] text-right whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-outline-variant bg-white">
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-on-surface-variant font-medium"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Globe className="w-10 h-10 text-on-surface-variant/40" />
                    <span>Chưa có yêu cầu công khai nào.</span>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req, idx) => {
                const companyName = req.companies?.company_name ?? "—";
                const statusCfg = getStatusConfig(req.status);

                return (
                  <tr
                    key={req.request_id}
                    className="hover:bg-surface-container transition-colors group"
                  >
                    {/* STT */}
                    <td className="px-6 py-4.5 text-center text-on-surface-variant font-mono text-[13px] whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {/* Company Name */}
                    <td className="px-6 py-4.5">
                      <p className="font-semibold text-[#1f1f1f] leading-snug text-[14px]">
                        {companyName}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.text} text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-xs`}
                      >
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Date Time */}
                    <td className="px-6 py-4.5 text-center font-mono text-on-surface-variant text-[13px] whitespace-nowrap">
                      {formatDateTime(req.requested_at)}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                      <Link
                        href={`#`}
                        className="text-secondary font-semibold text-xs hover:text-primary inline-flex items-center gap-1 transition-colors whitespace-nowrap px-2 py-1 rounded hover:bg-surface-container-high"
                      >
                        Xem chi tiết <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
          <p className="text-on-surface-variant text-sm">
            Hiển thị{" "}
            <span className="font-semibold text-on-surface">
              {requests.length}
            </span>{" "}
            kết quả
          </p>
          <div className="flex gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-sm font-medium">
              1
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
