import { NextRequest, NextResponse } from "next/server";
import {
  handleGetCompanyPublishRequestById,
  handleUpdateCompanyPublishRequestStatus,
} from "@/features/company/controller/company.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "Mã yêu cầu là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetCompanyPublishRequestById(requestId);

    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu phát hành" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/admin/publish-requests/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        { error: "Mã yêu cầu là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || (status !== "APPROVED" && status !== "REJECTED")) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ (chỉ chấp nhận APPROVED hoặc REJECTED)" },
        { status: 400 }
      );
    }

    await handleUpdateCompanyPublishRequestStatus(requestId, status);

    return NextResponse.json(
      { success: true, message: "Cập nhật trạng thái yêu cầu phát hành thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PUT /api/admin/publish-requests/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
