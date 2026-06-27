import { CompanyAddress } from "../features/address/types";
import { CompanyStatus } from "./Enum";

export interface Company {
  company_id: string;
  owner_id: string;
  company_name: string;
  business_license_no: string;
  license_file_url: string | null;
  address: CompanyAddress | string;
  email: string;
  phone: string;
  description: string | null;
  rating_average: number | null;
  status: CompanyStatus;
  created_at: string;
}
