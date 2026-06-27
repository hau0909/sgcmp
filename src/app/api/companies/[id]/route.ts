import { NextRequest, NextResponse } from "next/server";
import { handleGetCompanyById } from "@/features/company/controller/company.controller";

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
        { error: "Mã công ty là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetCompanyById(id);
    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy công ty" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/companies/[id]] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
