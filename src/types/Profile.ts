import { GeneralStatus, UserRole } from "./Enum";

export interface Profile {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  role: UserRole;
  avatar_url: string | null;
  status: GeneralStatus;
  created_at: string;
  updated_at: string | null;
}
