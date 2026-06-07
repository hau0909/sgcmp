import { Payment } from "@/types/Payment";
import { getPaymentHistoryService } from "../service/payment.service";
import { PaymentStatus } from "@/types/Enum";

export const handleGetPaymentHistory = async (
  companyId: string,
  limit: number,
  status: PaymentStatus,
): Promise<Payment[]> => {
  const result = await getPaymentHistoryService(companyId, limit, status);
  return result;
};
