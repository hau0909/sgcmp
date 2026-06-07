import { fetcher } from "@/lib/fetcher";
import { Payment } from "@/types/Payment";
import { PaymentStatus } from "@/types/Enum";

export async function requestGetPaymentHistory(
  companyId: string,
  limit?: number,
  status?: PaymentStatus,
): Promise<{ success: boolean; data: Payment[] }> {
  let url = `/api/payments/history?companyId=${companyId}`;
  if (limit !== undefined) {
    url += `&limit=${limit}`;
  }
  if (status !== undefined) {
    url += `&status=${status}`;
  }

  return await fetcher(url, {
    method: "GET",
  });
}
