import { CompanyPublishRequestStatus } from "./Enum";

export interface PublishRequest {
  request_id: string;
  company_id: string;
  status: CompanyPublishRequestStatus;
  requested_by: string;
  requested_at: string;
  approved_by: string | null;
  processed_at: string | null;
  notes: string | null;

  companies: {
    company_name: string;
    owner_id: string;
    profiles?: {
      full_name: string | null;
      email: string | null;
    } | null;
  } | null;
}

export interface CreatePublishRequestInput {
  note?: string;
}

export interface CreatePublishRequestResponse {
  success: boolean;
  data: {
    request_id: string;
  };
}
