import type { Profile } from "@/types/Profile";

import {
  updateProfile,
  getProfileByUserId,
  getProfilesByUserIds,
} from "../repository/profile.repository";

export const updateProfileService = async (
  userId: string,
  payload: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    avatarUrl?: string;
  }
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID là bắt buộc khi cập nhật Profile.");
  }
  
  await updateProfile(userId, payload);
};

export const getProfileByUserIdService = async (
  userId: string,
): Promise<Profile | null> => {
  return await getProfileByUserId(userId);
};

export const getProfilesByUserIdsService = async (
  userIds: string[],
): Promise<Profile[]> => {
  return await getProfilesByUserIds(userIds);
};