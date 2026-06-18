import { fetcher } from "@/lib/fetcher";
import { Booking } from "../types";

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

