import {
  updateProfileService,
  activateProfileService,
} from "../service/profile.service";
import { getCurrentUserProfileService } from "@/features/auth/service/auth.service";

export const handleActivateProfile = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const currentProfile = await getCurrentUserProfileService();

    if (!currentProfile) {
      return { success: false, message: "Người dùng chưa đăng nhập" };
    }

    await activateProfileService(currentProfile.user_id);
    return { success: true, message: "Kích hoạt tài khoản thành công" };
  } catch (error: any) {
    console.error("[Profile Controller] Lỗi kích hoạt profile:", error);
    return {
      success: false,
      message: error?.message || "Kích hoạt tài khoản thất bại",
    };
  }
};

export const handleUpdateProfile = async (
  userId: string,
  payload: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    avatarUrl?: string;
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
