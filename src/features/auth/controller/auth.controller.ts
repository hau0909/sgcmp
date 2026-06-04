import { registerAccountService } from "../service/auth.service";
import {
  emailExistError,
  validateRegisterInput,
} from "../validator/auth.validator";
import type { RegisterInput } from "../types";
import type { AuthError } from "@supabase/supabase-js";
import { checkPhoneNumberExists } from "../validator/auth.validator";

export const handleRegisterAccount = async ({
  email,
  password,
  confirmPassword,
  phoneNumber,
  fullName,
}: RegisterInput) => {
  const validateError = validateRegisterInput({
    email,
    password,
    confirmPassword,
    phoneNumber,
    fullName,
  });

  if (validateError) {
    return {
      success: false,
      message: validateError,
    };
  }

  const phoneExists = await checkPhoneNumberExists(phoneNumber);

  if (phoneExists) {
    return {
      success: false,
      message: "Số điện thoại này đã được đăng ký",
    };
  }

  try {
    const account = await registerAccountService({
      email,
      password,
      phoneNumber,
      fullName,
    });

    return {
      success: true,
      message:
        "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      account,
    };
  } catch (error) {
    return {
      success: false,
      message: emailExistError(error as AuthError),
    };
  }
};
