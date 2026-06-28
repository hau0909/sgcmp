import { handleGetCompanyPublishRequests } from "@/features/company";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await handleGetCompanyPublishRequests();
    return NextResponse.json({ publish_requests: result }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/admin/publish-requests] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
