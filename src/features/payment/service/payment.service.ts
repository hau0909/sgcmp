import { Payment } from "@/types/Payment";
import { getPaymentHistoryByCompany } from "../repository/payment.repository";
import { PaymentStatus } from "@/types/Enum";

export const getPaymentHistoryService = async (
  companyId: string,
  limit: number,
  status: PaymentStatus,
): Promise<Payment[]> => {
  if (!companyId) {
    throw new Error("Company ID is required");
  }

  const result = await getPaymentHistoryByCompany(companyId, limit, status);
  return result;
};
