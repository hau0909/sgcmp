import { Plan } from "@/types/Plan";
import {
  getAllPlansService,
  getCurrentActivePlanService,
  checkCompanySubscriptionService,
  createPlanService,
  updatePlanService,
  deletePlanService,
  getPlanByIdService,
} from "../service/subscription.service";
import { CurrentPlanWithSubscription, CompanySubscriptionCheckResult } from "../types";

export const handleGetAllPlans = async (): Promise<Plan[]> => {
  const result = await getAllPlansService();
  return result;
};

export const handleGetPlanById = async (planId: number): Promise<Plan | null> => {
  return await getPlanByIdService(planId);
};

export const handleGetCurrentActivePlan = async (
  companyId: string
): Promise<CurrentPlanWithSubscription | null> => {
  const result = await getCurrentActivePlanService(companyId);
  return result;
};

export const handleCheckCompanySubscription = async (
  companyId: string
): Promise<CompanySubscriptionCheckResult> => {
  const result = await checkCompanySubscriptionService(companyId);
  return result;
};

export const handleCreatePlan = async (
  planData: Omit<Plan, "plan_id" | "created_at" | "updated_at">,
): Promise<Plan> => {
  return await createPlanService(planData);
};

export const handleUpdatePlan = async (
  planId: number,
  planData: Partial<Omit<Plan, "plan_id" | "created_at" | "updated_at">>,
): Promise<Plan> => {
  return await updatePlanService(planId, planData);
};

export const handleDeletePlan = async (planId: number): Promise<void> => {
  await deletePlanService(planId);
};

