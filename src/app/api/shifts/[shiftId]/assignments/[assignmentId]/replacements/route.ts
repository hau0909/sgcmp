import { handleUpdateReplacementGuards } from "@/features/shift/controller/shift.controller";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    shiftId: string;
    assignmentId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { shiftId, assignmentId } = await params;
    return await handleUpdateReplacementGuards(request, {
      params: { shiftId, assignmentId },
    });
  } catch (error: any) {
    console.error(
      "[PATCH /api/shifts/[shiftId]/assignments/[assignmentId]/replacements] Error:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Đã xảy ra lỗi hệ thống khi cập nhật bảo vệ thay thế.",
      },
      {
        status: 500,
      }
    );
  }
}
