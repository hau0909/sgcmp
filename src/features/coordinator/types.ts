import { Coordinator } from "@/types/Coordinator";
import { Profile } from "@/types/Profile";

export interface CoordinatorWithUser extends Coordinator {
  profiles: Profile;
}

export type CreateCoordinatorPayload = {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullName: string;
  phoneNumber: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  companyId: string;
  identityId: string;
  issueDate: string;
  issuePlace: string;
};

// ─── Form ─────────────────────────────────────────────────────────────────────

export interface City {
  city_id: number;
  city_name: string;
}

export interface Ward {
  ward_id: number;
  ward_name: string;
  city_id: number;
}

