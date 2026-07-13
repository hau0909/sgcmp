import { NextRequest, NextResponse, connection } from "next/server";
import { handleDeleteCustomerReport } from "@/features/report/controller/report.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã báo cáo là bắt buộc" },
        { status: 400 }
      );
    }

    await handleDeleteCustomerReport(id, customerId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[DELETE /api/my-reports/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
