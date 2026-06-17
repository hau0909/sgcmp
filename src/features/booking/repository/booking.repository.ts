import { createClient } from "@/lib/supabase/server";
import { BookingWithCustomerProfile } from "../types";

export const getBookings = async (
  companyId: string,
  page: number,
  limit: number
): Promise<{ data: BookingWithCustomerProfile[]; count: number }> => {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
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
        full_name
      ),
      services (
        name
      )
    `, { count: "exact" })
    .eq("company_id", companyId)
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

