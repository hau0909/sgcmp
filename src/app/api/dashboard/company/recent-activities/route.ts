import { handleGetRecentActivities } from "@/features/dashboard/controller/dashboard.controller";
import { NextResponse, NextRequest, connection } from "next/server";

/**
 * GET /api/dashboard/recent-activities
 *
 * Query params:
 *   companyId (required) – UUID của công ty
 */
export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Thiếu tham số bắt buộc: companyId" },
        { status: 400 },
      );
    }

    const result = await handleGetRecentActivities(companyId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/dashboard/recent-activities] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
