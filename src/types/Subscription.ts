import { GeneralStatus } from "./Enum";

export interface Subscription {
  subscription_id: string;
  company_id: string;
  plan_id: number;
  start_date: string;
  end_date: string;
  status: GeneralStatus;
  auto_renew: boolean;
  created_at: string;
  updated_at: string | null;
}
