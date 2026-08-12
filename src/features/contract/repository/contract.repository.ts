import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { ContractStatus } from "@/types/Enum";
import type { CompanyContractQuery } from "@/features/shift/type";
import { Contract } from "@/types/Contract";

export const getContracts = async (
  page: number,
  limit: number,
  companyId?: string,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: any[]; count: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("contracts").select(
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
    guard_assigned,
    bookings!inner (
      booking_id,
      address,
      profiles!inner (
        full_name
      ),
      companies!inner (
        company_name
      ),
      services!inner (
        name
      )
    )
  `,
    { count: "exact" },
  );

  if (companyId) {
    query = query.eq("bookings.company_id", companyId);
  }

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

  query = query.order("created_at", { ascending: false });

  if (!search || !search.trim()) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      throw error;
    }
    return {
      data: data || [],
      count: count || 0,
    };
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const searchClean = search.trim().toLowerCase().replace(/^hd-/i, "");

  const filtered = (data || []).filter((item: any) => {
    const contractId = (item.contract_id || "").toLowerCase();
    const contractCode = `hd-${contractId.slice(0, 8)}`.toLowerCase();
    const customerName = (item.bookings?.profiles?.full_name || "").toLowerCase();
    const companyName = (
      item.signed_company_name ||
      item.bookings?.company_name ||
      item.bookings?.companies?.company_name ||
      ""
    ).toLowerCase();
    const serviceName = (item.bookings?.services?.name || "").toLowerCase();

    return (
      contractId.includes(searchClean) ||
      contractCode.includes(searchClean) ||
      customerName.includes(searchClean) ||
      companyName.includes(searchClean) ||
      serviceName.includes(searchClean)
    );
  });

  const totalCount = filtered.length;
  const pagedData = filtered.slice(from, from + limit);

  return {
    data: pagedData,
    count: totalCount,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getContractDetail = async (id: string): Promise<any | null> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("contracts")
    .select(
      `
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
      guard_assigned,
      signed_company_name,
      bookings!inner (
        booking_id,
        company_id,
        address,
        description,
        guards_per_slot,
        time_slots,
        day_per_week,
        start_date,
        end_date,
        quoted_price,
        quotation_type,
        hourly_rate,
        monthly_rate,
        status,
        created_at,
        updated_at,
        company_name,
        company_scope,
        company_position,
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
        ),
        companies!inner (
          company_id,
          company_name,
          phone,
          email,
          address,
          business_license_no,
          owner_id
        )
      )
    `,
    )
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCustomerContracts = async (customerId: string, page: number, limit: number, search?: string, status?: ContractStatus, startDate?: string, endDate?: string): Promise<{ data: any[]; count: number }> => {
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
        guard_assigned,
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
      { count: "exact" },
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

  query = query.order("created_at", { ascending: false });

  if (!search || !search.trim()) {
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      throw error;
    }
    return {
      data: data || [],
      count: count || 0,
    };
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const searchClean = search.trim().toLowerCase().replace(/^hd-/i, "");

  const filtered = (data || []).filter((item: any) => {
    const contractId = (item.contract_id || "").toLowerCase();
    const contractCode = `hd-${contractId.slice(0, 8)}`.toLowerCase();
    const companyName = (
      item.signed_company_name ||
      item.bookings?.company_name ||
      item.bookings?.companies?.company_name ||
      ""
    ).toLowerCase();
    const serviceName = (item.bookings?.services?.name || "").toLowerCase();

    return (
      contractId.includes(searchClean) ||
      contractCode.includes(searchClean) ||
      companyName.includes(searchClean) ||
      serviceName.includes(searchClean)
    );
  });

  const totalCount = filtered.length;
  const pagedData = filtered.slice(from, from + limit);

  return {
    data: pagedData,
    count: totalCount,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCustomerContractDetail = async (id: string, customerId: string): Promise<any | null> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("contracts")
    .select(
      `
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
      guard_assigned,
      signed_company_name,
      reviews (
        rating,
        comment
      ),
      bookings!inner (
        booking_id,
        customer_id,
        address,
        description,
        guards_per_slot,
        time_slots,
        day_per_week,
        start_date,
        end_date,
        quoted_price,
        quotation_type,
        hourly_rate,
        monthly_rate,
        status,
        created_at,
        updated_at,
        company_name,
        company_scope,
        company_position,
        companies!inner (
          company_id,
          company_name,
          phone,
          email,
          address,
          business_license_no,
          owner_id
        ),
        services!inner (
          service_id,
          name,
          description
        ),
        profiles!inner (
          user_id,
          full_name,
          phone_number,
          email,
          address
        )
      )
    `,
    )
    .eq("contract_id", id)
    .eq("bookings.customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data;
};

export const getContractIdsByCompany = async (
  companyId: string,
  location?: string,
): Promise<string[]> => {
  const supabase = await createClient();

  let query = supabase
    .from("contracts")
    .select(
      `
        contract_id,
        bookings!inner (
          company_id,
          address
        )
      `,
    )
    .eq("bookings.company_id", companyId);

  if (location && location !== "all") {
    query = query.eq("bookings.address", location);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CompanyContractQuery[]).map(
    (contract) => contract.contract_id,
  );
};

export const getContractById = async (
  contractId: string,
): Promise<Contract | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("contract_id", contractId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Contract) || null;
};