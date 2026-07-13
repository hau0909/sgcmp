import { createClient } from "@/lib/supabase/server";
import { ReportStatus, ReportType } from "../types";

export const getCustomerReports = async (
  customerId: string,
  page: number,
  limit: number,
  search?: string,
  status?: ReportStatus,
  type?: ReportType
): Promise<{ data: any[]; count: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const supabase = await createClient();

  let query = supabase
    .from("report")
    .select("*", { count: "exact" })
    .eq("customer_id", customerId);

  if (status) {
    query = query.eq("status", status);
  }

  if (type) {
    query = query.eq("type", type);
  }

  if (search) {
    const searchLower = `%${search.toLowerCase()}%`;
    query = query.or(`description.ilike.${searchLower}`);
  }

  query = query.order("created_at", { ascending: false });
  query = query.range(from, to);

  const { data: reports, error, count } = await query;

  if (error) {
    throw error;
  }

  if (!reports || reports.length === 0) {
    return { data: [], count: 0 };
  }

  // Fetch related contracts, bookings, and services independently to avoid schema cache relationship issues
  const contractIds = Array.from(new Set(reports.map((r) => r.contract_id).filter(Boolean)));
  let contracts: any[] = [];
  let bookings: any[] = [];
  let services: any[] = [];

  if (contractIds.length > 0) {
    const { data: contractsData } = await supabase
      .from("contracts")
      .select("contract_id, booking_id")
      .in("contract_id", contractIds);

    if (contractsData && contractsData.length > 0) {
      contracts = contractsData;
      const bookingIds = Array.from(new Set(contractsData.map((c) => c.booking_id).filter(Boolean)));
      
      if (bookingIds.length > 0) {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("booking_id, service_id")
          .in("booking_id", bookingIds);

        if (bookingsData && bookingsData.length > 0) {
          bookings = bookingsData;
          const serviceIds = Array.from(new Set(bookingsData.map((b) => b.service_id).filter(Boolean)));

          if (serviceIds.length > 0) {
            const { data: servicesData } = await supabase
              .from("services")
              .select("service_id, name")
              .in("service_id", serviceIds);

            if (servicesData) {
              services = servicesData;
            }
          }
        }
      }
    }
  }

  // Combine the reports with contract and service information
  const enrichedReports = reports.map((report) => {
    const contract = contracts.find((c) => c.contract_id === report.contract_id);
    const booking = contract ? bookings.find((b) => b.booking_id === contract.booking_id) : null;
    const service = booking ? services.find((s) => s.service_id === booking.service_id) : null;

    return {
      ...report,
      contracts: contract
        ? {
            contract_id: contract.contract_id,
            bookings: booking
              ? {
                  services: service ? { name: service.name } : null,
                }
              : null,
          }
        : null,
    };
  });

  return {
    data: enrichedReports,
    count: count || 0,
  };
};

export const createCustomerReport = async (payload: {
  contract_id: string;
  customer_id: string;
  type: ReportType;
  description: string;
  image_url?: string | null;
}): Promise<any> => {
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("report")
    .insert([
      {
        contract_id: payload.contract_id,
        customer_id: payload.customer_id,
        type: payload.type,
        description: payload.description,
        image_url: payload.image_url || null,
        status: "PENDING",
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  // Fetch contract and service name for enrichment
  let contract: any = null;
  let booking: any = null;
  let service: any = null;

  if (inserted.contract_id) {
    const { data: contractData } = await supabase
      .from("contracts")
      .select("contract_id, booking_id")
      .eq("contract_id", inserted.contract_id)
      .maybeSingle();

    if (contractData) {
      contract = contractData;
      if (contractData.booking_id) {
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("booking_id, service_id")
          .eq("booking_id", contractData.booking_id)
          .maybeSingle();

        if (bookingData) {
          booking = bookingData;
          if (bookingData.service_id) {
            const { data: serviceData } = await supabase
              .from("services")
              .select("service_id, name")
              .eq("service_id", bookingData.service_id)
              .maybeSingle();

            if (serviceData) {
              service = serviceData;
            }
          }
        }
      }
    }
  }

  return {
    ...inserted,
    contracts: contract
      ? {
          contract_id: contract.contract_id,
          bookings: booking
            ? {
                services: service ? { name: service.name } : null,
              }
            : null,
        }
      : null,
  };
};

export const deleteCustomerReport = async (
  id: string,
  customerId: string
): Promise<void> => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("report")
    .delete()
    .eq("id", id)
    .eq("customer_id", customerId);

  if (error) {
    throw error;
  }
};

export const getCustomerContractsForReport = async (
  customerId: string
): Promise<any[]> => {
  const supabase = await createClient();
  
  // 1. Fetch bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("booking_id, service_id")
    .eq("customer_id", customerId);

  if (bookingsError || !bookings || bookings.length === 0) {
    return [];
  }

  // 2. Fetch contracts
  const bookingIds = bookings.map((b) => b.booking_id);
  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select("contract_id, booking_id, status, start_date, end_date")
    .in("booking_id", bookingIds);

  if (contractsError || !contracts || contracts.length === 0) {
    return [];
  }

  // 3. Fetch services
  const serviceIds = Array.from(new Set(bookings.map((b) => b.service_id).filter(Boolean)));
  let services: any[] = [];
  if (serviceIds.length > 0) {
    const { data: servicesData } = await supabase
      .from("services")
      .select("service_id, name")
      .in("service_id", serviceIds);
    if (servicesData) {
      services = servicesData;
    }
  }

  // 4. Map in memory
  return contracts.map((c) => {
    const booking = bookings.find((b) => b.booking_id === c.booking_id);
    const service = booking ? services.find((s) => s.service_id === booking.service_id) : null;
    return {
      contract_id: c.contract_id,
      booking_id: c.booking_id,
      status: c.status,
      start_date: c.start_date,
      end_date: c.end_date,
      contract_code: `HD-${c.contract_id.slice(0, 8).toUpperCase()}`,
      service_name: service ? service.name : "Dịch vụ bảo vệ",
    };
  });
};
