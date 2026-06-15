import { NextRequest, NextResponse } from "next/server";
import { handleCreatePayment } from "@/features/payment/controller/payment.controller";
import { PaymentMethod } from "@/types/Enum";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, planId, paymentMethod } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId parameter is required" },
        { status: 400 }
      );
    }

    if (!planId || typeof planId !== "number") {
      return NextResponse.json(
        { error: "planId parameter is required and must be a number" },
        { status: 400 }
      );
    }

    const validMethods: PaymentMethod[] = ["bank_transfer", "credit_card", "e_wallet"];
    if (!paymentMethod || !validMethods.includes(paymentMethod as PaymentMethod)) {
      return NextResponse.json(
        { error: `paymentMethod must be one of: ${validMethods.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await handleCreatePayment(companyId, planId, paymentMethod as PaymentMethod);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/payments] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
