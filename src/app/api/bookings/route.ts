import { handleGetBookings } from "@/features/booking/controller/booking.controller";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const status = searchParams.get("status") || undefined;
    const contractStatus = searchParams.get("contractStatus") || undefined;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId parameter is required" },
        { status: 400 }
      );
    }

    const result = await handleGetBookings(companyId, page, limit, status, contractStatus);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/bookings] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
