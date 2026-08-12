import { Booking, BookingWithCustomerProfile, BookingStatus } from "../types";
import { getBookings, getBookingDetail, getBookingById, createBooking, updateBookingStatusAndPrice, updateBookingDetails, getCustomerBookings, getActiveBookingsByAddressAndService } from "../repository/booking.repository";
import { formatAddressService } from "@/features/address/service/address.service";
import { validateBookingUpdateStatusData } from "../validator/booking.validator";
import { checkTimeOverlap, checkDateOverlap } from "@/utils/calcTime";
import { getProfileByUserIdService } from "@/features/profile/service/profile.service";


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
      quotation_type: item.quotation_type || null,
      hourly_rate: item.hourly_rate !== null && item.hourly_rate !== undefined ? Number(item.hourly_rate) : null,
      monthly_rate: item.monthly_rate !== null && item.monthly_rate !== undefined ? Number(item.monthly_rate) : null,
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

  const companyRaw = Array.isArray(company) ? company[0] : company;
  const companyOwnerId = companyRaw?.owner_id;
  let companyContactPerson = undefined;
  if (companyOwnerId) {
    const ownerProfile = await getProfileByUserIdService(companyOwnerId);
    if (ownerProfile) {
      companyContactPerson = ownerProfile.full_name || undefined;
    }
  }

  let servicePrice: number | null = null;
  if (item.company_id && item.service_id) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: compService } = await supabase
        .from("company_services")
        .select("price")
        .eq("company_id", item.company_id)
        .eq("service_id", item.service_id)
        .maybeSingle();

      if (compService && compService.price) {
        servicePrice = Number(compService.price);
      }
    } catch (e) {
      console.error("Lỗi khi lấy giá dịch vụ từ company_services:", e);
    }
  }

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
    quotation_type: item.quotation_type || null,
    hourly_rate: item.hourly_rate !== null && item.hourly_rate !== undefined ? Number(item.hourly_rate) : null,
    monthly_rate: item.monthly_rate !== null && item.monthly_rate !== undefined ? Number(item.monthly_rate) : null,
    service_price: servicePrice,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    day_per_week: (item.day_per_week as string[]) || [],
    client_company_name: item.company_name || null,
    company_scope: item.company_scope || null,
    company_position: item.company_position || null,

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
    company_contact_person: companyContactPerson,
    company_address: companyAddressFormatted,
    contract_id: Array.isArray(item.contracts)
      ? (item.contracts[0]?.contract_id || null)
      : (item.contracts?.contract_id || null),
    contract_status: Array.isArray(item.contracts)
      ? (item.contracts[0]?.status || null)
      : (item.contracts?.status || null),
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

export const updateBookingDetailsService = async (
  bookingId: string,
  updates: {
    address?: string;
    description?: string | null;
    guards_per_slot?: number;
    time_slots?: string[];
    day_per_week?: string[];
    start_date?: string;
    end_date?: string;
  }
): Promise<Booking> => {
  return await updateBookingDetails(bookingId, updates);
};

export const updateBookingStatusAndPriceService = async (
  bookingId: string,
  updates: {
    status: BookingStatus;
    quoted_price?: number;
    quotation_type?: any;
    hourly_rate?: number;
    monthly_rate?: number;
  }
): Promise<{ booking: Booking; contract_id?: string; contract_status?: string }> => {
  validateBookingUpdateStatusData(updates.status, updates.quoted_price);
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
      quotation_type: item.quotation_type || null,
      hourly_rate: item.hourly_rate !== null && item.hourly_rate !== undefined ? Number(item.hourly_rate) : null,
      monthly_rate: item.monthly_rate !== null && item.monthly_rate !== undefined ? Number(item.monthly_rate) : null,
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