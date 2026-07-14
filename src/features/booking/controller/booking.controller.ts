import { Booking, BookingStatus } from "../types";
import { getBookingsService, getBookingDetailService, createBookingService, updateBookingStatusAndPriceService, getCustomerBookingsService } from "../service/booking.service";
import { checkCompanySubscriptionService } from "@/features/subscription/service/subscription.service";

export const handleGetBookings = async (
  companyId: string,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string
): Promise<{ bookings: Booking[]; totalCount: number }> => {
  const subCheck = await checkCompanySubscriptionService(companyId);
  if (!subCheck.isActive) {
    throw new Error("Tài khoản doanh nghiệp chưa đăng ký gói dịch vụ hoặc gói đã hết hạn.");
  }
  const result = await getBookingsService(companyId, page, limit, status, contractStatus);
  return result;
};

export const handleGetBookingDetail = async (id: string): Promise<any | null> => {
  return await getBookingDetailService(id);
};

export const handleCreateBooking = async (
  bookingData: Omit<Booking, "booking_id" | "created_at" | "updated_at" | "quoted_price" | "status" | "customer_name" | "service_name">,
  forceCreate: boolean = false
): Promise<Booking> => {
  return await createBookingService(bookingData, forceCreate);
};

export const handleUpdateBookingStatusAndPrice = async (
  bookingId: string,
  updates: { status: BookingStatus; quoted_price?: number }
): Promise<{ booking: Booking; contract_id?: string }> => {
  return await updateBookingStatusAndPriceService(bookingId, updates);
};

export const handleGetCustomerBookings = async (
  customerId: string,
  page: number,
  limit: number,
  status?: string,
): Promise<{ bookings: Booking[]; totalCount: number }> => {
  return await getCustomerBookingsService(customerId, page, limit, status);
};

