import { NextResponse } from "next/server";
import { handleGetAverageRatingByCompanyId } from "@/features/review/controller/review.controller";
import { ReviewApiError } from "@/features/review/types";

type RouteParams = {
  params: Promise<{
    companyId: string;
  }>;
};

const getErrorResponse = (error: unknown) => {
  if (error instanceof ReviewApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode },
    );
  }

  console.error("Get Average Rating By Company Error:", error);

  return NextResponse.json(
    { message: "Đã xảy ra lỗi khi lấy điểm đánh giá trung bình." },
    { status: 500 },
  );
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { companyId } = await params;

    const result = await handleGetAverageRatingByCompanyId(companyId);

    return NextResponse.json(
      {
        message: "Lấy điểm đánh giá trung bình thành công.",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    return getErrorResponse(error);
  }
}
