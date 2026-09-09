import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { ContractStatus } from "@/types/Enum";
import type { CompanyContractQuery } from "@/features/shift/type";
import { Contract } from "@/types/Contract";
import { Booking } from "@/types/Booking";
import { ContractParties } from "@/types/ContractParties";
import { Review } from "@/types/Review";

export const getContracts = async (
  page: number,
  limit: number,
  companyId?: string,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string,
): Promise<{ data: Contract[]; count: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("contracts").select(
    `
    contract_id,
    customer_id,
    company_id,
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
    contract_parties (*),
    bookings (
      booking_id,
      services (
        name
      )
    )
  `,
    { count: "exact" },
  );

  if (companyId) {
    query = query.eq("company_id", companyId);
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
      data: ((data as unknown) as Contract[]) || [],
      count: count || 0,
    };
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const searchClean = search.trim().toLowerCase().replace(/^hd-/i, "");
  const rawList = ((data as unknown) as Contract[]) || [];

  const filtered = rawList.filter((item) => {
    const contractId = (item.contract_id || "").toLowerCase();
    const contractCode = `hd-${contractId.slice(0, 8)}`.toLowerCase();
    const parties = Array.isArray(item.contract_parties)
      ? item.contract_parties[0]
      : item.contract_parties;
    const customerName = (parties?.customer_name || "").toLowerCase();
    const companyName = (parties?.company_name || "").toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceName = (((item as any).bookings?.services?.name) || item.service_name || "").toLowerCase();

    return (
      contractId.includes(searchClean) ||
      contractCode.includes(searchClean) ||
      customerName.includes(searchClean) ||
      companyName.includes(searchClean) ||
      serviceName.includes(searchClean)
    );
  });

  const totalCount = filtered.length;
  const pagedContracts = filtered.slice(from, from + limit);

  return {
    data: pagedContracts,
    count: totalCount,
  };
};

export const getContractDetail = async (
  id: string,
  companyId?: string,
): Promise<(Contract & { bookings?: Booking | null }) | null> => {
  const supabaseServer = await createClient();
  let query = supabaseServer
    .from("contracts")
    .select(
      `
      contract_id,
      customer_id,
      company_id,
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
      contract_parties (*),
      bookings (
        *,
        services (
          service_id,
          name
        )
      )
    `,
    )
    .eq("contract_id", id);

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }
  return ((data as unknown) as (Contract & { bookings?: Booking | null })) || null;
};

export const updateContract = async (
  id: string,
  payload: Partial<Contract>,
): Promise<Contract> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("contracts")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("contract_id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as Contract;
};

export const updateContractParties = async (
  contractId: string,
  payload: Partial<ContractParties>,
): Promise<void> => {
  const supabaseServer = await createClient();
  const { error } = await supabaseServer
    .from("contract_parties")
    .update(payload)
    .eq("contract_id", contractId);

  if (error) {
    console.error("Lỗi khi cập nhật contract_parties:", error);
    throw error;
  }
};

export const getCustomerContracts = async (
  customerId: string,
  page: number,
  limit: number,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string,
): Promise<{ data: Contract[]; count: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("contracts")
    .select(
      `
        contract_id,
        booking_id,
        customer_id,
        company_id,
        status,
        created_at,
        updated_at,
        start_date,
        end_date,
        contract_file_url,
        customer_agreed,
        company_agreed,
        guard_assigned,
        contract_parties (*),
        bookings (
          booking_id,
          company_name,
          services (
            name
          )
        )
      `,
      { count: "exact" },
    )
    .eq("customer_id", customerId);

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
      data: ((data as unknown) as Contract[]) || [],
      count: count || 0,
    };
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const searchClean = search.trim().toLowerCase().replace(/^hd-/i, "");

  const allContracts =
    ((data as unknown) as (Contract & {
      bookings?: { company_name?: string; services?: { name?: string } };
    })[]) || [];

  const filtered = allContracts.filter((item) => {
    const contractId = (item.contract_id || "").toLowerCase();
    const contractCode = `hd-${contractId.slice(0, 8)}`.toLowerCase();
    const parties = Array.isArray(item.contract_parties)
      ? item.contract_parties[0]
      : item.contract_parties;
    const companyName = (
      parties?.company_name ||
      item.bookings?.company_name ||
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
  const pagedContracts = filtered.slice(from, from + limit);

  return {
    data: pagedContracts,
    count: totalCount,
  };
};

export const getCustomerContractDetail = async (
  id: string,
  customerId: string,
): Promise<(Contract & { bookings?: Booking | null; reviews?: Review[] | null }) | null> => {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from("contracts")
    .select(
      `
      contract_id,
      booking_id,
      customer_id,
      company_id,
      contract_file_url,
      customer_agreed,
      company_agreed,
      start_date,
      end_date,
      status,
      created_at,
      updated_at,
      guard_assigned,
      reviews (*),
      contract_parties (*),
      bookings (
        *,
        services (
          service_id,
          name
        )
      )
    `,
    )
    .eq("contract_id", id)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return (
    ((data as unknown) as Contract & {
      bookings?: Booking | null;
      reviews?: Review[] | null;
    }) || null
  );
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