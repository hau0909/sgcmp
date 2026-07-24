import type { Profile } from "@/types/Profile";
import type { ReasonBan } from "@/types/ReasonBan";
import {
  getAllAccounts,
  getAccountByUserId,
  banAccount,
  getBanReasonByUserId,
} from "../repository/account.repository";

export const getAllAccountsService = async (): Promise<Profile[]> => {
  const result = await getAllAccounts();
  return result;
};

export const getAccountByUserIdService = async (
  userId: string,
): Promise<Profile | null> => {
  if (!userId) {
    throw new Error("User ID là bắt buộc.");
  }
  return await getAccountByUserId(userId);
};

export const banAcountService = async (
  userId: string,
  reason: string,
  bannedBy: string
) => {
  return banAccount(userId, reason, bannedBy);
};

export const getBanReasonByUserIdService = async (
  userId: string
): Promise<ReasonBan | null> => {
  if (!userId) return null;
  return getBanReasonByUserId(userId);
};

