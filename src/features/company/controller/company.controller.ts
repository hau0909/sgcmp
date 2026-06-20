import {
  CompanyFilterParams,
  PaginatedCompaniesResponse,
  getCompaniesService,
  CompanyFiltersDataResponse,
  getCompanyFiltersService,
  getCompanyByIdService
} from "../service/company.service";
import { CompanyDetailData } from "../types";

export const handleGetCompanies = async (
  params: CompanyFilterParams
): Promise<PaginatedCompaniesResponse> => {
  const result = await getCompaniesService(params);
  return result;
};

export const handleGetCompanyFilters = async (
  params?: CompanyFilterParams
): Promise<CompanyFiltersDataResponse> => {
  const result = await getCompanyFiltersService(params);
  return result;
};

export const handleGetCompanyById = async (
  id: string
): Promise<CompanyDetailData | null> => {
  const result = await getCompanyByIdService(id);
  return result;
};
