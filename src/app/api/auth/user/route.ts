import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleGetUserProfile } from "@/features/auth/controller/auth.controller";

export const GET = async () => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Người dùng chưa đăng nhập",
          data: null,
        },
        { status: 401 },
      );
    }

    const result = await handleGetUserProfile(user.id);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lấy hồ sơ người dùng thất bại",
        data: null,
      },
      { status: 500 },
    );
  }
};
