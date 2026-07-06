import { createIdentityService } from "../service/identity.service";

export const handleCreateIdentity = async (
  userId: string,
  identityId: string,
  issueDate: string,
  issuePlace: string,
  frontUrl?: string,
  backUrl?: string,
): Promise<{ success: boolean; message: string }> => {
  if (!userId || !identityId || !issueDate || !issuePlace) {
    return { success: false, message: "Vui lòng nhập đầy đủ thông tin định danh" };
  }

  try {
    await createIdentityService(userId, identityId, issueDate, issuePlace, frontUrl, backUrl);
    return { success: true, message: "Khai báo định danh thành công" };
  } catch (error: any) {
    console.error("[Identity Controller] Lỗi tạo identity:", error);
    const msg = ((error?.message || "") + " " + (error?.details || "")).toLowerCase();

    if (msg.includes("duplicate key") && (msg.includes("identity_id") || msg.includes("identities"))) {
      return { success: false, message: "Số CMND/CCCD này đã tồn tại trong hệ thống." };
    }

    return { success: false, message: error?.message || "Lỗi khai báo định danh" };
  }
};
