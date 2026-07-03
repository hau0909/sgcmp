import {
  createIdentity,
  getIdentityByUserId,
} from "../repository/identity.repository";
import { IdentityDetail } from "../type";

export const createIdentityService = async (
  userId: string,
  identityId: string,
  issueDate: string,
  issuePlace: string,
  frontUrl?: string,
  backUrl?: string,
): Promise<void> => {
  if (!userId)
    throw new Error("User ID là bắt buộc để tạo thông tin định danh");
  if (!issueDate || !issuePlace) {
    throw new Error("Vui lòng nhập đầy đủ ngày và nơi cấp của CMND/CCCD");
  }

  await createIdentity(userId, identityId, issueDate, issuePlace, frontUrl, backUrl);
};

export const getIdentityByUserIdService = async (
  user_id: string,
): Promise<IdentityDetail | null> => {
  return getIdentityByUserId(user_id);
};
