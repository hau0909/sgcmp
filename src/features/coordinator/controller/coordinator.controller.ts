import {
  getCoordinatorsService,
  addCoordinatorToCompanyService,
  getCoordinatorDetailService,
  updateCoordinatorService,
} from "../service/coordinator.service";
import { checkCompanySubscriptionService, getPlanByIdService } from "@/features/subscription/service/subscription.service";
import { registerAccountService } from "@/features/auth/service/auth.service";
import {
  validateEmail,
  validateFullName,
  validatePhoneNumber,
  checkPhoneNumberExists,
  checkEmailExists,
} from "@/features/auth/validator/auth.validator";
import { validateIdentityExists } from "@/features/identity/validator/identity.validator";
import {
  validateIdentityNumber,
  validateCoordinatorAge,
  validateIdentityIssueDate,
  validateIdentityIssuePlace,
} from "../validator/coordinator.validator";
import { CoordinatorWithUser, CreateCoordinatorPayload, UpdateCoordinatorPayload } from "../types";

export const handleGetCoordinators = async (
  companyId: string,
  page = 1,
  limit = 10,
  search?: string
): Promise<{ data: CoordinatorWithUser[]; total: number }> => {
  const subCheck = await checkCompanySubscriptionService(companyId);
  if (!subCheck.isActive) {
    throw new Error("Tài khoản doanh nghiệp chưa đăng ký gói dịch vụ hoặc gói đã hết hạn.");
  }
  return await getCoordinatorsService(companyId, page, limit, search);
};

export const handleCreateCoordinator = async (
  payload: CreateCoordinatorPayload,
): Promise<{ success: boolean; message: string; userId?: string }> => {
  // ── Validate cơ bản (auth) ──────────────────────────────────────────────────
  const emailError = validateEmail(payload.email);
  if (emailError) return { success: false, message: emailError };

  const fullNameError = validateFullName(payload.fullName);
  if (fullNameError) return { success: false, message: fullNameError };

  const phoneError = validatePhoneNumber(payload.phoneNumber);
  if (phoneError) return { success: false, message: phoneError };

  if (!payload.companyId) {
    return { success: false, message: "Company ID là bắt buộc" };
  }

  // ── Validate định danh ──────────────────────────────────────────────────────
  const idNumberError = validateIdentityNumber(payload.identityId);
  if (idNumberError) return { success: false, message: idNumberError };

  const issueDateError = validateIdentityIssueDate(
    payload.issueDate,
    payload.dateOfBirth ?? ""
  );
  if (issueDateError) return { success: false, message: issueDateError };

  const issuePlaceError = validateIdentityIssuePlace(payload.issuePlace);
  if (issuePlaceError) return { success: false, message: issuePlaceError };

  // ── Validate tuổi ───────────────────────────────────────────────────────────
  if (payload.dateOfBirth) {
    const ageError = validateCoordinatorAge(payload.dateOfBirth);
    if (ageError) return { success: false, message: ageError };
  }

  // ── Kiểm tra subscription và giới hạn ──────────────────────────────────────
  const subCheck = await checkCompanySubscriptionService(payload.companyId);
  if (!subCheck.isActive) {
    return {
      success: false,
      message: "Tài khoản doanh nghiệp chưa đăng ký gói dịch vụ hoặc gói đã hết hạn.",
    };
  }

  if (subCheck.subscription?.plan_id) {
    const plan = await getPlanByIdService(subCheck.subscription.plan_id);
    if (plan && plan.max_coordinators !== null) {
      const currentCoordinators = await getCoordinatorsService(payload.companyId, 1, 1);
      if (currentCoordinators.total >= plan.max_coordinators) {
        return {
          success: false,
          message: `Gói dịch vụ hiện tại (Tối đa ${plan.max_coordinators} Điều phối viên) đã đạt giới hạn. Vui lòng nâng cấp gói để tạo thêm.`,
        };
      }
    }
  }

  try {
    // ── Kiểm tra trùng lặp (Asynchronous) theo thứ tự: Email -> SĐT -> CCCD ───
    const isEmailTaken = await checkEmailExists(payload.email);
    if (isEmailTaken) {
      return {
        success: false,
        message: "Email này đã được sử dụng trên hệ thống.",
      };
    }

    const isPhoneTaken = await checkPhoneNumberExists(payload.phoneNumber);
    if (isPhoneTaken) {
      return {
        success: false,
        message: "Số điện thoại này đã được sử dụng.",
      };
    }

    const isIdentityTaken = await validateIdentityExists(payload.identityId);
    if (isIdentityTaken) {
      return {
        success: false,
        message: "Số CMND/CCCD này đã được sử dụng.",
      };
    }

    // Tạo mật khẩu tạm ngẫu nhiên nếu không có (ví dụ: Qw3!sdf2)
    const tempPass =
      payload.password || Math.random().toString(36).slice(-8) + "A1@";

    // Đặt hạn chót 24h
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tempPasswordExpiresAt = expiresAt.toLocaleString("vi-VN");

    // 1. Tạo Auth account (profiles tự động được tạo qua Supabase trigger)
    const authData = await registerAccountService({
      email: payload.email,
      password: tempPass,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      role: "Coordinator",
      tempPass,
      tempPasswordExpiresAt,
    });

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error("Không thể trích xuất user.id sau khi đăng ký");
    }

    // Kiểm tra giả mạo từ Supabase (bảo mật email enumeration)
    if (authData.user?.identities && authData.user.identities.length === 0) {
      throw new Error("Email này đã được sử dụng trên hệ thống.");
    }

    // 2. Gắn coordinator vào công ty (vẫn làm ở đây vì thuộc về Coordinator resource)
    await addCoordinatorToCompanyService(userId, payload.companyId);

    return {
      success: true,
      message: "Tạo tài khoản Điều phối viên thành công",
      userId,
    };
  } catch (error: any) {
    console.error(
      "[Coordinator Controller] Error creating coordinator:",
      error,
    );
    const msg = (
      (error?.message || "") +
      " " +
      (error?.details || "")
    ).toLowerCase();

    if (
      msg.includes("already registered") ||
      msg.includes("already exists") ||
      msg.includes("user already")
    ) {
      return {
        success: false,
        message: "Email này đã được sử dụng trên hệ thống.",
      };
    }

    return {
      success: false,
      message: error?.message || error?.details || "Đã có lỗi xảy ra",
    };
  }
};

export const handleGetCoordinatorDetail = async (coordinatorId: string) => {
  return await getCoordinatorDetailService(coordinatorId);
};

export const handleUpdateCoordinator = async (
  coordinatorId: string,
  payload: UpdateCoordinatorPayload
): Promise<{ success: boolean; message: string; field?: string }> => {
  // ── Validate cơ bản ────────────────────────────────────────────────────────
  const fullNameError = validateFullName(payload.fullName);
  if (fullNameError) return { success: false, message: fullNameError, field: "fullName" };

  const phoneError = validatePhoneNumber(payload.phoneNumber);
  if (phoneError) return { success: false, message: phoneError, field: "phoneNumber" };

  // ── Validate định danh ──────────────────────────────────────────────────────
  const idNumberError = validateIdentityNumber(payload.identityId);
  if (idNumberError) return { success: false, message: idNumberError, field: "identityId" };

  const issueDateError = validateIdentityIssueDate(
    payload.issueDate,
    payload.dateOfBirth ?? ""
  );
  if (issueDateError) return { success: false, message: issueDateError, field: "issueDate" };

  const issuePlaceError = validateIdentityIssuePlace(payload.issuePlace);
  if (issuePlaceError) return { success: false, message: issuePlaceError, field: "issuePlace" };

  // ── Validate tuổi ───────────────────────────────────────────────────────────
  if (payload.dateOfBirth) {
    const ageError = validateCoordinatorAge(payload.dateOfBirth);
    if (ageError) return { success: false, message: ageError, field: "dateOfBirth" };
  }

  try {
    // Retrieve the coordinator to get the associated user_id
    const coordinator = await getCoordinatorDetailService(coordinatorId);
    if (!coordinator) {
      return { success: false, message: "Coordinator không tồn tại" };
    }
    const userId = coordinator.user_id;

    // Duplicate check for phone and identity by confirming deviation from current profiles
    if (payload.phoneNumber !== coordinator.profiles?.phone_number) {
      const phoneExists = await checkPhoneNumberExists(payload.phoneNumber);
      if (phoneExists) {
        return { success: false, message: "Số điện thoại đã tồn tại trong hệ thống", field: "phoneNumber" };
      }
    }

    if (payload.identityId !== coordinator.identity?.identity_id) {
      const identityExists = await validateIdentityExists(payload.identityId);
      if (identityExists) {
        return { success: false, message: "Số CCCD/CMND đã tồn tại trong hệ thống", field: "identityId" };
      }
    }
    
    // Call service to update
    await updateCoordinatorService(userId, payload);

    return {
      success: true,
      message: "Cập nhật thông tin Điều phối viên thành công",
    };
  } catch (error: any) {
    console.error(
      "[Coordinator Controller] Error updating coordinator:",
      error,
    );
    return {
      success: false,
      message: error?.message || "Đã có lỗi xảy ra khi cập nhật",
    };
  }
};
