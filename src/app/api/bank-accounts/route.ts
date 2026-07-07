import { NextResponse } from "next/server";
import {
  handleGetAllBankAccounts,
  handleCreateBankAccount,
} from "@/features/payment/controller/payment.controller";
import { UpsertBankAccountPayload } from "@/features/payment/types";

export async function GET() {
  try {
    const accounts = await handleGetAllBankAccounts();
    return NextResponse.json({ success: true, data: accounts }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/bank-accounts] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: UpsertBankAccountPayload = await request.json();

    if (!body.bank_code || !body.bank_name || !body.account_number || !body.account_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const account = await handleCreateBankAccount(body);
    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bank-accounts] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
