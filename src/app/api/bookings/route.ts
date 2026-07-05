import { handleGetBookings, handleCreateBooking, handleGetCustomerBookings } from "@/features/booking/controller/booking.controller";
import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || undefined;
    const customerId = searchParams.get("customerId") || undefined;
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

    if (customerId) {
      const result = await handleGetCustomerBookings(customerId, page, limit, status || undefined);
      return NextResponse.json(result, { status: 200 });
    }

    const result = await handleGetBookings(companyId!, page, limit, status, contractStatus);
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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập hoặc phiên làm việc đã hết hạn" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const bookingData = {
      ...body,
      customer_id: user.id,
    };

    const result = await handleCreateBooking(bookingData);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/bookings] Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
