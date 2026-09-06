import { ContractStatus } from "./Enum";
import { ContractParties } from "./ContractParties";

export type { ContractParties };

export interface Contract {
  contract_id: string;
  booking_id: string;
  customer_id: string | null;
  company_id: string | null;
  contract_file_url: string | null;
  customer_agreed: boolean;
  company_agreed: boolean;
  start_date: string | null;
  end_date: string | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
  guard_assigned: string[];

  // Snapshot parties information
  contract_parties?: ContractParties | null;

  // Custom joined fields for frontend/API lists and detail representations
  contract_code?: string;
  customer_name?: string;
  service_name?: string;
  signed_company_name?: string | null;
  is_company_name_changed?: boolean;
}
