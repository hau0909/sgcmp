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
