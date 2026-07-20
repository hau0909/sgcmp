import { Plan } from "@/types/Plan";
import {
  getAllPlans,
  getCurrentActivePlan,
  getPlanById,
  checkCompanySubscription,
  createPlan,
  updatePlan,
  deletePlan,
} from "../repository/subscription.repository";
import { CurrentPlanWithSubscription, CompanySubscriptionCheckResult } from "../types";

export const getAllPlansService = async (): Promise<Plan[]> => {
  const result = await getAllPlans();
  return result;
};

export const getCurrentActivePlanService = async (
  companyId: string
): Promise<CurrentPlanWithSubscription | null> => {
  const result = await getCurrentActivePlan(companyId);
  return result;
};

export const getPlanByIdService = async (planId: number): Promise<Plan | null> => {
  if (!planId) {
    throw new Error("Plan ID is required");
  }
  const result = await getPlanById(planId);
  return result;
};

export const checkCompanySubscriptionService = async (
  companyId: string,
): Promise<CompanySubscriptionCheckResult> => {
  if (!companyId) {
    throw new Error("Company ID is required");
  }
  const result = await checkCompanySubscription(companyId);
  return result;
};

export const createPlanService = async (
  planData: Omit<Plan, "plan_id" | "created_at" | "updated_at">,
): Promise<Plan> => {
  if (!planData.plan_name) {
    throw new Error("Plan name is required");
  }
  if (planData.price < 0) {
    throw new Error("Price cannot be negative");
  }
  if (planData.duration_days <= 0) {
    throw new Error("Duration must be at least 1 day");
  }
  return await createPlan(planData);
};

export const updatePlanService = async (
  planId: number,
  planData: Partial<Omit<Plan, "plan_id" | "created_at" | "updated_at">>,
): Promise<Plan> => {
  if (!planId) {
    throw new Error("Plan ID is required");
  }
  if (planData.price !== undefined && planData.price < 0) {
    throw new Error("Price cannot be negative");
  }
  if (planData.duration_days !== undefined && planData.duration_days <= 0) {
    throw new Error("Duration must be at least 1 day");
  }
  return await updatePlan(planId, planData);
};

export const deletePlanService = async (planId: number): Promise<void> => {
  if (!planId) {
    throw new Error("Plan ID is required");
  }
  await deletePlan(planId);
};


