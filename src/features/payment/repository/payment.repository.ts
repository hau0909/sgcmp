import { supabase } from "@/lib/supabase";
import { Payment } from "@/types/Payment";
import { BankAccount } from "@/types/BankAccount";
import { PaymentStatus } from "@/types/Enum";
import { UpsertBankAccountPayload, GetAllPaymentsAdminOptions, PaginatedPayments, PaymentWithCompany, PaymentSummaryAdminOptions, PaymentSummaryAdminResult } from "../types";

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

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAllPaymentsAdmin = async (): Promise<PaymentWithCompany[]> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const payments = (data as Payment[]) || [];

  // Fetch company names & logos separately to avoid FK dependency
  const companyIds = [...new Set(payments.map((p) => p.company_id).filter(Boolean))];
  let companyInfoMap: Record<string, { company_name: string; company_logo_url: string | null }> = {};

  if (companyIds.length > 0) {
    const { data: companies } = await supabase
      .from("companies")
      .select("company_id, company_name, company_imgs(image_url, image_type)")
      .in("company_id", companyIds);

    if (companies) {
      companyInfoMap = Object.fromEntries(
        (companies as any[]).map((c) => {
          const logoImg = Array.isArray(c.company_imgs)
            ? c.company_imgs.find((img: any) => img.image_type === "logo")
            : null;
          return [
            c.company_id,
            {
              company_name: c.company_name,
              company_logo_url: logoImg?.image_url ?? null,
            },
          ];
        }),
      );
    }
  }

  // Fetch plan names separately
  const planIds = [...new Set(payments.map((p) => p.plan_id).filter(Boolean))];
  let planNameMap: Record<number, string> = {};

  if (planIds.length > 0) {
    const { data: plans } = await supabase
      .from("plans")
      .select("plan_id, plan_name")
      .in("plan_id", planIds);

    if (plans) {
      planNameMap = Object.fromEntries(
        (plans as { plan_id: number; plan_name: string }[]).map((p) => [
          p.plan_id,
          p.plan_name,
        ]),
      );
    }
  }

  const flattened: PaymentWithCompany[] = payments.map((p) => ({
    ...p,
    company_name: companyInfoMap[p.company_id]?.company_name ?? null,
    company_logo_url: companyInfoMap[p.company_id]?.company_logo_url ?? null,
    plan_name: planNameMap[p.plan_id] ?? null,
  }));

  return flattened;
};


export const getPaymentSummaryAdmin = async (
  options: PaymentSummaryAdminOptions = {},
): Promise<PaymentSummaryAdminResult> => {
  const { keyword, startDate, endDate } = options;

  let query = supabase.from("payments").select("payment_status, amount");

  let matchedCompanyIds: string[] = [];
  if (keyword) {
    const { data: companies } = await supabase
      .from("companies")
      .select("company_id")
      .ilike("company_name", `%${keyword}%`);
    if (companies) {
      matchedCompanyIds = companies.map((c: any) => c.company_id);
    }
  }

  if (keyword) {
    const orConditions = [`transaction_code.ilike.%${keyword}%`];
    if (matchedCompanyIds.length > 0) {
      orConditions.push(`company_id.in.(${matchedCompanyIds.map(id => `"${id}"`).join(",")})`);
    } else {
      orConditions.push(`company_id.ilike.%${keyword}%`);
    }
    query = query.or(orConditions.join(","));
  }

  if (startDate) {
    query = query.gte("paid_at", startDate);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    query = query.lt("paid_at", end.toISOString().split("T")[0]);
  }

  const { data, error } = await query;
  if (error) throw error;

  const payments = data || [];

  let totalRevenue = 0;
  let successCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  for (const p of payments) {
    if (p.payment_status === "completed") {
      totalRevenue += p.amount || 0;
      successCount++;
    } else if (p.payment_status === "pending") {
      pendingCount++;
    } else if (p.payment_status === "failed") {
      failedCount++;
    }
  }

  return {
    totalRevenue,
    successCount,
    pendingCount,
    failedCount,
  };
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
