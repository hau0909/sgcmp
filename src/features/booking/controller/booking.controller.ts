import { Booking } from "../types";
import { getBookingsService, getBookingDetailService } from "../service/booking.service";
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

