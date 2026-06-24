import { NextRequest, NextResponse } from "next/server";
import { handleGetCustomerContractDetail, handleSignContractCustomer, handleCompleteContractCustomer } from "@/features/contract/controller/contract.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetCustomerContractDetail(id, customerId);
    if (!result) {
      return NextResponse.json(
        { error: "Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập" },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract: result }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/my-contracts/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (body.action === "sign") {
      const result = await handleSignContractCustomer(id, customerId);
      return NextResponse.json(
        { success: true, contract: result },
        { status: 200 }
      );
    } else if (body.action === "complete") {
      const result = await handleCompleteContractCustomer(id, customerId);
      return NextResponse.json(
        { success: true, contract: result },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Thao tác không hợp lệ" },
        { status: 400 }
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error("[PUT /api/my-contracts/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
