import { Company } from "@/types/Company";
import { Registration } from "@/types/Registration";

export interface RegistrationWithCompany extends Registration {
  companies: Partial<Company> | null;
}

export interface RepresentativeProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone_number?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
}

export interface RegistrationDetail extends Registration {
  companies: (Company & {
    profiles: RepresentativeProfile | null;
  }) | null;
}