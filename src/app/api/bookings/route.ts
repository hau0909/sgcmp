import { handleGetBookings, handleCreateBooking } from "@/features/booking/controller/booking.controller";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const customerId = searchParams.get("customerId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const status = searchParams.get("status") || undefined;
    const contractStatus = searchParams.get("contractStatus") || undefined;

    if (!companyId && !customerId) {
      return NextResponse.json(
        { error: "companyId or customerId parameter is required" },
        { status: 400 }
      );
    }

    const result = await handleGetBookings(companyId, page, limit, status, contractStatus, customerId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[GET /api/bookings] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await handleCreateBooking(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/bookings] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
