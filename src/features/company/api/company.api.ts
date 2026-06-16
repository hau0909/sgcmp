import { fetcher } from "@/lib/fetcher";
import {
  GetCompaniesRequestParams,
  GetCompaniesResponse,
  GetCompanyFiltersRequestParams,
  GetCompanyFiltersResponse,
} from "../types";

export async function requestGetCompanies(params: GetCompaniesRequestParams = {}): Promise<GetCompaniesResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/companies${queryString ? `?${queryString}` : ""}`;

  return await fetcher(url, {
    method: "GET",
  });
}

export async function requestGetCompanyFilters(
  params: GetCompanyFiltersRequestParams = {}
): Promise<GetCompanyFiltersResponse> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set("search", params.search);
  if (params.location) queryParams.set("location", params.location);
  if (params.tags && params.tags.length > 0) {
    queryParams.set("tags", params.tags.join(","));
  }
  if (params.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params.page) queryParams.set("page", params.page.toString());
  if (params.limit) queryParams.set("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/companies/filters${queryString ? `?${queryString}` : ""}`;

  return await fetcher(url, {
    method: "GET",
  });
}
