import { RegisterInputService } from "../types";
import { registerAccount } from "../repository/auth.repository";

export const registerAccountService = async ({
  email,
  password,
  fullName,
  phoneNumber,
}: RegisterInputService) => {
  return registerAccount({
    email,
    password,
    fullName,
    phoneNumber,
    isCoordinator: false,
  });
};
