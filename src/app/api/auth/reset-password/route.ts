import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { currentPassword, password, confirmPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập mật khẩu hiện tại.",
        },
        { status: 400 },
      );
    }

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
          message: "Phiên làm việc đã hết hạn hoặc chưa đăng nhập.",
        },
        { status: 401 },
      );
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu hiện tại không chính xác.",
        },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          message: updateError.message || "Đặt lại mật khẩu thất bại.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đặt lại mật khẩu thành công!",
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
