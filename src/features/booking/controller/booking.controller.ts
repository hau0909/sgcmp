import { Booking } from "../types";
import { getBookingsService } from "../service/booking.service";

export const handleGetBookings = async (
  companyId: string,
  page: number,
  limit: number
): Promise<{ bookings: Booking[]; totalCount: number }> => {
  const result = await getBookingsService(companyId, page, limit);
  return result;
};
