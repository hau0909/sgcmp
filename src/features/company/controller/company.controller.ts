import {
  CompanyFilterParams,
  PaginatedCompaniesResponse,
  getCompaniesService,
  CompanyFiltersDataResponse,
  getCompanyFiltersService
} from "../service/company.service";

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
