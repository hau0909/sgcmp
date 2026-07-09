import { NextRequest, NextResponse } from "next/server";
import { handleGetVerification, handleCreateVerification, handleUpdateVerification } from "@/features/verification/controller/verification.controller";
import { updateVerificationSchema } from "@/features/verification/validator/verification.validate";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Mã yêu cầu là bắt buộc" }, { status: 400 });
    }

    const verification = await handleGetVerification(id);
    return NextResponse.json({ verification }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/bookings/[id]/verification] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Mã yêu cầu là bắt buộc" }, { status: 400 });
    }

    const verification = await handleCreateVerification(id);
    return NextResponse.json({ verification }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    console.error("[POST /api/bookings/[id]/verification] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Mã yêu cầu là bắt buộc" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateVerificationSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: parsedBody.error?.message }, { status: 400 });
    }

    const verification = await handleUpdateVerification(id, parsedBody.data);
    return NextResponse.json({ verification }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[PATCH /api/bookings/[id]/verification] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}
