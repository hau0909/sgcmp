import { NextResponse } from "next/server";
import { handleLoginAccount } from "@/features/auth/controller/auth.controller";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { email, password } = body;

    const result = await handleLoginAccount({ email, password });

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Đăng nhập thất bại",
      },
      { status: 500 },
    );
  }
};
