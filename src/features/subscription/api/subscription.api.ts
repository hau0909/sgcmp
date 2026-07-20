/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetcher } from "@/lib/fetcher";
import { Plan } from "@/types/Plan";

import { CompanySubscriptionCheckResult } from "../types";

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

export async function requestCheckSubscription(
  companyId: string
): Promise<CompanySubscriptionCheckResult> {
  const result = await fetcher(`/api/subscriptions/check?companyId=${companyId}`, {
    method: "GET",
  });

  return result;
}

export async function requestCreatePlan(
  planData: Omit<Plan, "plan_id" | "created_at" | "updated_at">,
): Promise<{ success: boolean; plan: Plan; error?: string }> {
  return await fetcher("/api/subscriptions/plans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(planData),
  });
}

export async function requestUpdatePlan(
  planId: number,
  planData: Partial<Omit<Plan, "plan_id" | "created_at" | "updated_at">>,
): Promise<{ success: boolean; plan: Plan; error?: string }> {
  return await fetcher(`/api/subscriptions/plans/${planId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(planData),
  });
}

export async function requestDeletePlan(
  planId: number,
): Promise<{ success: boolean; error?: string }> {
  return await fetcher(`/api/subscriptions/plans/${planId}`, {
    method: "DELETE",
  });
}

export async function requestGetPlanById(
  planId: number,
): Promise<{ success: boolean; plan?: Plan; error?: string }> {
  return await fetcher(`/api/subscriptions/plans/${planId}`, {
    method: "GET",
  });
}

