import { NextResponse } from "next/server";
import {
  handleUpdateBankAccount,
  handleDeleteBankAccount,
} from "@/features/payment/controller/payment.controller";
import { UpsertBankAccountPayload } from "@/features/payment/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: UpsertBankAccountPayload = await request.json();

    if (!body.bank_code || !body.bank_name || !body.account_number || !body.account_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const account = await handleUpdateBankAccount(id, body);
    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error: any) {
    console.error("[PUT /api/bank-accounts/[id]] Error:", error);
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await handleDeleteBankAccount(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    // Business rule violation (last account)
    if (error?.message?.includes("cuối cùng")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }

    console.error("[DELETE /api/bank-accounts/[id]] Error:", error);
    
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
