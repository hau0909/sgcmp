import { handleUpdateQuotation } from "@/features/booking/controller/booking.controller";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quoted_price } = body;

    if (quoted_price === undefined || quoted_price === null) {
      return NextResponse.json(
        { error: "quoted_price is required" },
        { status: 400 }
      );
    }

    const result = await handleUpdateQuotation(id, quoted_price);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/bookings/[id]/quotation] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
