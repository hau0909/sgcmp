import { NextResponse } from "next/server";
import { handleGetAllShiftsByWeek } from "@/features/shift/controller/shift.controller";

export async function GET(request: Request) {
  try {
    const response = await handleGetAllShiftsByWeek(request);

    if (!response) {
      return NextResponse.json(
        {
          message: "Không nhận được phản hồi từ controller",
        },
        {
          status: 500,
        },
      );
    }

    const body = await response.json();

    return NextResponse.json(body, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lấy danh sách ca trực theo tuần thất bại",
      },
      {
        status: 500,
      },
    );
  }
}
