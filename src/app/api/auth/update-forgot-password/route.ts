import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { password, confirmPassword } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu mới phải có ít nhất 8 ký tự.",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu xác nhận không khớp.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng thực hiện lại.",
        },
        { status: 401 },
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          message: updateError.message || "Cập nhật mật khẩu thất bại.",
        },
        { status: 400 },
      );
    }

    // Sign out to force user to log in with new password
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Cập nhật mật khẩu thành công!",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Đã xảy ra lỗi hệ thống.",
      },
      { status: 500 },
    );
  }
}
