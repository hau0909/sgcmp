import { createIdentity } from "../repository/identity.repository";

export const createIdentityService = async (
  userId: string,
  identityId: string,
  issueDate: string,
  issuePlace: string
): Promise<void> => {
  if (!userId) throw new Error("User ID là bắt buộc để tạo thông tin định danh");
  if (!issueDate || !issuePlace) {
    throw new Error("Vui lòng nhập đầy đủ ngày và nơi cấp của CMND/CCCD");
  }

  await createIdentity(userId, identityId, issueDate, issuePlace);
};
