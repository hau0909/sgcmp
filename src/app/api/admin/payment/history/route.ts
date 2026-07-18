import { NextRequest, NextResponse, connection } from "next/server";
import { handleGetAllPaymentsAdmin } from "@/features/payment/controller/payment.controller";

export async function GET() {
  await connection();
  try {
    const data = await handleGetAllPaymentsAdmin();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/payment/history] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
