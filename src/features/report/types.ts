import { ReportType, ReportStatus } from "@/types/Enum";
export type { ReportType, ReportStatus };

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  LATE: "Đi muộn (LATE)",
  ABSENT: "Vắng mặt (ABSENT)",
  BAD_ATTITUDE: "Thái độ không tốt (BAD_ATTITUDE)",
  SLEEPING: "Ngủ gật trong giờ trực (SLEEPING)",
  OTHER: "Khác (OTHER)",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Chờ tiếp nhận",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng",
};

export interface ReportGuard {
  guard_id: string;
  guard_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  check_in_time?: string | null;
}

export interface Report {
  id: string; // uuid
  contract_id: string; // uuid
  customer_id: string; // uuid
  shift_id?: string | null; // uuid — ca trực liên quan (nullable)
  type: ReportType;
  description: string;
  status: ReportStatus;
  created_at: string;
  image_url: string | null;

  // Joined fields for frontend/UI display
  contract_code?: string;
  service_name?: string;
  report_code?: string;
  customer_name?: string;
  customer_phone?: string;
  // Shift info (joined)
  shift_name?: string | null;
  shift_start_time?: string | null;
  shift_end_time?: string | null;
  guards?: ReportGuard[];
}

export interface CreateReportPayload {
  contract_id: string;
  customer_id: string;
  shift_id?: string | null;
  type: ReportType;
  description: string;
  image_url?: string | null;
}
