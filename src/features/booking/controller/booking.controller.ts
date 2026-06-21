import { Booking, CreateBookingRequest } from "../types";
import { getBookingsService, getBookingDetailService, sendServiceRequest, updateServiceQuotation, confirmOrDenyQuotation } from "../service/booking.service";

export const handleGetBookings = async (
  companyId: string | null,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string,
  customerId?: string | null
): Promise<{ bookings: Booking[]; totalCount: number }> => {
  const result = await getBookingsService(companyId, page, limit, status, contractStatus, customerId);
  return result;
};

export const handleGetBookingDetail = async (id: string): Promise<any | null> => {
  return await getBookingDetailService(id);
};

export const handleCreateBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  return await sendServiceRequest(data);
};

export const handleUpdateQuotation = async (id: string, price: number): Promise<Booking> => {
  return await updateServiceQuotation(id, price);
};

export const handleConfirmOrDenyQuotation = async (id: string, decision: "accepted" | "rejected"): Promise<Booking> => {
  return await confirmOrDenyQuotation(id, decision);
};
