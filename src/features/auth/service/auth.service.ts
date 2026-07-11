import { RegisterInputService, LoginInputService } from "../types";
import {
  registerAccount,
  loginAccount,
  logoutUser,
} from "../repository/auth.repository";
import { getUserProfile, getCurrentUser } from "../repository/auth.repository";

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
}: RegisterInputService) => {
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
}: LoginInputService) => {
  return loginAccount({ email, password });
};

export const getUserProfileService = async (userId: string) => {
  return getUserProfile(userId);
};

export const getCurrentUserProfileService = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  return getUserProfileService(currentUser.id);
};

export const getUser = async () => {
  return getCurrentUser();
};

export const logoutUserService = async () => {
  return await logoutUser();
};
