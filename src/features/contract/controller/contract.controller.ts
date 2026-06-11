import { Contract } from "@/types/Contract";
import { ContractStatus } from "@/types/Enum";
import {
  getContractsService,
  getContractDetailService,
  signContractCompanyService,
  uploadContractFileService,
  deleteContractFileService,
} from "../service/contract.service";

export const handleGetContracts = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ contracts: Contract[]; totalCount: number }> => {
  const validStatus = (params.status && params.status !== "")
    ? (params.status as ContractStatus)
    : undefined;

  return await getContractsService(
    params.page,
    params.limit,
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
export const handleSignContractCompany = async (id: string): Promise<any> => {
  return await signContractCompanyService(id);
};

export const handleUploadContractFile = async (id: string, file: File): Promise<string> => {
  return await uploadContractFileService(id, file);
};

export const handleDeleteContractFile = async (id: string): Promise<void> => {
  await deleteContractFileService(id);
};
