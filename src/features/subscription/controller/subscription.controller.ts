import { Plan } from "@/types/Plan";
import {
  getAllPlansService,
  getCurrentActivePlanService,
  checkCompanySubscriptionService,
} from "../service/subscription.service";
import { CurrentPlanWithSubscription, CompanySubscriptionCheckResult } from "../types";

export const handleGetAllPlans = async (): Promise<Plan[]> => {
  const result = await getAllPlansService();
  return result;
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
