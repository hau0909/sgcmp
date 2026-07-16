import { handleGetActiveGuardsOnShift } from "@/features/dashboard/controller/dashboard.controller";
import { NextResponse, NextRequest, connection } from "next/server";

/**
 * GET /api/dashboard/active-guards
 *
 * Query params:
 *   companyId (required) – UUID của công ty cần truy vấn
 *
 * Response:
 * {
 *   count: number,          // số bảo vệ đang trực hiện tại
 *   percentChange: number | null, // % so với tháng trước (null nếu không xác định)
 *   trend: "up" | "down" | "neutral"
 * }
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

    const result = await handleGetActiveGuardsOnShift(companyId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/dashboard/active-guards] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
