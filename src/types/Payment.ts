import { PaymentMethod, PaymentStatus } from "./Enum";

export interface Payment {
  payment_id: string;
  subscription_id: string;
  company_id: string;
  plan_id: number;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_code: string | null;
  paid_at: string | null;
  created_at: string;
}



