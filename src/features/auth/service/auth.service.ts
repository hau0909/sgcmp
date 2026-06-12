import { RegisterInputService, LoginInputService } from "../types";
import { registerAccount, loginAccount } from "../repository/auth.repository";
import { getUserProfile, getCurrentUser } from "../repository/auth.repository";

export const registerAccountService = async ({
  email,
  password,
  fullName,
  phoneNumber,
  role,
  tempPass,
  tempPasswordExpiresAt,
}: RegisterInputService) => {
  return registerAccount({
    email,
    password,
    full_name: fullName,
    phone_number: phoneNumber,
    role,
    tempPass,
    tempPasswordExpiresAt,
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
