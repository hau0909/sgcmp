import { supabase } from "@/lib/supabase";
import { Payment } from "@/types/Payment";
import { BankAccount } from "@/types/BankAccount";
import { PaymentStatus } from "@/types/Enum";
import { UpsertBankAccountPayload } from "../types";

export const getPaymentHistoryByCompany = async (
  companyId: string,
  limit: number,
  status: PaymentStatus,
): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("company_id", companyId)
    .eq("payment_status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as Payment[]) || [];
};

export const createPayment = async (
  paymentData: Omit<Payment, "payment_id" | "created_at">,
): Promise<Payment> => {
  const { data, error } = await supabase
    .from("payments")
    .insert(paymentData)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return (data as Payment) || null;
};

export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("payment_id", paymentId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return (data as Payment) || null;
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  paidAt?: string | null,
): Promise<Payment> => {
  const updateFields: Partial<Payment> = {
    payment_status: status,
  };

  if (paidAt !== undefined) {
    updateFields.paid_at = paidAt;
  }

  const { data, error } = await supabase
    .from("payments")
    .update(updateFields)
    .eq("payment_id", paymentId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return (data as Payment) || null;
};

export const getPaymentByTransactionCode = async (transactionCode: string): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("transaction_code", transactionCode)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return (data as Payment) || null;
};

// ─── Bank Account ────────────────────────────────────────────────────────────

export const getAllBankAccounts = async (): Promise<BankAccount[]> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data as BankAccount[]) || [];
};

export const getBankAccountById = async (
  id: string,
): Promise<BankAccount | null> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return (data as BankAccount) || null;
};

export const getActiveBankAccount = async (): Promise<BankAccount | null> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;

  return (data as BankAccount) || null;
};

export const insertBankAccount = async (
  payload: UpsertBankAccountPayload,
): Promise<BankAccount> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .insert({ ...payload, is_active: false })
    .select("*")
    .single();

  if (error) throw error;

  return data as BankAccount;
};

export const updateBankAccount = async (
  id: string,
  payload: UpsertBankAccountPayload,
): Promise<BankAccount> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return data as BankAccount;
};

export const deactivateAllBankAccounts = async (): Promise<void> => {
  const { error } = await supabase
    .from("bank_accounts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("is_active", true); // WHERE clause required by Supabase

  if (error) throw error;
};

export const deactivateBankAccount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("bank_accounts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
};

export const activateBankAccount = async (
  id: string,
): Promise<BankAccount> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return data as BankAccount;
};

export const countBankAccounts = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("bank_accounts")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  return count ?? 0;
};

export const deleteBankAccount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("bank_accounts")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
