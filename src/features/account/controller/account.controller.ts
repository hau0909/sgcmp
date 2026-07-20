import type { Profile } from "@/types/Profile";
import {
  getAllAccountsService,
  getAccountByUserIdService,
  banAcountService,
} from "../service/account.service";
import {
  getUserProfileService,
  getCurrentUserProfileService,
} from "@/features/auth/service/auth.service";

export const handleGetAllAccounts = async (): Promise<Profile[]> => {
  const result = await getAllAccountsService();
  return result;
};

export const handleGetAccountByUserId = async (
  userId: string,
): Promise<Profile | null> => {
  const result = await getAccountByUserIdService(userId);
  return result;
};

export const handleBanAccount = async (userId: string) => {
  if (!userId) throw new Error("Không tìm thấy tài khoản");

  const user = await getCurrentUserProfileService();

  if (!user) {
    throw new Error("bạn chưa đăng nhập!");
  }

  if (user.role !== "admin") {
    return {
      success: false,
      status: 403,
      message: "Bạn không có quyền khóa tài khoản.",
    };
  }

  const targetUser = await getUserProfileService(userId);
  if (!targetUser) {
    return {
      success: false,
      status: 404,
      message: "Không tìm thấy tài khoản để khóa.",
    };
  }

  if (targetUser.role === "admin") {
    return {
      success: false,
      status: 403,
      message: "Không thể khóa tài khoản Admin.",
    };
  }

  if (targetUser.status === "banned") {
    return {
      success: false,
      status: 400,
      message: "Tài khoản này đã bị khóa rồi.",
    };
  }

  const account = await banAcountService(userId);

  return {
    success: true,
    status: 200,
    message: "Khóa tài khoản thành công.",
    data: account,
  };
};
