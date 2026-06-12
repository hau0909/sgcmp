import { insertGuardInformation } from "../repository/guard.repository";
import type {
  InsertGuardInformationRepositoryParams,
  UploadGuardAvatarRepositoryParams,
} from "../type";
import { uploadGuardAvatar } from "../repository/guard.repository";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const MAXIMUM_IMAGE_SIZE = 2 * 1024 * 1024;

export const insertGuardInformationService = async (
  input: InsertGuardInformationRepositoryParams,
) => {
  return insertGuardInformation(input);
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
