import { NextResponse } from "next/server";
import { handleApproveRejectGuard } from "@/features/guards/controller/guard.controller";
import type { ApproveGuardInput } from "@/features/guards/type";

export const POST = async (
  request: Request,
  context: { params: Promise<{ guardId: string }> },
) => {
  try {
    const { guardId } = await context.params;
    const body = (await request.json()) as ApproveGuardInput;

    const result = await handleApproveRejectGuard(guardId, body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("POST /api/guard/[guardId]/approval ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể duyệt/từ chối hồ sơ bảo vệ.",
      },
      {
        status: 500,
      },
    );
  }
};
