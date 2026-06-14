import { NextResponse } from "next/server";
import { handleGetGuardDetail } from "@/features/guards/controller/guard.controller";
import { RouteContext } from "@/features/guards/type";

export const GET = async (_request: Request, context: RouteContext) => {
  try {
    const { guardId } = await context.params;

    const result = await handleGetGuardDetail(guardId);

    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Đã xảy ra lỗi hệ thống",
        data: null,
      },
      {
        status: 500,
      },
    );
  }
};
