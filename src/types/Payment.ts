import { PaymentMethod, PaymentStatus } from "./Enum";

export interface Payment {
  paymentId: string;
  subscriptionId: string;
  companyId: string;
  planId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionCode: string | null;
  paidAt: Date | null;
  createdAt: Date;
}
