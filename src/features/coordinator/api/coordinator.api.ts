/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetcher } from "@/lib/fetcher";
import { CoordinatorWithUser } from "../types";

export async function requestGetCoordinators(
  companyId: string,
  page = 1,
  limit = 10
): Promise<{ coordinators: CoordinatorWithUser[]; total: number }> {
  const params = new URLSearchParams({
    companyId,
    page: String(page),
    limit: String(limit),
  });

  const result = await fetcher(`/api/coordinators?${params.toString()}`, {
    method: "GET",
  });

  return { coordinators: result.coordinators, total: result.total };
}
