import { Company } from "@/types/Company";
import { Registration } from "@/types/Registration";

export interface RegistrationWithCompany extends Registration {
  companies: Partial<Company> | null;
}
