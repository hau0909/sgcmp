import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { ContractStatus } from "@/types/Enum";

export const getContracts = async (
  page: number,
  limit: number,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getContractDetail = async (id: string): Promise<any | null> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("contracts")
    .select(`
      contract_id,
      booking_id,
      contract_file_url,
      customer_agreed,
      company_agreed,
      start_date,
      end_date,
      status,
      created_at,
      updated_at,
      bookings!inner (
        booking_id,
        address,
        description,
        guards_per_slot,
        time_slots,
        start_date,
        end_date,
        quoted_price,
        status,
        created_at,
        updated_at,
        profiles!inner (
          user_id,
          full_name,
          phone_number,
          email,
          address
        ),
        services!inner (
          service_id,
          name,
          description
        )
      )
    `)
    .eq("contract_id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateContract = async (id: string, payload: any): Promise<any> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("contracts")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("contract_id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};
export const getCustomerContracts = async (
  customerId: string,
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
        created_at,
        start_date,
        end_date,
        bookings!inner (
          customer_id,
          companies!inner (
            company_name
          ),
          services!inner (
            name
          )
        )
      `,
      { count: "exact" }
    )
    .eq("bookings.customer_id", customerId);

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
      `bookings.services.name.ilike.${searchLower}`
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCustomerContractDetail = async (id: string, customerId: string): Promise<any | null> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("contracts")
    .select(`
      contract_id,
      booking_id,
      contract_file_url,
      customer_agreed,
      company_agreed,
      start_date,
      end_date,
      status,
      created_at,
      updated_at,
      bookings!inner (
        booking_id,
        customer_id,
        address,
        description,
        guards_per_slot,
        time_slots,
        start_date,
        end_date,
        quoted_price,
        status,
        created_at,
        updated_at,
        companies!inner (
          company_name,
          address
        ),
        services!inner (
          service_id,
          name,
          description
        )
      )
    `)
    .eq("contract_id", id)
    .eq("bookings.customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};
