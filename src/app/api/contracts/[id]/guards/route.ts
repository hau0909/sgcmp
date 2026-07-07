import { NextRequest, NextResponse, connection } from "next/server";
import { handleGetGuardsByContract } from "@/features/guards/controller/guard.controller";

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
