import { NextResponse } from "next/server";
import { handleCheckGuardQuota } from "@/features/guards/controller/guard.controller";

export const GET = async () => {
  try {
    const result = await handleCheckGuardQuota();
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("GET /api/guard/quota error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Lỗi kiểm tra giới hạn bảo vệ.",
      },
      {
        status: 500,
      },
    );
  }
};
