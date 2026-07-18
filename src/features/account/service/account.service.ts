import type { Profile } from "@/types/Profile";
import {
  getAllAccounts,
  getAccountByUserId,
} from "../repository/account.repository";

export const getAllAccountsService = async (): Promise<Profile[]> => {
  const result = await getAllAccounts();
  return result;
};

export const getAccountByUserIdService = async (
  userId: string
): Promise<Profile | null> => {
  if (!userId) {
    throw new Error("User ID là bắt buộc.");
  }
  return await getAccountByUserId(userId);
};
