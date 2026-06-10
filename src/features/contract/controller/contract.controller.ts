import { Contract } from "@/types/Contract";
import { ContractStatus } from "@/types/Enum";
import { getContractsService } from "../service/contract.service";

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
