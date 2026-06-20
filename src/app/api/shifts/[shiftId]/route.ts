import {
  handleGetGuardShiftDetail,
  ShiftApiError,
} from "@/features/shift/controller/shift.controller";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    shiftId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { shiftId } = await params;

    const result = await handleGetGuardShiftDetail({
      shiftId,
    });

    return NextResponse.json(
      {
        message: "Lấy chi tiết ca trực thành công",
        data: {
          shift: result,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[GET /api/guard-shifts/[shiftId]] Error:", error);

    if (error instanceof ShiftApiError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: error.statusCode,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Lấy chi tiết ca trực thất bại",
      },
      {
        status: 500,
      },
    );
  }
}