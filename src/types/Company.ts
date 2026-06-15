import { GeneralStatus } from "./Enum";

export interface Company {
  company_id: string;
  owner_id: string;
  company_name: string;
  business_license_no: string;
  license_file_url: string | null;
  address: string;
  description: string | null;
  rating_average: number | null;
  status: GeneralStatus;
  created_at: string;
}
