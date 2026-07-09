import { Booking, BookingWithCustomerProfile, BookingStatus } from "../types";
import { getBookings, getBookingDetail, getBookingById, createBooking, updateBookingStatusAndPrice, getCustomerBookings, getActiveBookingsByAddressAndService } from "../repository/booking.repository";
import { formatAddressService } from "@/features/address/service/address.service";


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
      day_per_week: (item.day_per_week as string[]) || [],

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
  const company = item.companies;

  const companyRawAddress = Array.isArray(company) ? company[0]?.address : company?.address;
  const companyAddressFormatted = await formatAddressService(companyRawAddress);

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
    day_per_week: (item.day_per_week as string[]) || [],

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
    company_name: Array.isArray(company)
      ? (company[0]?.company_name || "Doanh nghiệp không tên")
      : (company?.company_name || "Doanh nghiệp không tên"),
    company_phone: Array.isArray(company)
      ? (company[0]?.phone || "Chưa cập nhật")
      : (company?.phone || "Chưa cập nhật"),
    company_email: Array.isArray(company)
      ? (company[0]?.email || "Chưa cập nhật")
      : (company?.email || "Chưa cập nhật"),
    company_address: companyAddressFormatted,
    contract_id: Array.isArray(item.contracts)
      ? (item.contracts[0]?.contract_id || null)
      : (item.contracts?.contract_id || null),
  };
};

export const getBookingByIdService = async (
  bookingId: string,
): Promise<Booking | null> => {
  return await getBookingById(bookingId);
};

export const createBookingService = async (
  bookingData: Omit<Booking, "booking_id" | "created_at" | "updated_at" | "quoted_price" | "status" | "customer_name" | "service_name">,
  forceCreate: boolean = false
): Promise<Booking> => {
  if (!bookingData.customer_id) throw new Error("Yêu cầu customer_id.");
  if (!bookingData.company_id) throw new Error("Yêu cầu company_id.");
  if (!bookingData.service_id) throw new Error("Vui lòng chọn loại dịch vụ.");
  if (!bookingData.address.trim()) throw new Error("Vui lòng nhập địa chỉ vị trí cần bảo vệ.");
  if (!bookingData.start_date) throw new Error("Vui lòng chọn ngày bắt đầu.");
  if (!bookingData.end_date) throw new Error("Vui lòng chọn ngày kết thúc.");
  if (bookingData.guards_per_slot < 1) throw new Error("Số bảo vệ tối thiểu phải là 1.");
  if (!bookingData.time_slots || bookingData.time_slots.length === 0) {
    throw new Error("Vui lòng thêm ít nhất một khung giờ thực hiện.");
  }
  if (!bookingData.day_per_week || bookingData.day_per_week.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một ngày làm việc trong tuần.");
  }

  const activeBookings = await getActiveBookingsByAddressAndService(bookingData.address, bookingData.service_id);

  const checkTimeOverlap = (slot1: string, slot2: string) => {
    const [s1, e1] = slot1.split(" - ");
    const [s2, e2] = slot2.split(" - ");

    const timeToMins = (t: string) => {
      const [h, m] = t.trim().split(":").map(Number);
      return h * 60 + m;
    };

    const start1 = timeToMins(s1);
    const end1 = timeToMins(e1);
    const start2 = timeToMins(s2);
    const end2 = timeToMins(e2);

    return Math.max(start1, start2) < Math.min(end1, end2);
  };

  const checkDateOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
  };

  const overlappingBookings = [];

  for (const existing of activeBookings) {
    if (!checkDateOverlap(bookingData.start_date, bookingData.end_date, existing.start_date, existing.end_date)) {
      continue;
    }

    const existingDays = existing.day_per_week as string[] || [];
    const daysOverlap = bookingData.day_per_week.some(d => existingDays.includes(d));
    if (!daysOverlap) {
      continue;
    }

    const existingTimeSlots = existing.time_slots as string[] || [];
    const timeOverlap = bookingData.time_slots.some(newSlot =>
      existingTimeSlots.some(existSlot => checkTimeOverlap(newSlot, existSlot))
    );

    if (timeOverlap) {
      overlappingBookings.push(existing);
    }
  }

  if (overlappingBookings.length > 0 && !forceCreate) {
    const error: any = new Error("Địa chỉ này đã có lịch đặt dịch vụ trùng ngày và khung giờ");
    error.errorType = "OVERLAP";
    error.overlaps = overlappingBookings;
    throw error;
  }

  return await createBooking(bookingData);
};

export const updateBookingStatusAndPriceService = async (
  bookingId: string,
  updates: { status: BookingStatus; quoted_price?: number }
): Promise<{ booking: Booking; contract_id?: string }> => {
  if (updates.status !== "quoted" && updates.status !== "rejected" && updates.status !== "accepted" && updates.status !== "canceled") {
    throw new Error("Trạng thái cập nhật không hợp lệ.");
  }
  if (updates.status === "quoted" && (updates.quoted_price === undefined || updates.quoted_price <= 0)) {
    throw new Error("Giá báo phải lớn hơn 0 VND.");
  }
  return await updateBookingStatusAndPrice(bookingId, updates);
};

export const getCustomerBookingsService = async (
  customerId: string,
  page: number,
  limit: number,
  status?: string,
): Promise<{ bookings: Booking[]; totalCount: number }> => {
  const { data, count } = await getCustomerBookings(customerId, page, limit, status);

  const bookings = data.map((item: any): Booking => {
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
      day_per_week: (item.day_per_week as string[]) || [],

      // Virtual/mapped fields for UI rendering
      company_name: Array.isArray(item.companies)
        ? (item.companies[0]?.company_name || "Doanh nghiệp không tên")
        : (item.companies?.company_name || "Doanh nghiệp không tên"),
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