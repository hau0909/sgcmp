import { ContractStatus } from "./Enum";

export interface Contract {
  contract_id: string;
  booking_id: string;
  contract_file_url: string | null;
  customer_agreed: boolean;
  company_agreed: boolean;
  start_date: string | null;
  end_date: string | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
  guard_assigned: string[];

  // Custom joined fields for frontend/API lists and detail representations
  contract_code?: string;
  customer_name?: string;
  service_name?: string;
}
