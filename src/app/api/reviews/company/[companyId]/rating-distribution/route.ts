import { NextResponse } from "next/server";
import { handleGetRatingDistributionByCompanyId } from "@/features/review/controller/review.controller";
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

  console.error("Get Rating Distribution By Company Error:", error);

  return NextResponse.json(
    { message: "Đã xảy ra lỗi khi lấy phân bố đánh giá." },
    { status: 500 },
  );
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { companyId } = await params;

    const result = await handleGetRatingDistributionByCompanyId(companyId);

    return NextResponse.json(
      {
        message: "Lấy phân bố đánh giá thành công.",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    return getErrorResponse(error);
  }
}
