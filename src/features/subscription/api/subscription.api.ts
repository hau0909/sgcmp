/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetcher } from "@/lib/fetcher";
import { Plan } from "@/types/Plan";

export async function requestGetAllPlans(): Promise<Plan[]> {
  const result = await fetcher("/api/subscriptions/plans", {
    method: "GET",
  });

  return result.plans;
}

export async function requestGetCurrentPlan(companyId: string): Promise<any> {
  const result = await fetcher(
    `/api/subscriptions/plans/current?companyId=${companyId}`,
    {
      method: "GET",
    },
  );

  return result.currentPlan;
}
