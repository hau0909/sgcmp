import { Contract } from "@/types/Contract";
import { ContractStatus } from "@/types/Enum";
import { checkCompanySubscriptionService } from "@/features/subscription/service/subscription.service";
import {
  getContractsService,
  getContractDetailService,
  signContractCompanyService,
  signContractCustomerService,
  uploadContractFileService,
  deleteContractFileService,
  getCustomerContractsService,
  getCustomerContractDetailService,
  completeContractCustomerService,
  assignGuardsToContractService,
} from "../service/contract.service";
import { CustomerContract } from "../types";

export const handleGetContracts = async (params: {
  page: number;
  limit: number;
  companyId?: string;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ contracts: Contract[]; totalCount: number }> => {
  if (params.companyId) {
    const subCheck = await checkCompanySubscriptionService(params.companyId);
    if (!subCheck.isActive) {
      throw new Error("Tài khoản doanh nghiệp chưa đăng ký gói dịch vụ hoặc gói đã hết hạn.");
    }
  }

  const validStatus = (params.status && params.status !== "")
    ? (params.status as ContractStatus)
    : undefined;

  return await getContractsService(
    params.page,
    params.limit,
    params.companyId,
    params.search,
    validStatus,
    params.startDate,
    params.endDate
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleGetContractDetail = async (id: string): Promise<any | null> => {
  return await getContractDetailService(id);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleGetCustomerContractDetail = async (id: string, customerId: string): Promise<any | null> => {
  return await getCustomerContractDetailService(id, customerId);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleSignContractCompany = async (id: string): Promise<any> => {
  return await signContractCompanyService(id);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleSignContractCustomer = async (id: string, customerId: string): Promise<any> => {
  return await signContractCustomerService(id, customerId);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleCompleteContractCustomer = async (id: string, customerId: string): Promise<any> => {
  return await completeContractCustomerService(id, customerId);
};


export const handleUploadContractFile = async (id: string, file: File): Promise<string> => {
  return await uploadContractFileService(id, file);
};

export const handleDeleteContractFile = async (id: string): Promise<void> => {
  await deleteContractFileService(id);
};

export const handleGetCustomerContracts = async (
  customerId: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ contracts: CustomerContract[]; totalCount: number }> => {
  const validStatus = (params.status && params.status !== "")
    ? (params.status as ContractStatus)
    : undefined;

  return await getCustomerContractsService(
    customerId,
    params.page,
    params.limit,
    params.search,
    validStatus,
    params.startDate,
    params.endDate
  );
};

export const handleAssignGuardsToContract = async (
  contractId: string,
  guardIds: string[],
): Promise<{ success: boolean; message: string; contract?: unknown }> => {
  const contract = await assignGuardsToContractService(contractId, guardIds);
  return {
    success: true,
    message: "Phân công bảo vệ thành công",
    contract,
  };
};
