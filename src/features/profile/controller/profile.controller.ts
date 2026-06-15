import { updateProfileService } from "../service/profile.service";

export const handleUpdateProfile = async (
  userId: string,
  payload: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
  }
): Promise<{ success: boolean; message: string }> => {
  if (!userId) {
    return { success: false, message: "User ID là bắt buộc" };
  }

  try {
    await updateProfileService(userId, payload);
    return { success: true, message: "Cập nhật Profile thành công" };
  } catch (error: any) {
    console.error("[Profile Controller] Lỗi cập nhật profile:", error);
    const msg = ((error?.message || "") + " " + (error?.details || "")).toLowerCase();
    
    if (msg.includes("duplicate key") && msg.includes("phone_number")) {
      return { success: false, message: "Số điện thoại này đã được đăng ký bởi ai đó." };
    }

    return { success: false, message: error?.message || "Lỗi cập nhật Profile" };
  }
};
