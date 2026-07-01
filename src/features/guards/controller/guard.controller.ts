import {
  getCurrentUserProfileService,
  registerAccountService,
} from "@/features/auth/service/auth.service";
import { createIdentityService } from "@/features/identity/service/identity.service";
import { validateIdentityExists } from "@/features/identity/validator/identity.validator";
import {
  insertGuardInformationService,
  uploadGuardAvatarService,
  getCoordinatorByCompanyIdService,
  getAllGuardService,
  getCompanyByOwnerIdService,
  getGuardDetailService,
} from "../service/guard.service";

import { getIdentityByUserIdService } from "@/features/identity/service/identity.service";

import {
  validateCreateGuardAccount,
  validateCreateGuardInput,
  checkGuardExistsByUserId,
  checkPhoneNumberExists,
  checkEmailExists,
} from "../validator/guard.validate";

import type {
  CreateGuardAccountBody,
  CreateGuardAccountInput,
  gender,
  InsertGuardInformationBody,
  InsertGuardInformationInput,
  HandleGetAllGuardsResult,
  GetGuardDetailResponse,
  GuardDetail,
  GuardListPaginatedData,
  HandleGetAllGuardsInput,
} from "../type";

const createEmptyGuardListData = (): GuardListPaginatedData => ({
  guards: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
});

const generateTemporaryPassword = (): string => {
  const random_number = Math.floor(10000000 + Math.random() * 90000000);

  return `Bv${random_number}`;
};

const checkCoordinatorPermission = async () => {
  const current_profile = await getCurrentUserProfileService();

  if (!current_profile) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  if (current_profile.role?.toLowerCase() !== "coordinator") {
    throw new Error("Bạn không có quyền thực hiện chức năng này.");
  }

  return current_profile;
};

export const handleCreateGuardAccount = async (
  body: CreateGuardAccountBody,
) => {
  try {
    await checkCoordinatorPermission();

    const input: CreateGuardAccountInput = {
      email: String(body.email ?? "")
        .trim()
        .toLowerCase(),

      full_name: String(body.full_name ?? "").trim(),

      phone_number: String(body.phone_number ?? "").trim(),

      identity_id: String(body.identity_id ?? "").trim(),
    };

    const validate_error = validateCreateGuardAccount(input);

    if (validate_error) {
      return {
        success: false,
        message: validate_error,
      };
    }

    const email_exists = await checkEmailExists(input.email);

    if (email_exists) {
      return {
        success: false,
        message: "Email này đã được đăng ký.",
      };
    }

    const identity_exists = await validateIdentityExists(input.identity_id);

    if (identity_exists) {
      return {
        success: false,
        message: "Số CCCD/CMND đã được sử dụng.",
      };
    }

    const phone_number_exists = await checkPhoneNumberExists(input.phone_number);

    if (phone_number_exists) {
      return {
        success: false,
        message: "Số điện thoại này đã được đăng ký!.",
      };
    }

    const temporary_password = generateTemporaryPassword();

    const register_data = await registerAccountService({
      email: input.email,
      password: temporary_password,

      // Giữ camelCase vì đây là input của auth service.
      fullName: input.full_name,
      phoneNumber: input.phone_number,

      role: "guard",
      tempPass: temporary_password,
    });

    const user_id = register_data.user?.id;

    if (!user_id) {
      return {
        success: false,
        message: "Không lấy được ID tài khoản bảo vệ.",
      };
    }

    return {
      success: true,
      message: "Tạo tài khoản bảo vệ thành công. Email xác thực đã được gửi.",
      data: {
        user_id,
        email: register_data.user?.email ?? input.email,
      },
    };
  } catch (error) {
    console.error("handleCreateGuardAccount error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Không thể tạo tài khoản bảo vệ.";

    const normalized_message = message.toLowerCase();

    if (
      normalized_message.includes("already registered") ||
      normalized_message.includes("already exists") ||
      normalized_message.includes("user already registered")
    ) {
      return {
        success: false,
        message: "Email này đã được đăng ký.",
      };
    }

    return {
      success: false,
      message,
    };
  }
};

export const handleUploadGuardAvatar = async (form_data: FormData) => {
  try {
    await checkCoordinatorPermission();

    const user_id = String(form_data.get("user_id") ?? "").trim();

    if (!user_id) {
      return {
        success: false,
        message: "Không tìm thấy ID tài khoản bảo vệ.",
      };
    }

    const avatar_entry = form_data.get("avatar_file");

    if (!(avatar_entry instanceof File) || avatar_entry.size <= 0) {
      return {
        success: false,
        message: "Vui lòng chọn ảnh bảo vệ.",
      };
    }

    const result = await uploadGuardAvatarService({
      user_id,
      file: avatar_entry,
    });

    return {
      success: true,
      message: "Tải ảnh bảo vệ thành công.",
      data: result,
    };
  } catch (error) {
    console.error("handleUploadGuardAvatar error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Không thể tải ảnh bảo vệ.",
    };
  }
};

export const handleInsertGuardInformation = async (
  body: InsertGuardInformationBody,
) => {
  try {
    const current_profile = await checkCoordinatorPermission();

    const company_id = await getCoordinatorByCompanyIdService(
      current_profile.user_id,
    );

    if (!company_id) {
      return {
        success: false,
        message: "Không tìm thấy công ty của Coordinator.",
      };
    }

    const input: InsertGuardInformationInput = {
      user_id: String(body.user_id ?? "").trim(),

      full_name: String(body.full_name ?? "").trim(),

      phone_number: String(body.phone_number ?? "").trim(),

      email: String(body.email ?? "")
        .trim()
        .toLowerCase(),

      date_of_birth: String(body.date_of_birth ?? "").trim(),

      gender: String(body.gender ?? "").trim() as gender,

      address: String(body.address ?? "").trim(),

      avatar_url:
        typeof body.avatar_url === "string"
          ? body.avatar_url.trim() || null
          : null,

      identity_id: String(body.identity_id ?? "").trim(),

      identity_issue_date: String(body.identity_issue_date ?? "").trim(),

      identity_issue_place: String(body.identity_issue_place ?? "").trim(),
    };

    const validate_error = validateCreateGuardInput(input);

    if (validate_error) {
      return {
        success: false,
        message: validate_error,
      };
    }

    const guard_exists = await checkGuardExistsByUserId(input.user_id);

    if (guard_exists) {
      throw new Error("Tài khoản này đã có thông tin bảo vệ.");
    }

    const identity_exists = await validateIdentityExists(input.identity_id);

    if (identity_exists) {
      throw new Error("Số CCCD/CMND đã được sử dụng.");
    }

    const result = await insertGuardInformationService({
      ...input,
      company_id,
    });

    await createIdentityService(
      input.user_id,
      input.identity_id,
      input.identity_issue_date,
      input.identity_issue_place,
    );

    return {
      success: true,
      message: "Thêm thông tin bảo vệ thành công.",
      data: result,
    };
  } catch (error) {
    console.error("handleInsertGuardInformation error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Không thể thêm thông tin bảo vệ.",
    };
  }
};

export const handleGetAllGuards = async ({
  page,
  limit,
  search,
}: HandleGetAllGuardsInput): Promise<HandleGetAllGuardsResult> => {
  try {
    const profile = await getCurrentUserProfileService();

    if (!profile) {
      return {
        success: false,
        message: "Bạn chưa đăng nhập",
        data: createEmptyGuardListData(),
      };
    }

    const normalizedRole = profile.role?.trim().toLowerCase();

    let company_id = "";

    if (normalizedRole === "company-admin") {
      const companyIdResult = await getCompanyByOwnerIdService(profile.user_id);

      if (!companyIdResult) {
        return {
          success: false,
          message: "Không tìm thấy công ty của tài khoản",
          data: createEmptyGuardListData(),
        };
      }

      company_id = companyIdResult;
    } else if (normalizedRole === "coordinator") {
      const coordinatorCompanyId = await getCoordinatorByCompanyIdService(
        profile.user_id,
      );

      if (!coordinatorCompanyId) {
        return {
          success: false,
          message: "Điều phối viên chưa được liên kết với công ty",
          data: createEmptyGuardListData(),
        };
      }

      company_id = coordinatorCompanyId;
    } else {
      return {
        success: false,
        message: "Bạn không có quyền xem danh sách bảo vệ",
        data: createEmptyGuardListData(),
      };
    }

    const pageNumber = Number(page ?? "1");
    const limitNumber = Number(limit ?? "10");

    const validPage =
      Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;

    const validLimit =
      Number.isInteger(limitNumber) && limitNumber > 0 && limitNumber <= 50
        ? limitNumber
        : 10;

    const keyword = search?.trim() ?? "";

    const data = await getAllGuardService({
      company_id,
      page: validPage,
      limit: validLimit,
      search: keyword,
    });

    return {
      success: true,
      message: "Lấy danh sách bảo vệ thành công",
      data,
    };
  } catch (error: unknown) {
    console.error("handleGetAllGuards error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Lấy danh sách bảo vệ thất bại",
      data: createEmptyGuardListData(),
    };
  }
};

export const handleGetGuardDetail = async (
  guard_id: string,
): Promise<GetGuardDetailResponse> => {
  try {
    if (!guard_id.trim()) {
      return {
        success: false,
        message: "Không tìm thấy mã bảo vệ",
        data: null,
      };
    }

    const profile = await getCurrentUserProfileService();

    if (!profile) {
      return {
        success: false,
        message: "Bạn chưa đăng nhập",
        data: null,
      };
    }

    let companyId: string;

    if (profile.role === "company-admin") {
      const companyIdResult = await getCompanyByOwnerIdService(profile.user_id);

      if (!companyIdResult) {
        return {
          success: false,
          message: "Không tìm thấy công ty của tài khoản",
          data: null,
        };
      }

      companyId = companyIdResult;
    } else if (profile.role === "Coordinator") {
      const coordinatorCompanyId = await getCoordinatorByCompanyIdService(
        profile.user_id,
      );

      if (!coordinatorCompanyId) {
        return {
          success: false,
          message: "Điều phối viên chưa được liên kết với công ty",
          data: null,
        };
      }

      companyId = coordinatorCompanyId;
    } else {
      return {
        success: false,
        message: "Bạn không có quyền xem thông tin bảo vệ",
        data: null,
      };
    }

    const guard = await getGuardDetailService(guard_id, companyId);

    if (!guard) {
      return {
        success: false,
        message: "Không tìm thấy hồ sơ bảo vệ",
        data: null,
      };
    }

    const identity = await getIdentityByUserIdService(guard.user_id);

    const guardDetail: GuardDetail = {
      ...guard,
      identity,
    };

    return {
      success: true,
      message: "Lấy thông tin bảo vệ thành công",
      data: guardDetail,
    };
  } catch (error: unknown) {
    console.error("handleGetGuardDetail error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Không thể lấy thông tin bảo vệ",
      data: null,
    };
  }
};
