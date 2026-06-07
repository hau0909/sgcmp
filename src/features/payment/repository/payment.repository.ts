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
