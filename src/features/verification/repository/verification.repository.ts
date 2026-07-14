import { createClient } from "@/lib/supabase/server";
import { Verification, VerificationStatus } from "../types";

export interface VerificationWithBooking {
  verification_id: string;
  booking_id: string;
  status: VerificationStatus;
  description: string | null;
  images: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  booking: {
    customer_name: string;
    service_name: string;
    address: string;
    start_date: string;
  };
}

export const getVerificationsByCompanyId = async (
  companyId: string,
  page: number,
  limit: number,
  status?: VerificationStatus
): Promise<{ data: VerificationWithBooking[]; count: number }> => {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("request_verifications")
    .select(
      `
      verification_id,
      booking_id,
      status,
      description,
      images,
      notes,
      created_at,
      updated_at,
      bookings!inner (
        address,
        start_date,
        company_id,
        profiles ( full_name ),
        services ( name )
      )
    `,
      { count: "exact" }
    )
    .eq("bookings.company_id", companyId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const mapped: VerificationWithBooking[] = (data || []).map((item: any) => {
    const booking = Array.isArray(item.bookings) ? item.bookings[0] : item.bookings;
    const profile = Array.isArray(booking?.profiles) ? booking.profiles[0] : booking?.profiles;
    const service = Array.isArray(booking?.services) ? booking.services[0] : booking?.services;
    return {
      verification_id: item.verification_id,
      booking_id: item.booking_id,
      status: item.status,
      description: item.description,
      images: item.images || [],
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
      booking: {
        customer_name: profile?.full_name || "—",
        service_name: service?.name || "—",
        address: booking?.address || "—",
        start_date: booking?.start_date || "—",
      },
    };
  });

  return { data: mapped, count: count || 0 };
};



export const getVerificationByBookingId = async (
  bookingId: string
): Promise<Verification | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_verifications")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) throw error;
  return (data as Verification) || null;
};

export const createVerification = async (
  bookingId: string
): Promise<Verification> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_verifications")
    .insert([
      {
        booking_id: bookingId,
        status: "pending" as VerificationStatus,
        images: [],
        description: null,
        notes: null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Verification;
};

export const updateVerification = async (
  bookingId: string,
  updates: {
    status?: VerificationStatus;
    description?: string;
    notes?: string;
    images?: string[];
  }
): Promise<Verification> => {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.images !== undefined) payload.images = updates.images;

  const { data, error } = await supabase
    .from("request_verifications")
    .update(payload)
    .eq("booking_id", bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Verification;
};
