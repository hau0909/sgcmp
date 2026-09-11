import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleGetBanReasonByUserId } from "@/features/account/controller/account.controller";

export const GET = async () => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, data: null, message: "Người dùng chưa đăng nhập" },
        { status: 401 },
      );
    }

    const result = await handleGetBanReasonByUserId(user.id);

    return NextResponse.json(result, { status: result.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Lấy lý do khóa thất bại";
    return NextResponse.json(
      { success: false, data: null, message },
      { status: 500 },
    );
  }
};
