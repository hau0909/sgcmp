import { NextRequest, NextResponse, connection } from "next/server";
import { handleGetGuardsByContract } from "@/features/guards/controller/guard.controller";
import { handleAssignGuardsToContract } from "@/features/contract/controller/contract.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  await connection();
  try {
    const { id: contractId } = await params;

    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");

    const result = await handleGetGuardsByContract({
      contract_id: contractId,
      page,
      limit,
      search,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("[GET /api/contracts/[id]/guards] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  await connection();
  try {
    const { id: contractId } = await params;

    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { guardIds } = body;

    if (!Array.isArray(guardIds)) {
      return NextResponse.json(
        { success: false, message: "Danh sách bảo vệ không hợp lệ" },
        { status: 400 }
      );
    }

    const result = await handleAssignGuardsToContract(contractId, guardIds);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("[PUT /api/contracts/[id]/guards] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
