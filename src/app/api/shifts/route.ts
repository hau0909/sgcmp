import { NextResponse } from "next/server";
import { handleCreateWorkShift } from "@/features/shift/controller/shift.controller";

export async function POST(request: Request) {
  try {
    const response = await handleCreateWorkShift(request);

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
          error instanceof Error ? error.message : "Không thể tạo ca trực!",
      },
      {
        status: 500,
      },
    );
  }
}
