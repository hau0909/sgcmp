import { NextResponse } from "next/server";
import { handleSwitchActiveBankAccount } from "@/features/payment/controller/payment.controller";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const account = await handleSwitchActiveBankAccount(id);
    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error: any) {
    console.error("[PUT /api/bank-accounts/[id]/activate] Error:", error);
    if (error?.message?.includes("not found")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
