import { PaymentMethod, PaymentStatus } from "@/types/Enum";

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

export const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "completed", label: "Thành công" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "failed", label: "Thất bại" },
];

export const packageOptions = [
  { value: "all", label: "Tất cả gói" },
  { value: "Basic", label: "Basic" },
  { value: "Standard", label: "Standard" },
  { value: "Enterprise", label: "Enterprise" },
];

export const PAYMENT_DATA: Payment[] = [
  {
    id: "TXN-84920",
    companyName: "VinaApp Corp",
    companyShortName: "VA",
    packageName: "Enterprise",
    amount: 45_000_000,
    paymentMethod: "bank_transfer",
    paidAt: "25/05/2024 14:30",
    status: "completed",
  },
  {
    id: "TXN-84919",
    companyName: "Hanoisoft JSC",
    companyShortName: "HS",
    packageName: "Standard",
    amount: 12_500_000,
    paymentMethod: "credit_card",
    paidAt: "25/05/2024 11:15",
    status: "pending",
  },
  {
    id: "TXN-84918",
    companyName: "Minh Bao Logistics",
    companyShortName: "MB",
    packageName: "Basic",
    amount: 4_200_000,
    paymentMethod: "e_wallet",
    paidAt: "24/05/2024 09:45",
    status: "failed",
  },
  {
    id: "TXN-84917",
    companyName: "Global Link",
    companyShortName: "GL",
    packageName: "Enterprise",
    amount: 45_000_000,
    paymentMethod: "bank_transfer",
    paidAt: "24/05/2024 08:00",
    status: "completed",
  },
  {
    id: "TXN-84916",
    companyName: "Techno City",
    companyShortName: "TC",
    packageName: "Standard",
    amount: 12_500_000,
    paymentMethod: "credit_card",
    paidAt: "23/05/2024 16:20",
    status: "refunded",
  },
];

