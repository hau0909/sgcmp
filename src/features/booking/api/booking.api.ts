import { fetcher } from "@/lib/fetcher";
import { Booking, BookingStatus } from "../types";

export async function requestGetBookings(
  companyId: string,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string
): Promise<{ bookings: Booking[]; totalCount: number }> {
  const query = new URLSearchParams({
    companyId,
    page: String(page),
    limit: String(limit),
  });
  if (status) {
    query.append("status", status);
  }
  if (contractStatus) {
    query.append("contractStatus", contractStatus);
  }

  return await fetcher(`/api/bookings?${query.toString()}`, {
    method: "GET",
  });
}

export async function requestGetBookingDetail(id: string) {
  return await fetcher(`/api/bookings/${id}`, {
    method: "GET",
  });
}

export async function requestCreateBooking(
  bookingData: Omit<Booking, "booking_id" | "customer_id" | "created_at" | "updated_at" | "quoted_price" | "status" | "customer_name" | "service_name">,
  forceCreate?: boolean
): Promise<Booking> {
  return await fetcher("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...bookingData, forceCreate }),
  });
}

export async function requestUpdateBookingQuotation(
  id: string,
  updates: {
    status: BookingStatus;
    quoted_price?: number;
    quotation_type?: string;
    hourly_rate?: number;
    monthly_rate?: number;
  }
): Promise<{ booking: Booking; contract_id?: string }> {
  const res = await fetcher(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  return res as any;
}

export async function requestUpdateBookingDetails(
  id: string,
  updates: {
    address?: string;
    description?: string | null;
    guards_per_slot?: number;
    time_slots?: string[];
    day_per_week?: string[];
    start_date?: string;
    end_date?: string;
  }
): Promise<{ booking: Booking }> {
  const res = await fetcher(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  return res as any;
}

export async function requestGetCustomerBookings(
  customerId: string,
  page: number,
  limit: number,
  status?: string
): Promise<{ bookings: Booking[]; totalCount: number }> {
  const query = new URLSearchParams({
    customerId,
    page: String(page),
    limit: String(limit),
  });
  if (status) {
    query.append("status", status);
  }

  return await fetcher(`/api/bookings?${query.toString()}`, {
    method: "GET",
  });
}

