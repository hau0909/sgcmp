import { NextResponse } from "next/server";
import { handleGetGuardAvailability } from "@/features/shift/controller/shift.controller";

export const POST = async (request: Request) => {
  try {
    const result = await handleGetGuardAvailability(request);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get guard availability";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
};