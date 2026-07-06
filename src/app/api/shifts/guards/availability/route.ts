import { NextResponse } from "next/server";
import { handleGetGuardAvailability } from "@/features/shift/controller/shift.controller";

export const POST = async (request: Request) => {
  try {
    const response = await handleGetGuardAvailability(request);

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
    const message =
      error instanceof Error ? error.message : "Failed to get guard availability";

    return NextResponse.json(
      {
        message,
      },
      { status: 500 },
    );
  }
};