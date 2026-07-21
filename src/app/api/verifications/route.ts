import { NextRequest, NextResponse } from "next/server";
import { handleGetVerificationsByCompany } from "@/features/verification/controller/verification.controller";
import { VerificationStatus } from "@/features/verification/types";

export async function GET(request: NextRequest) {
  // Move searchParams outside of try/catch so Next.js can properly catch its NEXT_PRERENDER_INTERRUPTED error
  // to bail out of static generation dynamically.
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const status = searchParams.get("status") as VerificationStatus | null;

  try {

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetVerificationsByCompany(
      companyId,
      page,
      limit,
      status || undefined
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/verifications] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
