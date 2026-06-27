import { NextRequest, NextResponse } from "next/server";
import {
  handleGetRegistrationDetail,
  handleUpdateRegistrationStatus,
} from "@/features/registration/controller/registration.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hồ sơ đăng ký là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetRegistrationDetail(id);
    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy hồ sơ đăng ký" },
        { status: 404 }
      );
    }

    return NextResponse.json({ registration: result }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/registrations/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hồ sơ đăng ký là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json(
        { error: "Trạng thái không hợp lệ (chỉ chấp nhận approved hoặc rejected)" },
        { status: 400 }
      );
    }

    await handleUpdateRegistrationStatus(id, status);

    return NextResponse.json(
      { success: true, message: "Cập nhật trạng thái đăng ký thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PUT /api/registrations/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
