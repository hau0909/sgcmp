import { getCoordinatorsService, addCoordinatorToCompanyService } from "../service/coordinator.service";
import { registerAccountService } from "@/features/auth/service/auth.service";
import { validateEmail, validateFullName, validatePhoneNumber, checkPhoneNumberExists } from "@/features/auth/validator/auth.validator";
import { validateIdentityExists } from "@/features/identity/validator/identity.validator";
import { CoordinatorWithUser, CreateCoordinatorPayload } from "../types";

export const handleGetCoordinators = async (
  companyId: string,
  page = 1,
  limit = 10
): Promise<{ data: CoordinatorWithUser[]; total: number }> => {
  return await getCoordinatorsService(companyId, page, limit);
};

export const handleCreateCoordinator = async (
  payload: CreateCoordinatorPayload
): Promise<{ success: boolean; message: string; userId?: string }> => {
  // Validate cơ bản
  const emailError = validateEmail(payload.email);
  if (emailError) return { success: false, message: emailError };

  const fullNameError = validateFullName(payload.fullName);
  if (fullNameError) return { success: false, message: fullNameError };

  const phoneError = validatePhoneNumber(payload.phoneNumber);
  if (phoneError) return { success: false, message: phoneError };

  if (!payload.companyId) {
    return { success: false, message: "Company ID là bắt buộc" };
  }

  if (!payload.issueDate || !payload.issuePlace) {
    return { success: false, message: "Vui lòng nhập đầy đủ ngày và nơi cấp của CMND/CCCD" };
  }

  try {
    const isPhoneTaken = await checkPhoneNumberExists(payload.phoneNumber);
    if (isPhoneTaken) {
      return { success: false, message: "Số điện thoại này đã được đăng ký bởi một người dùng khác." };
    }

    const isIdentityTaken = await validateIdentityExists(payload.identityId);
    if (isIdentityTaken) {
      return { success: false, message: "Số CMND/CCCD này đã tồn tại trong hệ thống." };
    }

    // Tạo mật khẩu tạm ngẫu nhiên nếu không có (ví dụ: Qw3!sdf2)
    const tempPass = payload.password || Math.random().toString(36).slice(-8) + "A1@";

    // Đặt hạn chót 24h
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tempPasswordExpiresAt = expiresAt.toLocaleString("vi-VN");

    // 1. Tạo Auth account (profiles tự động được tạo qua Supabase trigger)
    const authData = await registerAccountService({
      email: payload.email,
      password: tempPass,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      isCoordinator: true,
      tempPass,
      tempPasswordExpiresAt,
    });

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error("Không thể trích xuất user.id sau khi đăng ký");
    }

    // 2. Gắn coordinator vào công ty (vẫn làm ở đây vì thuộc về Coordinator resource)
    await addCoordinatorToCompanyService(userId, payload.companyId);

    return { success: true, message: "Tạo tài khoản Điều phối viên thành công", userId };
  } catch (error: any) {
    console.error("[Coordinator Controller] Error creating coordinator:", error);
    const msg = ((error?.message || "") + " " + (error?.details || "")).toLowerCase();
    
    if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
      return { success: false, message: "Email này đã được sử dụng trên hệ thống." };
    }

    return {
      success: false,
      message: error?.message || error?.details || "Đã có lỗi xảy ra",
    };
  }
};
