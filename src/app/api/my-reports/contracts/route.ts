import { handleGetCustomerContractsForReport } from "@/features/report/controller/report.controller";
import { NextResponse, NextRequest, connection } from "next/server";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const contracts = await handleGetCustomerContractsForReport(customerId);

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/my-reports/contracts] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
