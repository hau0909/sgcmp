import { handleConfirmOrDenyQuotation } from "@/features/booking/controller/booking.controller";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status !== "accepted" && status !== "rejected") {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'rejected'." },
        { status: 400 }
      );
    }

    const result = await handleConfirmOrDenyQuotation(id, status);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/bookings/[id]/decision] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
