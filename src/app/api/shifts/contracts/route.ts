import { NextResponse } from "next/server";
import { handleGetShiftContracts } from "@/features/shift/controller/shift.controller";

export async function GET() {
  try {
    const response = await handleGetShiftContracts();

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
            : "Lấy danh sách hợp đồng tạo ca trực thất bại",
      },
      {
        status: 500,
      },
    );
  }
}
