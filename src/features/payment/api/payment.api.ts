import { fetcher } from "@/lib/fetcher";
import { Payment } from "@/types/Payment";
import { PaymentMethod, PaymentStatus } from "@/types/Enum";

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

export async function requestCreatePayment(
  companyId: string,
  planId: number,
  paymentMethod: PaymentMethod,
): Promise<{ success: boolean; data: Payment }> {
  return await fetcher("/api/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ companyId, planId, paymentMethod }),
  });
}

export async function requestUpdatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
): Promise<{ success: boolean; data: Payment }> {
  return await fetcher(`/api/payments/${paymentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

export async function requestGetPaymentById(
  paymentId: string,
): Promise<{ success: boolean; data: Payment }> {
  return await fetcher(`/api/payments/${paymentId}`, {
    method: "GET",
  });
}
