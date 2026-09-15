import { NextResponse } from "next/server";
import { connection } from "next/server";
import { handleGetCustomerTodayShifts } from "@/features/shift/controller/shift.controller";

export async function GET(request: Request) {
  await connection();
  try {
    const response = await handleGetCustomerTodayShifts(request);

    if (!response) {
      return NextResponse.json(
        { message: "Không nhận được phản hồi từ controller" },
        { status: 500 },
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
            : "Lấy danh sách ca trực hôm nay thất bại",
      },
      { status: 500 },
    );
  }
}
