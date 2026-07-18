import { handleGetAdminPublishedCompanies } from "@/features/dashboard/controller/dashboard.controller";
import { NextResponse, connection } from "next/server";

export async function GET() {
  await connection();

  try {
    const result = await handleGetAdminPublishedCompanies();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/dashboard/admin/companies/published] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
