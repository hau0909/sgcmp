import { Payment } from "@/types/Payment";
import {
  getPaymentHistoryService,
  createPaymentService,
  updatePaymentStatusService,
  getPaymentByIdService,
} from "../service/payment.service";
import { PaymentMethod, PaymentStatus } from "@/types/Enum";

export const handleGetPaymentHistory = async (
  companyId: string,
  limit: number,
  status: PaymentStatus,
): Promise<Payment[]> => {
  const result = await getPaymentHistoryService(companyId, limit, status);
  return result;
};

export const handleCreatePayment = async (
  companyId: string,
  planId: number,
  paymentMethod: PaymentMethod,
): Promise<Payment> => {
  const result = await createPaymentService(companyId, planId, paymentMethod);
  return result;
};

export const handleUpdatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
): Promise<Payment> => {
  const result = await updatePaymentStatusService(paymentId, status);
  return result;
};

export const handleGetPaymentById = async (
  paymentId: string,
): Promise<Payment | null> => {
  const result = await getPaymentByIdService(paymentId);
  return result;
};
