import { supabase } from "@/lib/supabase";
import { Payment } from "@/types/Payment";
import { PaymentStatus } from "@/types/Enum";

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
