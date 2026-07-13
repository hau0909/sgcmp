import { handleGetReplacementGuards } from "@/features/shift/controller/shift.controller";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    shiftId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { shiftId } = await params;
    return await handleGetReplacementGuards(request, { params: { shiftId } });
  } catch (error: any) {
    console.error("[GET /api/shifts/[shiftId]/replacement-guards] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Đã xảy ra lỗi hệ thống khi lấy danh sách bảo vệ thay thế.",
      },
      {
        status: 500,
      }
    );
  }
}
