import {
  registerAccountService,
  loginAccountService,
  getUserProfileService,
  logoutUserService,
} from "../service/auth.service";
import {
  emailExistError,
  validateRegisterInput,
  validateLoginInput,
  checkPhoneNumberExists,
} from "../validator/auth.validator";
import type { RegisterInput, LoginInput } from "../types";
import type { AuthError } from "@supabase/supabase-js";

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
      confirmPassword,
      role: "customer",
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

export const handleLoginAccount = async ({ email, password }: LoginInput) => {
  const validateError = validateLoginInput({ email, password });

  if (validateError) {
    return {
      success: false,
      message: validateError,
    };
  }

  try {
    const loginResult = await loginAccountService({ email, password });

    return {
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        user_id: loginResult.user_id,
        email: loginResult.email,
        full_name: loginResult.full_name,
        phone_number: loginResult.phone_number,
        role: loginResult.role,
        status: loginResult.status,
        avatar_url: loginResult.avatar_url,
        company_id: loginResult.company_id,
        company: loginResult.company,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Đăng nhập thất bại. Vui lòng thử lại.",
    };
  }
};

export const handleGetUserProfile = async (userId: string) => {
  if (!userId) {
    return {
      success: false,
      message: "Không tìm thấy tài khoản!",
      data: null,
    };
  }

  try {
    const userProfile = await getUserProfileService(userId);

    return {
      success: true,
      message: "lấy thông tin tài khoảng thành công",
      data: {
        id: userProfile.user_id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        phone_number: userProfile.phone_number,
        gender: userProfile.gender,
        date_of_birth: userProfile.date_of_birth,
        address: userProfile.address,
        role: userProfile.role,
        avatar_url: userProfile.avatar_url,
        status: userProfile.status,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Lấy thông tin người dùng thất bại. Vui lòng thử lại.",
      data: null,
    };
  }
};

export const handleLogout = async () => {
  await logoutUserService();

  return {
    message: "Đăng xuất thành công.",
  };
};
