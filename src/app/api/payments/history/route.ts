import { NextRequest, NextResponse } from "next/server";
import { handleGetPaymentHistory } from "@/features/payment/controller/payment.controller";
import { PaymentStatus } from "@/types/Enum";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const limitParam = searchParams.get("limit");
    const statusParam = searchParams.get("status") || "completed";

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId parameter is required" },
        { status: 400 }
      );
    }

    const validStatuses: PaymentStatus[] = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(statusParam as PaymentStatus)) {
      return NextResponse.json(
        { error: `Invalid status parameter. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    const status = statusParam as PaymentStatus;

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    if (isNaN(limit) || limit <= 0) {
      return NextResponse.json(
        { error: "limit must be a positive number" },
        { status: 400 }
      );
    }

    const result = await handleGetPaymentHistory(companyId, limit, status);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/payments/history] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


