import { NextRequest, NextResponse, connection } from "next/server";
import {
  handleGetPaymentSummaryAdmin,
  type PaymentSummaryAdminOptions,
} from "@/features/payment/controller/payment.controller";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;

    // Validate date format if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { error: "startDate must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return NextResponse.json(
        { error: "endDate must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    const options: PaymentSummaryAdminOptions = {
      keyword,
      startDate,
      endDate,
    };

    const result = await handleGetPaymentSummaryAdmin(options);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/payment/summary] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
