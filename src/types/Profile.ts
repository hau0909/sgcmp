import { GeneralStatus, UserRole } from "./Enum";

export interface Profile {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  role: UserRole;
  avatarUrl: string | null;
  status: GeneralStatus;
  createdAt: Date;
  updatedAt: Date | null;
}
