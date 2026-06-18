import { Booking } from "../types";
import { getBookingsService, getBookingDetailService } from "../service/booking.service";

export const handleGetBookings = async (
  companyId: string,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string
): Promise<{ bookings: Booking[]; totalCount: number }> => {
  const result = await getBookingsService(companyId, page, limit, status, contractStatus);
  return result;
};

export const handleGetBookingDetail = async (id: string): Promise<any | null> => {
  return await getBookingDetailService(id);
};

