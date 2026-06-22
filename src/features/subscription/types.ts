import { Plan } from "@/types/Plan";
import { Subscription } from "@/types/Subscription";

export interface CurrentPlanWithSubscription {
  plan: Plan;
  subscription: Subscription;
}

export interface CompanySubscriptionCheckResult {
  hasSubscription: boolean;
  isActive: boolean;
  subscription: Subscription | null;
}
