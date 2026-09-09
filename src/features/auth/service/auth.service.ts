import type { User, AuthResponse } from "@supabase/supabase-js";
import type { Profile } from "@/types/Profile";
import type { RegisterInputService, LoginInputService, LoginResponseData } from "../types";
import {
  registerAccount,
  loginAccount,
  logoutUser,
  getUserProfile,
  getCurrentUser,
  getCompanyIdByUser,
} from "../repository/auth.repository";

export const registerAccountService = async ({
  email,
  password,
  fullName,
  phoneNumber,
  role,
  tempPass,
  tempPasswordExpiresAt,
  registrationType,
  companyName,
  businessLicenseNo,
  companyEmail,
  companyPhone,
}: RegisterInputService): Promise<AuthResponse["data"]> => {
  return registerAccount({
    email,
    password,
    full_name: fullName,
    phone_number: phoneNumber,
    role,
    tempPass,
    tempPasswordExpiresAt,
    registration_type: registrationType,
    company_name: companyName,
    business_license_no: businessLicenseNo,
    company_email: companyEmail,
    company_phone: companyPhone,
  });
};

export const loginAccountService = async ({
  email,
  password,
}: LoginInputService): Promise<LoginResponseData> => {
  return loginAccount({ email, password });
};

// Service function alias with 'Service' suffix per naming convention
export const loginService = loginAccountService;

export const getUserProfileService = async (
  userId: string,
): Promise<Profile> => {
  return getUserProfile(userId);
};

export const getCompanyIdByUserService = async (
  userId: string,
  role: string,
): Promise<string | null> => {
  return getCompanyIdByUser(userId, role);
};

export const getCurrentUserProfileService = async (): Promise<Profile | null> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  return getUserProfileService(currentUser.id);
};

export const getUser = async (): Promise<User | null> => {
  return getCurrentUser();
};

export const logoutUserService = async (): Promise<boolean> => {
  return await logoutUser();
};
