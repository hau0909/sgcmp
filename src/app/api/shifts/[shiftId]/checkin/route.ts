import { NextResponse } from "next/server";
import {
  handleCheckinGuardShift,
  ShiftApiError,
} from "@/features/shift/controller/shift.controller";

type RouteParams = {
  params: Promise<{
    shiftId: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const { shiftId } = await params;

    const result = await handleCheckinGuardShift({
      shiftId,
    });

    const status = result.assignment.status;

    const message =
      status === "completed"
        ? "Điểm danh ca trực thành công."
        : "Đã quá thời gian điểm danh. Ca trực đã chuyển sang vắng mặt.";

    return NextResponse.json(
      {
        message,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/shifts/[shiftId]/checkin] Error:", error);

    if (error instanceof ShiftApiError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        message: "Điểm danh ca trực thất bại.",
      },
      { status: 500 },
    );
  }
}
