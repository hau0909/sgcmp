import { fetcher } from "@/lib/fetcher";

export async function requestGetContracts(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const query = new URLSearchParams();
  query.append("page", params.page.toString());
  query.append("limit", params.limit.toString());
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);

  return await fetcher(`/api/contracts?${query.toString()}`, {
    method: "GET",
  });
}
