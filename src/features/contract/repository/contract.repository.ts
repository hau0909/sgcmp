import { supabase } from "@/lib/supabase";
import { ContractStatus } from "@/types/Enum";

export const getContracts = async (
  page: number,
  limit: number,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string
): Promise<{ data: any[]; count: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("contracts")
    .select(
      `
        contract_id,
        status,
        contract_file_url,
        created_at,
        customer_agreed,
        company_agreed,
        start_date,
        end_date,
        updated_at,
        booking_id,
        bookings!inner (
          booking_id,
          profiles!inner (
            full_name
          ),
          services!inner (
            name
          )
        )
      `,
      { count: "exact" }
    );

  if (status) {
    query = query.eq("status", status);
  }

  if (startDate) {
    query = query.gte("created_at", new Date(startDate).toISOString());
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }

  if (search) {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.or(
      `bookings.profiles.full_name.ilike.${searchLower},bookings.services.name.ilike.${searchLower}`
    );
  }

  query = query.order("created_at", { ascending: false });
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
  };
};
