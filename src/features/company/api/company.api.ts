import { fetcher } from "@/lib/fetcher";
import {
  GetCompaniesRequestParams,
  GetCompaniesResponse,
  GetCompanyFiltersRequestParams,
  GetCompanyFiltersResponse,
  CompanyDetailData,
  Service,
  UpdateCompanyProfileInput,
} from "../types";
import { ImageType } from "@/types/Enum";

export async function requestGetCompanies(
  params: GetCompaniesRequestParams = {},
): Promise<GetCompaniesResponse> {
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
  params: GetCompanyFiltersRequestParams = {},
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

export async function requestGetCompanyById(
  id: string,
): Promise<CompanyDetailData> {
  const url = `/api/companies/${id}`;
  return await fetcher(url, {
    method: "GET",
  });
}

export async function requestGetAvailableServices(): Promise<Service[]> {
  const url = `/api/services`;
  return await fetcher(url, {
    method: "GET",
  });
}

export async function requestAddCompanyService(
  companyId: string,
  payload: { serviceId: string; description: string; price: number },
): Promise<any> {
  const url = `/api/companies/${companyId}/services`;
  return await fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function requestDeleteCompanyService(
  companyId: string,
  serviceId: string,
): Promise<any> {
  const url = `/api/companies/${companyId}/services?serviceId=${serviceId}`;
  return await fetcher(url, {
    method: "DELETE",
  });
}

export const requestUpdateCompanyProfile = async (
  input: UpdateCompanyProfileInput,
) => {
  const result = await fetcher("/api/companies/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return result.data;
};

export const requestUploadCompanyImage = async ({
  file,
  image_type,
}: {
  file: File;
  image_type: ImageType;
}) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("image_type", image_type);

  const result = await fetcher("/api/companies/images", {
    method: "POST",
    body: formData,
  });

  if (result?.success === false) {
    throw new Error(result.message || "Không thể tải ảnh công ty.");
  }

  return result.data;
};
