import { NextRequest, NextResponse } from "next/server";
import { handleCreateCompanyPublishRequest } from "@/features/company/controller/company.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: companyId } = await params;

    if (!companyId) {
      return NextResponse.json(
        { error: "Mã công ty là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const note = body.note;

    const result = await handleCreateCompanyPublishRequest(companyId, note);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("[POST /api/companies/[id]/publish-requests] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
