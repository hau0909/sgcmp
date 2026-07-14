import { handleUpdateReportStatus } from "@/features/report/controller/report.controller";
import { NextRequest, NextResponse, connection } from "next/server";
import { ReportStatus } from "@/types/Enum";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  await connection();
  try {
    const body = await request.json();
    const { status } = body;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã báo cáo là bắt buộc" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Trạng thái là bắt buộc" },
        { status: 400 }
      );
    }

    const updated = await handleUpdateReportStatus(id, status as ReportStatus);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[PATCH /api/coor-reports/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
