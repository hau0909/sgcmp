import { NextRequest, NextResponse } from "next/server";
import { handleGetBookingDetail, handleUpdateBookingStatusAndPrice } from "@/features/booking/controller/booking.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã yêu cầu là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetBookingDetail(id);
    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy yêu cầu đặt lịch" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking: result }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/bookings/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã yêu cầu là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await handleUpdateBookingStatusAndPrice(id, body);
    return NextResponse.json({
      booking: result.booking,
      contract_id: result.contract_id,
    }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[PATCH /api/bookings/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 400 }
    );
  }
}
