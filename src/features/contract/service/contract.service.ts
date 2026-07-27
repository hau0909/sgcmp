import { Contract } from "@/types/Contract";
import { ContractStatus } from "@/types/Enum";
import { CustomerContract } from "../types";
import { getCurrentUserProfileService } from "@/features/auth/service/auth.service";
import { getProfileByUserIdService } from "@/features/profile/service/profile.service";
import { getCompanyByOwnerIdService, getCoordinatorByCompanyIdService } from "@/features/guards/service/guard.service";
import {
  getContracts,
  getContractDetail,
  updateContract,
  getCustomerContracts,
  getCustomerContractDetail,
  getContractIdsByCompany,
  getContractById
} from "../repository/contract.repository";
import { createClient } from "@/lib/supabase/server";
import { formatAddressService } from "@/features/address/service/address.service";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedContracts: Contract[] = data.map((item: any) => {
    const booking = item.bookings;
    const profile = booking?.profiles;
    const service = booking?.services;
    const serviceName = service?.name || "Dịch vụ chưa xác định";

    return {
      contract_id: item.contract_id,
      booking_id: item.booking_id || booking?.booking_id || "",
      contract_file_url: item.contract_file_url,
      customer_agreed: item.customer_agreed || false,
      company_agreed: item.company_agreed || false,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      guard_assigned: item.guard_assigned || [],

      // Virtual/mapped fields for UI rendering
      contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
      customer_name: profile?.full_name || "Khách hàng không tên",
      service_name: serviceName,
    };
  });

  return {
    contracts: formattedContracts,
    totalCount: count,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getContractDetailService = async (id: string): Promise<any | null> => {
  const item = await getContractDetail(id);
  if (!item) return null;

  const booking = item.bookings;
  const profile = booking?.profiles;
  const service = booking?.services;
  const company = booking?.companies;
  const serviceName = service?.name || "Dịch vụ chưa xác định";

  // Format price to VND currency string
  let formattedPrice = "";
  if (booking?.quoted_price !== undefined && booking?.quoted_price !== null) {
    formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(booking.quoted_price));
  }

  // Fetch company owner (representative) profile
  let ownerName = "Chưa cập nhật";
  if (company?.owner_id) {
    const ownerProfile = await getProfileByUserIdService(company.owner_id);
    if (ownerProfile) {
      ownerName = ownerProfile.full_name || "Chưa cập nhật";
    }
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
      assignedGuards = profilesData.map((p: any) => ({
        full_name: p.full_name || "Bảo vệ chưa đặt tên",
        phone_number: p.phone_number || "Chưa có SĐT",
        cccd: p.identities?.[0]?.identity_id || "........................",
      }));
    }
  }

  const formattedCompanyAddress = await formatAddressService(company?.address);

  return {
    contract_id: item.contract_id,
    booking_id: item.booking_id || booking?.booking_id || "",
    contract_file_url: item.contract_file_url,
    customer_agreed: item.customer_agreed || false,
    company_agreed: item.company_agreed || false,
    start_date: item.start_date || null,
    end_date: item.end_date || null,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    guard_assigned: item.guard_assigned || [],

    // Virtual/mapped fields for UI rendering
    contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
    customer_name: profile?.full_name || "Khách hàng không tên",
    service_name: serviceName,

    // Booking details
    booking: booking
      ? {
        booking_id: booking.booking_id,
        company_id: booking.company_id,
        address: booking.address,
        description: booking.description || null,
        guards_per_slot: booking.guards_per_slot || 1,
        time_slots: booking.time_slots || [],
        start_date: booking.start_date,
        end_date: booking.end_date,
        quoted_price: booking.quoted_price,
        formatted_price: formattedPrice,
        status: booking.status,
        profiles: profile
          ? {
            user_id: profile.user_id,
            full_name: profile.full_name || "Khách hàng không tên",
            phone_number: profile.phone_number || "Không có SĐT",
            email: profile.email || "Không có Email",
            address: profile.address || "Chưa cập nhật địa chỉ",
          }
          : null,
        services: service
          ? {
            service_id: service.service_id,
            name: service.name,
            description: service.description || null,
          }
          : null,
      }
      : null,

    // Compiled company, customer, and guard fields for contract exporting
    company: {
      name: company?.company_name || "Công ty chưa xác định",
      phone: company?.phone || "Chưa cập nhật",
      email: company?.email || "Chưa cập nhật",
      address: formattedCompanyAddress || "Chưa cập nhật",
      tax_code: company?.business_license_no || "Chưa cập nhật",
      representative: ownerName,
      position: "Đại diện pháp luật",
    },
    customer: {
      company_name: "........................",
      address: profile?.address || "Chưa cập nhật",
      tax_code: "........................",
      phone: profile?.phone_number || "Chưa cập nhật",
      email: profile?.email || "Chưa cập nhật",
      representative: profile?.full_name || "Khách hàng không tên",
      position: "........................",
    },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signContractCompanyService = async (id: string): Promise<any> => {
  const contract = await getContractDetail(id);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng");
  }

  if (!contract.guard_assigned || contract.guard_assigned.length === 0) {
    throw new Error("Không thể ký duyệt hợp đồng khi chưa phân công nhân sự bảo vệ.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    company_agreed: true,
  };

  if (contract.customer_agreed) {
    payload.status = "active";
  }

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
): Promise<{ contracts: CustomerContract[]; totalCount: number }> => {
  const { data, count } = await getCustomerContracts(
    customerId,
    page,
    limit,
    search,
    status,
    startDate,
    endDate,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedContracts: CustomerContract[] = data.map((item: any) => {
    const booking = item.bookings;
    const service = booking?.services;
    const company = booking?.companies;
    const serviceName = service?.name || "Dịch vụ chưa xác định";
    const companyName = company?.company_name || "Công ty chưa xác định";

    return {
      contract_id: item.contract_id,
      status: item.status,
      created_at: item.created_at,
      start_date: item.start_date || null,
      end_date: item.end_date || null,
      guard_assigned: item.guard_assigned || [],

      // Secondary fields: provided as defaults per Contract interface but excluded from DB query
      booking_id: "",
      contract_file_url: null,
      customer_agreed: false,
      company_agreed: false,
      updated_at: item.created_at,

      // UI specific virtual fields
      contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
      service_name: serviceName,
      company_name: companyName,
    };
  });

  return {
    contracts: formattedContracts,
    totalCount: count,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signContractCustomerService = async (id: string, customerId: string): Promise<any> => {
  const contract = await getCustomerContractDetail(id, customerId);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập");
  }

  validateCustomerSignatureEligibility(contract.customer_agreed, contract.guard_assigned);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    customer_agreed: true,
  };

  if (contract.company_agreed) {
    if (contract.status === "pending_signatures") {
      payload.status = "active";
    }
  }

  return await updateContract(id, payload);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const completeContractCustomerService = async (id: string, customerId: string): Promise<any> => {
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


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCustomerContractDetailService = async (id: string, customerId: string): Promise<any | null> => {
  const item = await getCustomerContractDetail(id, customerId);
  if (!item) return null;

  const booking = item.bookings;
  const service = booking?.services;
  const company = booking?.companies;
  const profile = booking?.profiles;
  const serviceName = service?.name || "Dịch vụ chưa xác định";
  const companyName = company?.company_name || "Công ty chưa xác định";

  const reviewData = item.reviews?.[0] || null;

  // Format price to VND currency string
  let formattedPrice = "";
  if (booking?.quoted_price !== undefined && booking?.quoted_price !== null) {
    formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(booking.quoted_price));
  }

  // Fetch company owner (representative) profile
  let ownerName = "Chưa cập nhật";
  if (company?.owner_id) {
    const ownerProfile = await getProfileByUserIdService(company.owner_id);
    if (ownerProfile) {
      ownerName = ownerProfile.full_name || "Chưa cập nhật";
    }
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
      assignedGuards = profilesData.map((p: any) => ({
        full_name: p.full_name || "Bảo vệ chưa đặt tên",
        phone_number: p.phone_number || "Chưa có SĐT",
        cccd: p.identities?.[0]?.identity_id || "........................",
      }));
    }
  }

  const formattedCompanyAddress = await formatAddressService(company?.address);

  return {
    contract_id: item.contract_id,
    customer_id: booking?.customer_id,
    company_id: company?.company_id,
    contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
    status: item.status,
    customer_agreed: item.customer_agreed || false,
    company_agreed: item.company_agreed || false,
    created_at: item.created_at,
    updated_at: item.updated_at,
    start_date: item.start_date || null,
    end_date: item.end_date || null,
    contract_file_url: item.contract_file_url || null,
    guard_assigned: item.guard_assigned || [],

    // Review specific virtual fields
    has_reviewed: !!reviewData,
    review_rating: reviewData?.rating || 0,
    review_comment: reviewData?.comment || "",

    // UI specific virtual fields
    service_name: serviceName,
    company_name: companyName,
    guards_per_slot: booking?.guards_per_slot || 1,
    duration: `${item.start_date ? new Date(item.start_date).toLocaleDateString("vi-VN") : "..."} - ${item.end_date ? new Date(item.end_date).toLocaleDateString("vi-VN") : "..."}`,
    location: booking?.address || "Chưa cập nhật địa chỉ",
    time_slots: booking?.time_slots || [],
    description: booking?.description || null,
    formatted_price: formattedPrice || "Chưa báo giá",

    company: {
      name: companyName,
      phone: company?.phone || "Chưa cập nhật",
      email: company?.email || "Chưa cập nhật",
      address: formattedCompanyAddress || "Chưa cập nhật",
      tax_code: company?.business_license_no || "Chưa cập nhật",
      representative: ownerName,
      position: "Đại diện pháp luật",
    },
    customer: {
      company_name: "........................",
      address: profile?.address || "Chưa cập nhật",
      tax_code: "........................",
      phone: profile?.phone_number || "Chưa cập nhật",
      email: profile?.email || "Chưa cập nhật",
      representative: profile?.full_name || "Khách hàng không tên",
      position: "........................",
    },
    assigned_guards_list: assignedGuards,
  };
};

export const getContractIdsByCompanyService = async (
  companyId: string,
  location?: string,
) => {
  return getContractIdsByCompany(companyId, location);
};

export const getContractByIdService = async (
  contractId: string,
): Promise<Contract | null> => {
  return await getContractById(contractId);
};

export const assignGuardsToContractService = async (
  contractId: string,
  guardIds: string[],
): Promise<unknown> => {
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

  const contract = await getContractDetail(contractId);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng");
  }

  // Validate company ownership
  const bookingCompanyId = contract.bookings?.company_id;
  if (bookingCompanyId !== companyId) {
    throw new Error("Bạn không có quyền chỉnh sửa hợp đồng này");
  }

  // Check if customer already agreed
  if (contract.customer_agreed) {
    throw new Error("Hợp đồng đã được khách hàng ký duyệt, không thể thay đổi danh sách bảo vệ.");
  }

  // Validate shift duration and minimum guards
  const booking = contract.bookings;
  const timeSlots: string[] = booking?.time_slots || [];
  const requiredGuards = booking?.guards_per_slot || 1;
  validateAssignGuardsRules(timeSlots, requiredGuards, guardIds.length);

  return await updateContract(contractId, {
    guard_assigned: guardIds,
  });
};