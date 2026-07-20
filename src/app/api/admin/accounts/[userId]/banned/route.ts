import { handleBanAccount } from "@/features/account/controller/account.controller";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;

    const result = await handleBanAccount(userId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || "Khóa tài khoản thành công.",
        account: result.data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[PATCH /api/admin/accounts/[userId]/banned] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
