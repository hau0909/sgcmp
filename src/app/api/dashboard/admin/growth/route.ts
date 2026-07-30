import { handleGetAdminGrowth } from "@/features/dashboard/controller/dashboard.controller";
import { NextResponse, connection } from "next/server";

export async function GET(request: Request) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get("timeFilter") || searchParams.get("range") || "month";

    const result = await handleGetAdminGrowth(timeFilter);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/dashboard/admin/growth] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
