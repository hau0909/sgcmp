import { handleGetLatestShiftDate } from "@/features/shift/controller/shift.controller";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    contractId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { contractId } = await params;
    const response = await handleGetLatestShiftDate(contractId);

    if (!response) {
      return NextResponse.json(
        {
          message: "Không nhận được phản hồi từ controller",
        },
        { status: 500 }
      );
    }

    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lấy ngày ca trực cuối cùng thất bại",
      },
      { status: 500 }
    );
  }
}
