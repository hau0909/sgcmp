import { handleGetAllAccounts } from "@/features/account/controller/account.controller";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await handleGetAllAccounts();
    return NextResponse.json({ accounts: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/accounts] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
