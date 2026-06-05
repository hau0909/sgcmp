import { Plan } from "@/types/Plan";
import { getAllPlans, getCurrentActivePlan } from "../repository/subscription.repository";
import { CurrentPlanWithSubscription } from "../types";

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
