import { IdentityDetail } from "../identity/type";

export type gender = "male" | "female";

export type createGuardAccountFormInput = {
  full_name: string;
  date_of_birth: string;
  gender: gender;

  identity_id: string;
  identity_issue_date: string;
  identity_issue_place: string;

  address: string;
  phone_number: string;
  email: string;

  avatar_file?: File | null;
};

export type InsertGuardInformationParams = {
  user_id: string;
  company_id: string;

  full_name: string;
  phone_number: string;
  email: string;

  date_of_birth: string;
  gender: gender;
  address: string;
  avatar_url?: string | null;

  identity_id: string;
  identity_issue_date: string;
  identity_issue_place: string;
};

export type InsertGuardInformationInput = {
  user_id: string;

  full_name: string;
  phone_number: string;
  email: string;

  date_of_birth: string;
  gender: gender;
  address: string;
  avatar_url?: string | null;

  identity_id: string;
  identity_issue_date: string;
  identity_issue_place: string;
};

export type InsertGuardInformationRepositoryParams =
  InsertGuardInformationInput & {
    company_id: string;
  };

export type InsertGuardInformationBody = {
  user_id?: unknown;

  full_name?: unknown;
  phone_number?: unknown;
  email?: unknown;

  date_of_birth?: unknown;
  gender?: unknown;
  address?: unknown;
  avatar_url?: unknown;

  identity_id?: unknown;
  identity_issue_date?: unknown;
  identity_issue_place?: unknown;
};

export type CreateGuardAccountBody = {
  email?: unknown;
  full_name?: unknown;
  phone_number?: unknown;
};

export type CreateGuardAccountInput = {
  email: string;
  full_name: string;
  phone_number: string;
};

export type CreateGuardAccountResponse = {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    email: string;
  };
};

export type UploadGuardAvatarRepositoryParams = {
  user_id: string;
  file: File;
};

export type UploadGuardAvatarResult = {
  file_path: string;
  public_url: string;
};

export type UploadGuardAvatarResponse = {
  success: boolean;
  message: string;
  data?: UploadGuardAvatarResult;
};

export type GuardProfileItem = {
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
};

export type GuardListItem = {
  guard_id: string;
  profiles: GuardProfileItem | GuardProfileItem[] | null;
};

export type GetAllGuardsResponse = {
  success: boolean;
  message: string;
  data: GuardListItem[];
};

export type GuardIdentityDetail = {
  identity_id: string;
  issue_date: string;
  issue_place: string;
};

export type GuardDetailProfile = {
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  avatar_url: string | null;
};

export type GuardDetailDatabase = {
  guard_id: string;
  user_id: string;
  company_id: string;
  profiles: GuardDetailProfile | GuardDetailProfile[] | null;
};

export type GuardDetail = GuardDetailDatabase & {
  identity: IdentityDetail | null;
};

export type GetGuardDetailResponse = {
  success: boolean;
  message: string;
  data: GuardDetail | null;
};
