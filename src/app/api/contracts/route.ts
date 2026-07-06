import { handleGetContracts } from "@/features/contract/controller/contract.controller";
import { NextResponse, NextRequest, connection } from "next/server";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const companyId = searchParams.get("companyId") || undefined;

    const result = await handleGetContracts({
      page,
      limit,
      companyId,
      search,
      status,
      startDate,
      endDate,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/contracts] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
