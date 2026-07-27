import { NextResponse } from "next/server";
import { handleGetGuardPerformanceSummary } from "@/features/guards/controller/guard.controller";

export async function GET(request: Request) {
  try {
    const result = await handleGetGuardPerformanceSummary(request);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: unknown) {
    console.error("GET /api/company/guard-performance/summary ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi lấy thông số hiệu suất bảo vệ.",
      },
      {
        status: 500,
      }
    );
  }
}
