import { createClient } from "@/lib/supabase/server";
import { BookingWithCustomerProfile, CreateBookingRequest } from "../types";
import type { Booking } from "@/types/Booking";

export const getBookings = async (
  companyId: string,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string,
  customerId?: string | null
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
  data: CreateBookingRequest
): Promise<Booking> => {
  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: data.customer_id,
      company_id: data.company_id,
      service_id: data.service_id,
      address: data.address,
      description: data.description || null,
      guards_per_slot: data.guards_per_slot,
      time_slots: data.time_slots,
      start_date: data.start_date,
      end_date: data.end_date,
      status: "pending",
      quoted_price: null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result as Booking;
};

export const updateQuotation = async (
  bookingId: string,
  price: number
): Promise<Booking> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .update({
      quoted_price: price,
      status: "quoted",
      updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Booking;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "accepted" | "rejected"
): Promise<Booking> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Booking;
};