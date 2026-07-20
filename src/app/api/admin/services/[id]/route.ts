import { NextRequest, NextResponse } from "next/server";
import {
  handleUpdateService,
  handleDeleteService,
} from "@/features/service/controller/service.controller";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await handleUpdateService(id, body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[PUT /api/admin/services/[id]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi cập nhật dịch vụ." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const result = await handleDeleteService(id);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[DELETE /api/admin/services/[id]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xóa dịch vụ." },
      { status: 500 }
    );
  }
}
