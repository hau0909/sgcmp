import { Payment } from "@/types/Payment";
import { BankAccount } from "@/types/BankAccount";
import {
  getPaymentHistoryService,
  createPaymentService,
  updatePaymentStatusService,
  getPaymentByIdService,
  handleSePayWebhookService,
  getAllBankAccountsService,
  getActiveBankAccountService,
  createBankAccountService,
  updateBankAccountService,
  switchActiveBankAccountService,
  deactivateBankAccountService,
  deleteBankAccountService,
} from "../service/payment.service";
import { PaymentMethod, PaymentStatus } from "@/types/Enum";
import { UpsertBankAccountPayload } from "../types";

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

export const handleSePayWebhook = async (payload: any): Promise<boolean> => {
  const result = await handleSePayWebhookService(payload);
  return result;
};

// ─── Bank Account ────────────────────────────────────────────────────────────

export const handleGetAllBankAccounts = async (): Promise<BankAccount[]> => {
  return await getAllBankAccountsService();
};

export const handleGetActiveBankAccount =
  async (): Promise<BankAccount | null> => {
    return await getActiveBankAccountService();
  };

export const handleCreateBankAccount = async (
  payload: UpsertBankAccountPayload,
): Promise<BankAccount> => {
  return await createBankAccountService(payload);
};

export const handleUpdateBankAccount = async (
  id: string,
  payload: UpsertBankAccountPayload,
): Promise<BankAccount> => {
  return await updateBankAccountService(id, payload);
};

export const handleSwitchActiveBankAccount = async (
  id: string,
): Promise<BankAccount> => {
  return await switchActiveBankAccountService(id);
};

export const handleDeactivateBankAccount = async (
  id: string,
): Promise<void> => {
  return await deactivateBankAccountService(id);
};

export const handleDeleteBankAccount = async (id: string): Promise<void> => {
  return await deleteBankAccountService(id);
};
