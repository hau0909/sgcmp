import { updateProfile } from "../repository/profile.repository";

export const updateProfileService = async (
  userId: string,
  payload: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
  }
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID là bắt buộc khi cập nhật Profile.");
  }
  
  await updateProfile(userId, payload);
};
