import { createClient } from "@/lib/supabase/server";
import { BookingWithCustomerProfile, BookingStatus } from "../types";
import type { Booking } from "@/types/Booking";

export const getBookings = async (
  companyId: string,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string
): Promise<{ data: BookingWithCustomerProfile[]; count: number }> => {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let selectFields = `
    booking_id,
    customer_id,
    company_id,
    service_id,
    address,
    description,
    guards_per_slot,
    time_slots,
    start_date,
    end_date,
    quoted_price,
    quotation_type,
    hourly_rate,
    monthly_rate,
    status,
    created_at,
    updated_at,
    day_per_week,
    company_name,
    company_scope,
    company_position,
    profiles (
      full_name
    ),
    services (
      name
    )
  `;

  if (contractStatus) {
    selectFields += `,
    contracts!inner (
      status
    )`;
  }

  let dbQuery = supabase
    .from("bookings")
    .select(selectFields, { count: "exact" })
    .eq("company_id", companyId);

  if (status) {
    dbQuery = dbQuery.eq("status", status);
  }

  if (contractStatus) {
    dbQuery = dbQuery.eq("contracts.status", contractStatus);
  }

  const { data, error, count } = await dbQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: (data as unknown as BookingWithCustomerProfile[]) || [],
    count: count || 0,
  };
};

export const getBookingDetail = async (id: string): Promise<any | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      booking_id,
      customer_id,
      company_id,
      service_id,
      address,
      description,
      guards_per_slot,
      time_slots,
      start_date,
      end_date,
      quoted_price,
      quotation_type,
      hourly_rate,
      monthly_rate,
      status,
      created_at,
      updated_at,
      day_per_week,
      company_name,
      company_scope,
      company_position,
      profiles (
        user_id,
        full_name,
        phone_number,
        email,
        address
      ),
      services (
        service_id,
        name,
        description
      ),
      companies (
        company_id,
        owner_id,
        company_name,
        email,
        phone,
        address,
        monthly_discount_percent,
        package_discount_percent
      ),
      contracts (
        contract_id,
        status
      )
    `)
    .eq("booking_id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const getBookingById = async (
  bookingId: string,
): Promise<Booking | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Booking) || null;
};

export const getActiveBookingsByAddressAndService = async (address: string, serviceId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("start_date, end_date, day_per_week, time_slots, status, services(name)")
    .eq("address", address)
    .eq("service_id", serviceId)
    .in("status", ["pending", "quoted", "accepted"]);

  if (error) {
    throw error;
  }
  return data;
};

export const createBooking = async (
  booking: Omit<Booking, "booking_id" | "created_at" | "updated_at" | "quoted_price" | "status" | "customer_name" | "service_name">
): Promise<Booking> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        customer_id: booking.customer_id,
        company_id: booking.company_id,
        service_id: booking.service_id,
        address: booking.address,
        description: booking.description || null,
        guards_per_slot: booking.guards_per_slot,
        time_slots: booking.time_slots,
        day_per_week: booking.day_per_week,
        start_date: booking.start_date,
        end_date: booking.end_date,
        status: "pending",
        company_name: booking.company_name || null,
        company_scope: booking.company_scope || null,
        company_position: booking.company_position || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Booking;
};

export const updateBookingDetails = async (
  bookingId: string,
  updates: {
    address?: string;
    description?: string | null;
    guards_per_slot?: number;
    time_slots?: string[];
    day_per_week?: string[];
    start_date?: string;
    end_date?: string;
    company_name?: string | null;
    company_scope?: string | null;
    company_position?: string | null;
  }
): Promise<Booking> => {
  const supabase = await createClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("status")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!booking) throw new Error("Không tìm thấy yêu cầu đặt lịch.");

  const editableStatuses: BookingStatus[] = ["pending", "rejected"];
  if (!editableStatuses.includes(booking.status as BookingStatus)) {
    if (booking.status === "quoted") {
      throw new Error("Vui lòng từ chối báo giá trước khi thực hiện chỉnh sửa yêu cầu dịch vụ.");
    }
    throw new Error("Không thể chỉnh sửa yêu cầu ở trạng thái này.");
  }

  const updatePayload: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("booking_id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

export const updateBookingStatusAndPrice = async (
  bookingId: string,
  updates: {
    status: BookingStatus;
    quoted_price?: number;
    quotation_type?: string;
    hourly_rate?: number;
    monthly_rate?: number;
  }
): Promise<{ booking: Booking; contract_id?: string; contract_status?: string }> => {
  const supabase = await createClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("company_id, status, start_date, end_date")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!booking) {
    throw new Error("Không tìm thấy yêu cầu đặt lịch.");
  }

  const currentStatus = booking.status;
  const targetStatus = updates.status;

  const isValidTransition =
    (currentStatus === "pending" && (targetStatus === "quoted" || targetStatus === "rejected" || targetStatus === "canceled")) ||
    (currentStatus === "quoted" && (targetStatus === "accepted" || targetStatus === "rejected" || targetStatus === "canceled")) ||
    (currentStatus === "rejected" && (targetStatus === "quoted" || targetStatus === "canceled"));

  if (!isValidTransition) {
    throw new Error(`Chuyển đổi trạng thái từ ${currentStatus} sang ${targetStatus} không hợp lệ.`);
  }

  // Khảo sát must be approved before Quoted
  if (targetStatus === "quoted") {
    const { data: verification } = await supabase
      .from("request_verifications")
      .select("status")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (!verification || verification.status !== "approved") {
      throw new Error("Cần hoàn tất và duyệt khảo sát trước khi thực hiện báo giá.");
    }
  }

  const updatePayload: any = {
    status: updates.status,
    updated_at: new Date().toISOString(),
  };

  if (updates.quoted_price !== undefined) {
    updatePayload.quoted_price = updates.quoted_price;
  }
  if (updates.quotation_type !== undefined) {
    updatePayload.quotation_type = updates.quotation_type;
  }
  if (updates.hourly_rate !== undefined) {
    updatePayload.hourly_rate = updates.hourly_rate;
  }
  if (updates.monthly_rate !== undefined) {
    updatePayload.monthly_rate = updates.monthly_rate;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("booking_id", bookingId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  let contractId: string | undefined = undefined;

  if (updates.status === "accepted") {
    let signedCompanyName: string | null = null;
    const companyId = data?.company_id || booking?.company_id;
    if (companyId) {
      const { data: companyData } = await supabase
        .from("companies")
        .select("company_name")
        .eq("company_id", companyId)
        .maybeSingle();
      if (companyData) {
        signedCompanyName = companyData.company_name;
      }
    }

    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .insert([
        {
          booking_id: bookingId,
          start_date: booking.start_date,
          end_date: booking.end_date,
          status: "pending_signatures",
          customer_agreed: false,
          company_agreed: false,
          signed_company_name: signedCompanyName,
        }
      ])
      .select("contract_id")
      .single();

    if (contractError) {
      console.error("Lỗi khi tự động tạo hợp đồng:", contractError);
      throw contractError;
    }

    contractId = contract?.contract_id;
  }

  return { booking: data as Booking, contract_id: contractId, contract_status: contractId ? "pending_signatures" : undefined };
};

export const getCustomerBookings = async (
  customerId: string,
  page: number,
  limit: number,
  status?: string,
): Promise<{ data: any[]; count: number }> => {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const textLimit = from + limit - 1;

  let dbQuery = supabase
    .from("bookings")
    .select(`
      booking_id,
      customer_id,
      company_id,
      service_id,
      address,
      description,
      guards_per_slot,
      time_slots,
      start_date,
      end_date,
      quoted_price,
      quotation_type,
      hourly_rate,
      monthly_rate,
      status,
      created_at,
      updated_at,
      day_per_week,
      company_name,
      company_scope,
      company_position,
      companies (
        company_name
      ),
      services (
        name
      )
    `, { count: "exact" })
    .eq("customer_id", customerId);

  if (status) {
    dbQuery = dbQuery.eq("status", status);
  }

  const { data, error, count } = await dbQuery
    .order("created_at", { ascending: false })
    .range(from, textLimit);

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
  };
};