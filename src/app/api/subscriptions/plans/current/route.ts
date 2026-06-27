import { handleGetCurrentActivePlan } from "@/features/subscription/controller/subscription.controller";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const currentPlan = await handleGetCurrentActivePlan(companyId);
    return NextResponse.json({ currentPlan: currentPlan || null }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/subscriptions/plans/current] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
