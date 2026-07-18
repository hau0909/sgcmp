import type { Profile } from "@/types/Profile";
import {
  getAllAccountsService,
  getAccountByUserIdService,
} from "../service/account.service";

export const handleGetAllAccounts = async (): Promise<Profile[]> => {
  const result = await getAllAccountsService();
  return result;
};

export const handleGetAccountByUserId = async (
  userId: string
): Promise<Profile | null> => {
  const result = await getAccountByUserIdService(userId);
  return result;
};
