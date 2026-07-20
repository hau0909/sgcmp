import { handleGetAllPlans, handleCreatePlan } from "@/features/subscription/controller/subscription.controller";
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await handleCreatePlan(body);
    return NextResponse.json({ success: true, plan: result }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/subscriptions/plans]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

