import { handleGetAllPlans } from "@/features/subscription/controller/subscription.controller";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await handleGetAllPlans();
    return NextResponse.json({ plans: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/subscriptions/plans]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
