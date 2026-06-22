import { Plan } from "@/types/Plan";
import {
  getAllPlans,
  getCurrentActivePlan,
  getPlanById,
  checkCompanySubscription,
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

