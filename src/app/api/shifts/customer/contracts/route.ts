import { NextResponse } from "next/server";
import { connection } from "next/server";
import { handleGetCustomerShiftContracts } from "@/features/shift/controller/shift.controller";

export async function GET() {
  await connection();
  try {
    const response = await handleGetCustomerShiftContracts();

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
            : "Lấy danh sách hợp đồng thất bại",
      },
      { status: 500 },
    );
  }
}
