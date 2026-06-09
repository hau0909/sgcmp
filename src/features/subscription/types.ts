import { Plan } from "@/types/Plan";
import { Subscription } from "@/types/Subscription";

export interface CurrentPlanWithSubscription {
  plan: Plan;
  subscription: Subscription;
}
