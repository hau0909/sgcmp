import { Contract } from "@/types/Contract";
import { Booking } from "@/types/Booking";
import { ContractStatus } from "@/types/Enum";
import { getCurrentUserProfileService } from "@/features/auth/service/auth.service";
import { getCompanyByOwnerIdService, getCoordinatorByCompanyIdService } from "@/features/guards/service/guard.service";
import {
  getContracts,
  getContractDetail,
  updateContract,
  updateContractParties,
  getCustomerContracts,
  getCustomerContractDetail,
  getContractIdsByCompany,
  getContractIdsByCustomer,
  getContractById
} from "../repository/contract.repository";
import { createClient } from "@/lib/supabase/server";
import { 
  validateContractExpiration, 
  validateAssignGuardsRules, 
  validateCustomerSignatureEligibility 
} from "../validator/contract.validator";
import { calculateHoursFromSlot } from "@/utils/calcTime";

export const getContractsService = async (
  page: number,
  limit: number,
  companyId?: string,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string,
): Promise<{ contracts: Contract[]; totalCount: number }> => {
  const { data, count } = await getContracts(
    page,
    limit,
    companyId,
    search,
    status,
    startDate,
    endDate,
  );

  const formattedContracts: Contract[] = data.map((item: Contract) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const booking = (item as any).bookings;
    const service = booking?.services;
    const serviceName = service?.name || item.service_name || "Dịch vụ chưa xác định";
    const parties = Array.isArray(item.contract_parties)
      ? item.contract_parties[0]
      : item.contract_parties;

    return {
      contract_id: item.contract_id,
      booking_id: item.booking_id || booking?.booking_id || "",
      customer_id: item.customer_id || booking?.customer_id || null,
      company_id: item.company_id || booking?.company_id || null,
      contract_file_url: item.contract_file_url,
      customer_agreed: item.customer_agreed || false,
      company_agreed: item.company_agreed || false,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      guard_assigned: item.guard_assigned || [],

      // Snapshot parties information
      contract_parties: parties || null,

      // Virtual/mapped fields for UI rendering
      contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
      service_name: serviceName,
    };
  });

  return {
    contracts: formattedContracts,
    totalCount: count,
  };
};

export const getContractDetailService = async (
  id: string,
  companyId?: string,
): Promise<(Contract & { booking?: Booking | null; assigned_guards_list?: { full_name: string; phone_number: string; cccd: string }[]; formatted_price?: string }) | null> => {
  const item = await getContractDetail(id, companyId);
  if (!item) return null;

  const rawBooking = item.bookings;
  const booking = Array.isArray(rawBooking) ? rawBooking[0] : rawBooking;
  const parties = Array.isArray(item.contract_parties)
    ? item.contract_parties[0]
    : item.contract_parties;

  // Helper function to format package price per user requirement:
  const quotationType = booking?.quotation_type || "monthly";
  const rawPrice = Number(booking?.quoted_price || 0);
  const hourlyRate = booking?.hourly_rate ? Number(booking.hourly_rate) : null;
  const monthlyRate = booking?.monthly_rate ? Number(booking.monthly_rate) : null;

  const formatVND = (num: number) => new Intl.NumberFormat("vi-VN").format(num);

  let formattedPrice = "";
  if (quotationType === "hourly") {
    const rate = hourlyRate || rawPrice;
    formattedPrice = `${formatVND(rate)} VNĐ / giờ / nhân sự`;
  } else if (quotationType === "monthly") {
    const rate = monthlyRate || rawPrice;
    formattedPrice = `${formatVND(rate)} VNĐ/tháng`;
  } else {
    formattedPrice = `${formatVND(rawPrice)} VNĐ`;
  }

  // Fetch assigned guards profiles
  let assignedGuards: { full_name: string; phone_number: string; cccd: string }[] = [];
  const guardIds = item.guard_assigned || [];
  if (guardIds.length > 0) {
    const supabaseServer = await createClient();
    const { data: profilesData } = await supabaseServer
      .from("profiles")
      .select(`
        full_name,
        phone_number,
        identities (
          identity_id
        )
      `)
      .in("user_id", guardIds);
    if (profilesData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignedGuards = profilesData.map((p: any) => ({
        full_name: p.full_name || "Bảo vệ chưa đặt tên",
        phone_number: p.phone_number || "Chưa có SĐT",
        cccd: p.identities?.[0]?.identity_id || "........................",
      }));
    }
  }

  return {
    contract_id: item.contract_id,
    booking_id: item.booking_id || booking?.booking_id || "",
    customer_id: item.customer_id || null,
    company_id: item.company_id || null,
    contract_file_url: item.contract_file_url,
    customer_agreed: item.customer_agreed || false,
    company_agreed: item.company_agreed || false,
    start_date: item.start_date || null,
    end_date: item.end_date || null,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    guard_assigned: item.guard_assigned || [],

    // Snapshot parties information
    contract_parties: parties || null,

    // Virtual/mapped fields for UI rendering
    contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
    service_name:
      booking?.services?.name ||
      booking?.service_name ||
      "Dịch vụ bảo vệ",

    // Booking details
    booking: booking || null,
    formatted_price: formattedPrice,
    assigned_guards_list: assignedGuards,
  };
};

export const deleteContractFileFromStorage = async (
  contractFileUrl: string,
): Promise<void> => {
  try {
    const searchString = "/public/contracts/";
    const index = contractFileUrl.indexOf(searchString);
    if (index === -1) return;

    const filePath = contractFileUrl.substring(index + searchString.length);
    const decodedFilePath = decodeURIComponent(filePath);

    const supabaseServer = await createClient();
    const { error } = await supabaseServer.storage
      .from("contracts")
      .remove([decodedFilePath]);

    if (error) {
      console.error("Lỗi khi xóa file từ storage:", error);
    }
  } catch (err) {
    console.error("Lỗi khi giải mã URL và xóa file storage:", err);
  }
};

export const signContractCompanyService = async (id: string): Promise<Contract> => {
  const contract = await getContractDetail(id);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng");
  }

  const payload: Partial<Contract> = {
    company_agreed: true,
  };

  if (contract.customer_agreed) {
    payload.status = "active";
  }

  await updateContractParties(id, {
    company_signed_at: new Date().toISOString(),
  });

  return await updateContract(id, payload);
};

export const uploadContractFileService = async (
  id: string,
  file: File,
): Promise<string> => {
  const contract = await getContractDetail(id);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng");
  }

  if (contract.customer_agreed) {
    throw new Error(
      "Không thể tải lên hoặc thay đổi tài liệu sau khi khách hàng đã ký duyệt",
    );
  }

  if (contract.contract_file_url) {
    await deleteContractFileFromStorage(contract.contract_file_url);
  }

  const supabaseServer = await createClient();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `${id}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabaseServer.storage
    .from("contracts")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Tải file lên storage thất bại: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabaseServer.storage
    .from("contracts")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  await updateContract(id, {
    contract_file_url: publicUrl,
  });

  return publicUrl;
};

export const deleteContractFileService = async (id: string): Promise<void> => {
  const contract = await getContractDetail(id);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng");
  }

  if (contract.customer_agreed) {
    throw new Error("Không thể xóa tài liệu sau khi khách hàng đã ký duyệt");
  }

  if (contract.contract_file_url) {
    await deleteContractFileFromStorage(contract.contract_file_url);
  }

  await updateContract(id, {
    contract_file_url: null,
  });
};

export const getCustomerContractsService = async (
  customerId: string,
  page: number,
  limit: number,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string,
): Promise<{ contracts: Contract[]; totalCount: number }> => {
  const { data, count } = await getCustomerContracts(
    customerId,
    page,
    limit,
    search,
    status,
    startDate,
    endDate,
  );

  const formattedContracts: Contract[] = data.map((item: Contract) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const booking = (item as any).bookings;
    const service = booking?.services;
    const parties = Array.isArray(item.contract_parties)
      ? item.contract_parties[0]
      : item.contract_parties;
    const serviceName = service?.name || item.service_name || "Dịch vụ chưa xác định";

    return {
      contract_id: item.contract_id,
      booking_id: item.booking_id || booking?.booking_id || "",
      customer_id: item.customer_id || booking?.customer_id || null,
      company_id: item.company_id || booking?.company_id || null,
      contract_file_url: item.contract_file_url,
      customer_agreed: item.customer_agreed || false,
      company_agreed: item.company_agreed || false,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      guard_assigned: item.guard_assigned || [],

      // Snapshot parties
      contract_parties: parties || null,

      // Virtual fields
      contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
      service_name: serviceName,
    };
  });

  return {
    contracts: formattedContracts,
    totalCount: count,
  };
};

export const signContractCustomerService = async (id: string, customerId: string): Promise<Contract> => {
  const contract = await getCustomerContractDetail(id, customerId);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập");
  }

  validateCustomerSignatureEligibility(contract.customer_agreed, contract.guard_assigned);

  const payload: Partial<Contract> = {
    customer_agreed: true,
  };

  if (contract.company_agreed) {
    if (contract.status === "pending_signatures") {
      payload.status = "active";
    }
  }

  await updateContractParties(id, {
    customer_signed_at: new Date().toISOString(),
  });

  return await updateContract(id, payload);
};

export const completeContractCustomerService = async (id: string, customerId: string): Promise<Contract> => {
  const contract = await getCustomerContractDetail(id, customerId);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập");
  }

  if (contract.status !== "active") {
    throw new Error("Chỉ có thể hoàn thành hợp đồng đang hoạt động");
  }

  validateContractExpiration(contract.end_date);

  return await updateContract(id, {
    status: "completed",
  });
};


export const getCustomerContractDetailService = async (
  id: string,
  customerId: string,
): Promise<(Contract & {
  booking?: Booking | null;
  assigned_guards_list?: { full_name: string; phone_number: string; cccd: string }[];
  formatted_price?: string;
  has_reviewed?: boolean;
  review_rating?: number;
  review_comment?: string;
}) | null> => {
  const item = await getCustomerContractDetail(id, customerId);
  if (!item) return null;

  const rawBooking = item.bookings;
  const booking = Array.isArray(rawBooking) ? rawBooking[0] : rawBooking;
  const parties = Array.isArray(item.contract_parties)
    ? item.contract_parties[0]
    : item.contract_parties;

  const reviewData = item.reviews?.[0] || null;

  const quotationType = booking?.quotation_type || "monthly";
  const rawPrice = Number(booking?.quoted_price || 0);
  const hourlyRate = booking?.hourly_rate ? Number(booking.hourly_rate) : null;
  const monthlyRate = booking?.monthly_rate ? Number(booking.monthly_rate) : null;

  const formatVND = (num: number) => new Intl.NumberFormat("vi-VN").format(num);

  let formattedPrice = "";
  if (quotationType === "hourly") {
    const rate = hourlyRate || rawPrice;
    formattedPrice = `${formatVND(rate)} VNĐ / giờ / nhân sự`;
  } else if (quotationType === "monthly") {
    const rate = monthlyRate || rawPrice;
    formattedPrice = `${formatVND(rate)} VNĐ/tháng`;
  } else {
    formattedPrice = `${formatVND(rawPrice)} VNĐ`;
  }

  // Fetch assigned guards profiles
  let assignedGuards: { full_name: string; phone_number: string; cccd: string }[] = [];
  const guardIds = item.guard_assigned || [];
  if (guardIds.length > 0) {
    const supabaseServer = await createClient();
    const { data: profilesData } = await supabaseServer
      .from("profiles")
      .select(`
        full_name,
        phone_number,
        identities (
          identity_id
        )
      `)
      .in("user_id", guardIds);
    if (profilesData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignedGuards = profilesData.map((p: any) => ({
        full_name: p.full_name || "Bảo vệ chưa đặt tên",
        phone_number: p.phone_number || "Chưa có SĐT",
        cccd: p.identities?.[0]?.identity_id || "........................",
      }));
    }
  }

  return {
    contract_id: item.contract_id,
    booking_id: item.booking_id || booking?.booking_id || "",
    customer_id: item.customer_id || booking?.customer_id || null,
    company_id: item.company_id || booking?.company_id || null,
    contract_file_url: item.contract_file_url || null,
    customer_agreed: item.customer_agreed || false,
    company_agreed: item.company_agreed || false,
    start_date: item.start_date || null,
    end_date: item.end_date || null,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    guard_assigned: item.guard_assigned || [],

    // Snapshot parties
    contract_parties: parties || null,

    // Virtual fields
    contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
    service_name:
      booking?.services?.name ||
      booking?.service_name ||
      "Dịch vụ bảo vệ",

    // Booking & pricing
    booking: booking || null,
    formatted_price: formattedPrice,
    assigned_guards_list: assignedGuards,

    // Review fields
    has_reviewed: !!reviewData,
    review_rating: reviewData?.rating || 0,
    review_comment: reviewData?.comment || "",
  };
};

export const getContractIdsByCompanyService = async (
  companyId: string,
  location?: string,
): Promise<string[]> => {
  return getContractIdsByCompany(companyId, location);
};

export const getContractIdsByCustomerService = async (
  customerId: string,
  location?: string,
) => {
  return getContractIdsByCustomer(customerId, location);
};

export const getContractByIdService = async (
  contractId: string,
): Promise<Contract | null> => {
  return await getContractById(contractId);
};

export const assignGuardsToContractService = async (
  contractId: string,
  guardIds: string[],
): Promise<Contract> => {
  const profile = await getCurrentUserProfileService();
  if (!profile) {
    throw new Error("Bạn chưa đăng nhập");
  }

  const role = profile.role?.trim().toLowerCase();
  let companyId = "";

  if (role === "company-admin") {
    companyId = await getCompanyByOwnerIdService(profile.user_id);
  } else if (role === "coordinator") {
    companyId = await getCoordinatorByCompanyIdService(profile.user_id);
  } else {
    throw new Error("Bạn không có quyền thực hiện chức năng này");
  }

  if (!companyId) {
    throw new Error("Không tìm thấy công ty của tài khoản");
  }

  const contract = await getContractDetail(contractId, companyId);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập");
  }

  // Validate company ownership
  const bookingCompanyId = contract.bookings?.company_id;
  if (bookingCompanyId !== companyId) {
    throw new Error("Bạn không có quyền chỉnh sửa hợp đồng này");
  }

  // Guard assignment is allowed regardless of signature status

  // Validate shift duration and minimum guards
  const booking = contract.bookings;
  const timeSlots: string[] = booking?.time_slots || [];
  const requiredGuards = booking?.guards_per_slot || 1;
  validateAssignGuardsRules(timeSlots, requiredGuards, guardIds.length);

  return await updateContract(contractId, {
    guard_assigned: guardIds,
  });
};

export const updateContractDatesService = async (
  id: string,
  startDate?: string | null,
  endDate?: string | null,
): Promise<Contract> => {
  const contract = await getContractDetail(id);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng");
  }

  const payload: Partial<Contract> = {};
  if (startDate !== undefined && startDate !== null) {
    payload.start_date = startDate ? new Date(startDate).toISOString() : null;
  }
  if (endDate !== undefined && endDate !== null) {
    payload.end_date = endDate ? new Date(endDate).toISOString() : null;
  }

  return await updateContract(id, payload);
};
