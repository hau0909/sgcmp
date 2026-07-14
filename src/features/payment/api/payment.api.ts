import { fetcher } from "@/lib/fetcher";
import { Payment } from "@/types/Payment";
import { BankAccount } from "@/types/BankAccount";
import { PaymentMethod, PaymentStatus } from "@/types/Enum";
import { UpsertBankAccountPayload } from "../types";

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

// ─── Bank Account ────────────────────────────────────────────────────────────

export async function requestGetAllBankAccounts(): Promise<{
  success: boolean;
  data: BankAccount[];
}> {
  return await fetcher("/api/bank-accounts", { method: "GET" });
}

export async function requestGetActiveBankAccount(): Promise<{
  success: boolean;
  data: BankAccount | null;
}> {
  return await fetcher("/api/bank-accounts/active", { method: "GET" });
}

export async function requestCreateBankAccount(
  payload: UpsertBankAccountPayload,
): Promise<{ success: boolean; data: BankAccount }> {
  return await fetcher("/api/bank-accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function requestUpdateBankAccount(
  id: string,
  payload: UpsertBankAccountPayload,
): Promise<{ success: boolean; data: BankAccount }> {
  return await fetcher(`/api/bank-accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function requestSwitchActiveBankAccount(
  id: string,
): Promise<{ success: boolean; data: BankAccount }> {
  return await fetcher(`/api/bank-accounts/${id}/activate`, {
    method: "PUT",
  });
}

export async function requestDeactivateBankAccount(
  id: string,
): Promise<{ success: boolean; data: BankAccount }> {
  return await fetcher(`/api/bank-accounts/${id}/deactivate`, {
    method: "PUT",
  });
}

export async function requestDeleteBankAccount(
  id: string,
): Promise<{ success: boolean }> {
  return await fetcher(`/api/bank-accounts/${id}`, {
    method: "DELETE",
  });
}
