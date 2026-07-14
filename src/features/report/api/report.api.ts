import { fetcher } from "@/lib/fetcher";
import { CreateReportPayload } from "../types";

export async function requestGetCustomerReports(params: {
  customerId: string;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
}) {
  const query = new URLSearchParams();
  query.append("customerId", params.customerId);
  query.append("page", params.page.toString());
  query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.type) query.append("type", params.type);

  return await fetcher(`/api/my-reports?${query.toString()}`, {
    method: "GET",
  });
}

export async function requestCreateReport(payload: CreateReportPayload) {
  return await fetcher(`/api/my-reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function requestDeleteReport(id: string, customerId: string) {
  return await fetcher(`/api/my-reports/${id}?customerId=${customerId}`, {
    method: "DELETE",
  });
}

export async function requestGetCustomerContractsForReport(customerId: string) {
  return await fetcher(`/api/my-reports/contracts?customerId=${customerId}`, {
    method: "GET",
  });
}

export async function requestGetCompanyReports(params: {
  companyId: string;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
}) {
  const query = new URLSearchParams();
  query.append("companyId", params.companyId);
  query.append("page", params.page.toString());
  query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.type) query.append("type", params.type);

  return await fetcher(`/api/coor-reports?${query.toString()}`, {
    method: "GET",
  });
}

export async function requestUpdateReportStatus(id: string, status: string) {
  return await fetcher(`/api/coor-reports/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

