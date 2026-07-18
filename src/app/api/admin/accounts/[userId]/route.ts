import { handleGetAccountByUserId } from "@/features/account/controller/account.controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetAccountByUserId(userId);

    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản" },
        { status: 404 }
      );
    }

    return NextResponse.json({ account: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/accounts/:userId] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
