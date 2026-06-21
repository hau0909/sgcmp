import { fetcher } from "@/lib/fetcher";
import { Booking, CreateBookingRequest } from "../types";

export async function requestGetBookings(
  companyId: string | null,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string,
  customerId?: string | null
): Promise<{ bookings: Booking[]; totalCount: number }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (companyId) {
    query.append("companyId", companyId);
  }
  if (customerId) {
    query.append("customerId", customerId);
  }
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

export async function createBooking(data: CreateBookingRequest): Promise<Booking> {
  return await fetcher("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuotation(id: string, price: number): Promise<Booking> {
  return await fetcher(`/api/bookings/${id}/quotation`, {
    method: "PUT",
    body: JSON.stringify({ quoted_price: price }),
  });
}

export async function updateBookingDecision(id: string, decision: "accepted" | "rejected"): Promise<Booking> {
  return await fetcher(`/api/bookings/${id}/decision`, {
    method: "PUT",
    body: JSON.stringify({ status: decision }),
  });
}
