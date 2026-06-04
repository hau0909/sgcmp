import { NextResponse } from "next/server";
import { handleRegisterAccount } from "@/features/auth/controller/auth.controller";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { email, password, confirmPassword, phoneNumber, fullName } = body;

    const result = await handleRegisterAccount({
      email,
      password,
      confirmPassword,
      phoneNumber,
      fullName,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Đăng ký thất bại",
      },
      { status: 500 },
    );
  }
};
