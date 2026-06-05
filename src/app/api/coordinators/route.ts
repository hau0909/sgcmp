import { NextRequest, NextResponse } from "next/server";
import { handleGetCoordinators } from "@/features/coordinator/controller/coordinator.controller";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);

  if (!companyId) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await handleGetCoordinators(companyId, page, limit);
    return NextResponse.json({ coordinators: result.data, total: result.total }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/coordinators] Error:", error);
    return NextResponse.json(
      { error: error?.message || JSON.stringify(error) || "Internal Server Error" },
      { status: 500 }
    );
  }
}
