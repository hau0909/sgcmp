import { Plan } from "@/types/Plan";
import { getAllPlansService, getCurrentActivePlanService } from "../service/subscription.service";
import { CurrentPlanWithSubscription } from "../types";

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
