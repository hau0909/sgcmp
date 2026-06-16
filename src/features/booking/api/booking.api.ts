import { fetcher } from "@/lib/fetcher";
import { Booking } from "../types";

export async function requestGetBookings(
  companyId: string,
  page: number,
  limit: number
): Promise<{ bookings: Booking[]; totalCount: number }> {
  return await fetcher(
    `/api/bookings?companyId=${companyId}&page=${page}&limit=${limit}`,
    {
      method: "GET",
    }
  );
}
