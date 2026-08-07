import { NextRequest, NextResponse } from "next/server";
import {
  handleGetContractDetail,
  handleSignContractCompany,
  handleUpdateContractDates,
} from "@/features/contract/controller/contract.controller";

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
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetContractDetail(id);
    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy hợp đồng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract: result }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/contracts/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, startDate, endDate } = body;

    if (action === "sign") {
      const result = await handleSignContractCompany(id);
      return NextResponse.json(
        { success: true, contract: result },
        { status: 200 }
      );
    }

    if (action === "update_dates") {
      const result = await handleUpdateContractDates(id, startDate, endDate);
      return NextResponse.json(
        { success: true, contract: result },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Hành động không hợp lệ" },
      { status: 400 }
    );

  } catch (error) {
    const err = error as Error;
    console.error("[PUT /api/contracts/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
