import {
  insertGuardInformation,
  getCoordinatorCompanyId,
  getAllGuards,
  getCompanyByOwnerId,
  getGuardDetail,
} from "../repository/guard.repository";
import type {
  InsertGuardInformationRepositoryParams,
  UploadGuardAvatarRepositoryParams,
  GuardDetail,
  GuardDetailDatabase,
  GuardListPaginatedData,
  GetAllGuardsServiceParams,
} from "../type";
import type { Guard } from "@/types/Guard";
import {
  uploadGuardAvatar,
  getGuardIdByUserId,
  getGuardByUserId,
  getGuardsByIds,
} from "../repository/guard.repository";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const MAXIMUM_IMAGE_SIZE = 2 * 1024 * 1024;

export const insertGuardInformationService = async (
  input: InsertGuardInformationRepositoryParams,
) => {
  return insertGuardInformation(input);
};

export const getCoordinatorByCompanyIdService = async (user_id: string) => {
  return getCoordinatorCompanyId(user_id);
};

export const getAllGuardService = async ({
  company_id,
  page,
  limit,
  search,
}: GetAllGuardsServiceParams): Promise<GuardListPaginatedData> => {
  const { guards, total } = await getAllGuards({
    company_id,
    page,
    limit,
    search,
  });

  return {
    guards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const uploadGuardAvatarService = async ({
  user_id,
  file,
}: UploadGuardAvatarRepositoryParams) => {
  const normalizedUserId = user_id.trim();

  if (!normalizedUserId) {
    throw new Error("Không tìm thấy tài khoản bảo vệ.");
  }

  if (!(file instanceof File)) {
    throw new Error("Vui lòng chọn ảnh bảo vệ.");
  }

  if (file.size <= 0) {
    throw new Error("File ảnh không hợp lệ.");
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Ảnh chỉ hỗ trợ định dạng JPG hoặc PNG.");
  }

  if (file.size > MAXIMUM_IMAGE_SIZE) {
    throw new Error("Kích thước ảnh tối đa là 2MB.");
  }

  return uploadGuardAvatar({
    user_id: normalizedUserId,
    file,
  });
};

export const getCompanyByOwnerIdService = async (
  owner_id: string,
): Promise<string> => {
  return getCompanyByOwnerId(owner_id);
};

export const getGuardDetailService = async (
  guard_id: string,
  company_id: string,
): Promise<GuardDetailDatabase | null> => {
  return getGuardDetail(guard_id, company_id);
};

export const getGuardIdByUserIdService = async (
  userId: string,
): Promise<string | null> => {
  return getGuardIdByUserId(userId);
};

export const getGuardByUserIdService = async (
  userId: string,
): Promise<Guard | null> => {
  return await getGuardByUserId(userId);
};

export const getGuardsByIdsService = async (
  guardIds: string[],
): Promise<Guard[]> => {
  return await getGuardsByIds(guardIds);
};
