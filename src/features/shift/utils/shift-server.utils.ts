import { getUser } from "@/features/auth/service/auth.service";
import { handleGetUserProfile } from "@/features/auth/controller/auth.controller";
import { getGuardIdByUserIdService } from "@/features/guards/service/guard.service";
import { isValidDateKey } from "@/utils/calcDate";

export const resolveGuardIdForShift = async () => {
  const user = await getUser();

  if (!user) {
    return {
      response: Response.json(
        {
          message: "Người dùng chưa đăng nhập",
        },
        {
          status: 401,
        },
      ),
    };
  }

  const profileResponse = await handleGetUserProfile(user.id);
  const profile = profileResponse.data;

  if (!profile) {
    return {
      response: Response.json(
        {
          message: "Không tìm thấy thông tin người dùng",
        },
        {
          status: 404,
        },
      ),
    };
  }

  if (profile.role !== "guard") {
    return {
      response: Response.json(
        {
          message: "Bạn không có quyền xem lịch trực của bảo vệ",
        },
        {
          status: 403,
        },
      ),
    };
  }

  if (profile.status !== "active") {
    return {
      response: Response.json(
        {
          message: "Tài khoản của bạn chưa được kích hoạt",
        },
        {
          status: 403,
        },
      ),
    };
  }

  const guardId = await getGuardIdByUserIdService(profile.id);

  if (!guardId) {
    return {
      response: Response.json(
        {
          message: "Không tìm thấy thông tin bảo vệ",
        },
        {
          status: 404,
        },
      ),
    };
  }

  return {
    guardId,
  };
};

export const getGuardShiftQueryParams = (request: Request) => {
  const { searchParams } = new URL(request.url);

  const date = searchParams.get("date");

  if (!date || !isValidDateKey(date)) {
    throw new Error("Ngày xem ca trực không hợp lệ");
  }

  return {
    date,
  };
};
