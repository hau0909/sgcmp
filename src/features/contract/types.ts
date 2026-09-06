import { Contract, ContractParties } from "@/types/Contract";

export type { ContractParties };

export interface CustomerContract extends Contract {
  company_name?: string;
}
