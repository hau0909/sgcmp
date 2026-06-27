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
    status,
    created_at,
    updated_at,
    day_per_week,
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
      status,
      created_at,
      updated_at,
      day_per_week,
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
        company_name,
        email,
        phone,
        address
      ),
      contracts (
        contract_id
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
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Booking;
};

export const updateBookingStatusAndPrice = async (
  bookingId: string,
  updates: { status: BookingStatus; quoted_price?: number }
): Promise<{ booking: Booking; contract_id?: string }> => {
  const supabase = await createClient();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("status, start_date, end_date")
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
    (currentStatus === "pending" && (targetStatus === "quoted" || targetStatus === "rejected")) ||
    (currentStatus === "quoted" && (targetStatus === "accepted" || targetStatus === "rejected"));

  if (!isValidTransition) {
    throw new Error(`Chuyển đổi trạng thái từ ${currentStatus} sang ${targetStatus} không hợp lệ.`);
  }

  const updatePayload: any = {
    status: updates.status,
    updated_at: new Date().toISOString(),
  };

  if (updates.quoted_price !== undefined) {
    updatePayload.quoted_price = updates.quoted_price;
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

  return { booking: data as Booking, contract_id: contractId };
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
      status,
      created_at,
      updated_at,
      day_per_week,
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