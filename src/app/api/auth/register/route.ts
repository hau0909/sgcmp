import { NextResponse } from "next/server";
import { handleRegisterAccount } from "@/features/auth/controller/auth.controller";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đăng ký thất bại";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
};
