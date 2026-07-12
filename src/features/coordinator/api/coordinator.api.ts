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

import { CreateCoordinatorPayload, UpdateCoordinatorPayload } from "../types";

export async function requestCreateCoordinator(
  payload: CreateCoordinatorPayload
): Promise<{ success: boolean; message: string; userId?: string }> {
  return await fetcher("/api/coordinators", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestGetCoordinatorDetail(
  id: string
): Promise<any> {
  return await fetcher(`/api/coordinators/${id}`, {
    method: "GET",
  });
}

export async function requestUpdateCoordinator(
  id: string,
  payload: UpdateCoordinatorPayload
): Promise<{ success: boolean; message: string; field?: string }> {
  return await fetcher(`/api/coordinators/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

