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

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { shiftId } = await params;

    let file: File | undefined;

    try {
      const formData = await request.formData();
      const imageFile = formData.get("image");
      if (imageFile instanceof File) {
        file = imageFile;
      }
    } catch {
      // Form data or file can be empty (e.g. auto absent updates or checkins without image)
    }

    const result = await handleCheckinGuardShift({
      shiftId,
      file,
    });

    const status = result.assignment.status;

    let message: string;
    if (status === "completed") {
      message = "Điểm danh ca trực thành công.";
    } else if (status === "late") {
      message = "Điểm danh trễ thành công. Ca trực vẫn được ghi nhận.";
    } else {
      message = "Đã quá thời gian điểm danh. Ca trực đã chuyển sang vắng mặt.";
    }

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
