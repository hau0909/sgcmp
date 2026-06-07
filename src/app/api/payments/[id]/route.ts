import { NextRequest, NextResponse } from "next/server";
import {
  handleUpdatePaymentStatus,
  handleGetPaymentById,
} from "@/features/payment/controller/payment.controller";
import { PaymentStatus } from "@/types/Enum";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID parameter is required" },
        { status: 400 }
      );
    }

    const result = await handleGetPaymentById(id);
    if (!result) {
      return NextResponse.json(
        { error: "Payment transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error(`[GET /api/payments/[id]] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID parameter is required" },
        { status: 400 }
      );
    }

    let status: PaymentStatus = "completed";
    
    try {
      const body = await request.json();
      if (body.status) {
        status = body.status;
      }
    } catch (e) {
      // Body might be empty or invalid JSON, which is fine if we default to "completed"
    }

    const validStatuses: PaymentStatus[] = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status parameter. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await handleUpdatePaymentStatus(id, status);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error(`[PATCH /api/payments/[id]] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
