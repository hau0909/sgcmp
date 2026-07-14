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

export interface Report {
  id: string; // uuid
  contract_id: string; // uuid
  customer_id: string; // uuid
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
}

export interface CreateReportPayload {
  contract_id: string;
  customer_id: string;
  type: ReportType;
  description: string;
  image_url?: string | null;
}
