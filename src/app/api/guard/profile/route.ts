import { NextResponse } from "next/server";
import { handleCompleteGuardProfile } from "@/features/guards/controller/guard.controller";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    const result = await handleCompleteGuardProfile(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("POST /api/guard/profile ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể hoàn thiện hồ sơ bảo vệ.",
      },
      {
        status: 500,
      },
    );
  }
};
