import { NextResponse } from "next/server";
import { handleGetActiveBankAccount } from "@/features/payment/controller/payment.controller";

export async function GET() {
  try {
    const account = await handleGetActiveBankAccount();
    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/bank-accounts/active] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
