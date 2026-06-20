import { NextResponse } from "next/server";
import { handleLogout } from "@/features/auth/controller/auth.controller";

export async function POST() {
  try {
    const result = await handleLogout();

    return NextResponse.json(
      {
        message: result.message,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/auth/logout] Error:", error);

    return NextResponse.json(
      {
        message: "Đăng xuất thất bại.",
      },
      { status: 500 },
    );
  }
}
