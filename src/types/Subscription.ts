import { GeneralStatus } from "./Enum";

export interface Subscription {
  subscriptionId: string;
  companyId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: GeneralStatus;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
