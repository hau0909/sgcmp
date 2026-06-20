import { Contract } from "@/types/Contract";
import { ContractStatus } from "@/types/Enum";
import { CustomerContract } from "../types";
import {
  getContracts,
  getContractDetail,
  updateContract,
  getCustomerContracts,
  getCustomerContractDetail,
  getContractIdsByCompany,
} from "../repository/contract.repository";
import { createClient } from "@/lib/supabase/server";

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
export const getContractDetailService = async (
  id: string,
): Promise<any | null> => {
  const item = await getContractDetail(id);
  if (!item) return null;

  const booking = item.bookings;
  const profile = booking?.profiles;
  const service = booking?.services;
  const serviceName = service?.name || "Dịch vụ chưa xác định";

  // Format price to VND currency string
  let formattedPrice = "";
  if (booking?.quoted_price !== undefined && booking?.quoted_price !== null) {
    formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(booking.quoted_price));
  }

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

    // Virtual/mapped fields for UI rendering
    contract_code: `HD-${item.contract_id.slice(0, 8).toUpperCase()}`,
    customer_name: profile?.full_name || "Khách hàng không tên",
    service_name: serviceName,

    // Booking details
    booking: booking
      ? {
          booking_id: booking.booking_id,
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

export const signContractCustomerService = async (
  id: string,
  customerId: string,
): Promise<any> => {
  const contract = await getCustomerContractDetail(id, customerId);
  if (!contract) {
    throw new Error("Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập");
  }

  if (contract.customer_agreed) {
    throw new Error("Bạn đã ký xác nhận hợp đồng này rồi");
  }

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
export const getCustomerContractDetailService = async (
  id: string,
  customerId: string,
): Promise<any | null> => {
  const item = await getCustomerContractDetail(id, customerId);
  if (!item) return null;

  const booking = item.bookings;
  const service = booking?.services;
  const company = booking?.companies;
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
      phone: "Chưa cập nhật",
      email: "Chưa cập nhật",
      address: company?.address || "Chưa cập nhật địa chỉ",
    },
  };
};

export const getContractIdsByCompanyService = async (
  companyId: string,
  location?: string,
) => {
  return getContractIdsByCompany(companyId, location);
};
