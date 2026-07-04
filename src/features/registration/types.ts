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
  avatar_url?: string | null;
}

export interface RepresentativeIdentity {
  user_id: string;
  identity_id: string;
  issue_date: string;
  issue_place: string;
  front_url: string;
  back_url: string;
}

export interface CompanyImage {
  image_id: string;
  company_id: string;
  image_url: string;
  image_type: "logo" | "banner" | "other";
}

export interface RegistrationDetail extends Registration {
  companies: (Company & {
    profiles: RepresentativeProfile | null;
    identities: RepresentativeIdentity | null;
    companyImgs: CompanyImage[];
  }) | null;
}