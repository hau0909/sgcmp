import { NextResponse } from "next/server";
import { handleGetGuardPerformanceList } from "@/features/guards/controller/guard.controller";

export async function GET(request: Request) {
  try {
    const result = await handleGetGuardPerformanceList(request);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: unknown) {
    console.error("GET /api/company/guard-performance/list ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Lỗi hệ thống khi lấy danh sách bảo vệ theo hiệu suất.",
      },
      {
        status: 500,
      }
    );
  }
}
