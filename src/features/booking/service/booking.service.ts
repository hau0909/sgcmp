import { Booking, BookingWithCustomerProfile } from "../types";
import { getBookings, getBookingDetail } from "../repository/booking.repository";

export const getBookingsService = async (
  companyId: string,
  page: number,
  limit: number,
  status?: string,
  contractStatus?: string
): Promise<{ bookings: Booking[]; totalCount: number }> => {
  const { data, count } = await getBookings(companyId, page, limit, status, contractStatus);

  const bookings = data.map((item: BookingWithCustomerProfile): Booking => {
    return {
      booking_id: item.booking_id,
      customer_id: item.customer_id,
      company_id: item.company_id,
      service_id: item.service_id,
      address: item.address,
      description: item.description || null,
      guards_per_slot: item.guards_per_slot || 1,
      time_slots: item.time_slots || [],
      start_date: item.start_date,
      end_date: item.end_date,
      quoted_price: item.quoted_price !== null ? Number(item.quoted_price) : null,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      
      // Virtual/mapped fields for UI rendering
      customer_name: Array.isArray(item.profiles)
        ? (item.profiles[0]?.full_name || "Khách hàng không tên")
        : (item.profiles?.full_name || "Khách hàng không tên"),
      service_name: Array.isArray(item.services)
        ? (item.services[0]?.name || "Dịch vụ chưa xác định")
        : (item.services?.name || "Dịch vụ chưa xác định"),
    };
  });

  return {
    bookings,
    totalCount: count,
  };
};

export const getBookingDetailService = async (id: string): Promise<any | null> => {
  const item = await getBookingDetail(id);
  if (!item) return null;

  const profile = item.profiles;
  const service = item.services;

  return {
    booking_id: item.booking_id,
    customer_id: item.customer_id,
    company_id: item.company_id,
    service_id: item.service_id,
    address: item.address,
    description: item.description || null,
    guards_per_slot: item.guards_per_slot || 1,
    time_slots: item.time_slots || [],
    start_date: item.start_date,
    end_date: item.end_date,
    quoted_price: item.quoted_price !== null ? Number(item.quoted_price) : null,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    
    // Virtual/mapped fields for UI rendering
    customer_name: Array.isArray(profile)
      ? (profile[0]?.full_name || "Khách hàng không tên")
      : (profile?.full_name || "Khách hàng không tên"),
    contact_person: Array.isArray(profile)
      ? (profile[0]?.full_name || "Khách hàng không tên")
      : (profile?.full_name || "Khách hàng không tên"),
    phone: Array.isArray(profile)
      ? (profile[0]?.phone_number || "Chưa cập nhật")
      : (profile?.phone_number || "Chưa cập nhật"),
    email: Array.isArray(profile)
      ? (profile[0]?.email || "Chưa cập nhật")
      : (profile?.email || "Chưa cập nhật"),
    service_name: Array.isArray(service)
      ? (service[0]?.name || "Dịch vụ chưa xác định")
      : (service?.name || "Dịch vụ chưa xác định"),
  };
};

