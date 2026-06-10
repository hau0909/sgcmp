import { Contract } from "@/types/Contract";
import { ContractStatus } from "@/types/Enum";
import { getContracts } from "../repository/contract.repository";

export const getContractsService = async (
  page: number,
  limit: number,
  search?: string,
  status?: ContractStatus,
  startDate?: string,
  endDate?: string
): Promise<{ contracts: Contract[]; totalCount: number }> => {
  const { data, count } = await getContracts(page, limit, search, status, startDate, endDate);

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
