import { handleGetAdminGrowth } from "@/features/dashboard/controller/dashboard.controller";
import { NextResponse, connection } from "next/server";

export async function GET(request: Request) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range");
    const range = rangeParam === "1y" ? "1y" : "6m";

    const result = await handleGetAdminGrowth(range);
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
