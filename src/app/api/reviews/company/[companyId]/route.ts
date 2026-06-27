import { NextRequest, NextResponse } from "next/server";
import { handleGetAllReviewByCompanyId } from "@/features/review/controller/review.controller";
import { ReviewApiError } from "@/features/review/types";

const REVIEW_PAGE_SIZE = 10;

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

  console.error("Get All Reviews By Company Error:", error);

  return NextResponse.json(
    { message: "Đã xảy ra lỗi khi lấy danh sách đánh giá." },
    { status: 500 },
  );
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { companyId } = await params;

    const pageParam = request.nextUrl.searchParams.get("page") ?? "1";
    const page = Number(pageParam);

    const result = await handleGetAllReviewByCompanyId({
      company_id: companyId,
      page,
      page_size: REVIEW_PAGE_SIZE,
    });

    return NextResponse.json(
      {
        message: "Lấy danh sách đánh giá thành công.",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    return getErrorResponse(error);
  }
}
