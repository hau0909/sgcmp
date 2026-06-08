import { RegisterInputService, LoginInputService } from "../types";
import { registerAccount, loginAccount } from "../repository/auth.repository";

export const registerAccountService = async ({
  email,
  password,
  fullName,
  phoneNumber,
}: RegisterInputService) => {
  return registerAccount({
    email,
    password,
    full_name: fullName,
    phone_number: phoneNumber,
    isCoordinator: false,
  });
};

export const loginAccountService = async ({
  email,
  password,
}: LoginInputService) => {
  return loginAccount({ email, password });
};
