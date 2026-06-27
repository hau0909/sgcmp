import { NextResponse } from "next/server";
import { handleLoginAccount } from "@/features/auth/controller/auth.controller";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { email, password } = body;

    const result = await handleLoginAccount({ email, password });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Đăng nhập thất bại";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
};
