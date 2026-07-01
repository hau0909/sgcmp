import { NextResponse } from "next/server";
import { handleActivateProfile } from "@/features/profile/controller/profile.controller";

export const POST = async () => {
  try {
    const result = await handleActivateProfile();

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error("[API /auth/activate] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Kích hoạt tài khoản thất bại",
      },
      { status: 500 },
    );
  }
};
