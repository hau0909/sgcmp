import { NextRequest, NextResponse, connection } from "next/server";
import { handleGetCustomerGuardsByContract } from "@/features/guards/controller/guard.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ success: false, message: "customerId is required" }, { status: 400 });
    }

    const { id: contractId } = await params;

    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");

    const result = await handleGetCustomerGuardsByContract({
      contract_id: contractId,
      customerId,
      page,
      limit,
      search,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("[GET /api/my-contracts/[id]/guards] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
