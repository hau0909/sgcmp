import { PaymentMethod, PaymentStatus } from "@/types/Enum";
import { Payment as DbPayment } from "@/types/Payment";

export interface UpsertBankAccountPayload {
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export type Payment = {
  id: string;
  companyName: string;
  companyShortName: string;
  packageName: "Basic" | "Standard" | "Enterprise";
  amount: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
  status: PaymentStatus;
};

export type DateRange = { start: Date | null; end: Date | null };

export interface GetAllPaymentsAdminOptions {
  status?: PaymentStatus | "all";
  keyword?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}


export interface PaymentWithCompany extends DbPayment {
  company_name: string | null;
  company_logo_url: string | null;
  plan_name: string | null;
}

export interface PaginatedPayments {
  data: PaymentWithCompany[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "completed", label: "Thành công" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "failed", label: "Thất bại" },
];


export interface PaymentSummaryAdminOptions {
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentSummaryAdminResult {
  totalRevenue: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}