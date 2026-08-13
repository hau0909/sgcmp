import { NextResponse } from "next/server";
import { handleGetGuardMyProfile } from "@/features/guards/controller/guard.controller";

export const GET = async () => {
  try {
    const result = await handleGetGuardMyProfile();

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("GET /api/guard/my-profile ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy thông tin hồ sơ bảo vệ.",
      },
      {
        status: 500,
      },
    );
  }
};
