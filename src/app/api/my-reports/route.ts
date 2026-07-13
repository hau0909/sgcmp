import {
  handleGetCustomerReports,
  handleCreateCustomerReport,
} from "@/features/report/controller/report.controller";
import { NextResponse, NextRequest, connection } from "next/server";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;

    const result = await handleGetCustomerReports(customerId, {
      page,
      limit,
      search,
      status,
      type,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/my-reports] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connection();
  try {
    const body = await request.json();
    const { customer_id, contract_id, type, description, image_url } = body;

    if (!customer_id) {
      return NextResponse.json({ error: "customer_id is required" }, { status: 400 });
    }

    const newReport = await handleCreateCustomerReport({
      contract_id,
      customer_id,
      type,
      description,
      image_url,
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("[POST /api/my-reports] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
