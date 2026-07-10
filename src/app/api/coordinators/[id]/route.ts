import { NextRequest, NextResponse } from "next/server";
import { handleGetCoordinatorDetail } from "@/features/coordinator/controller/coordinator.controller";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { message: "Coordinator ID is required" },
        { status: 400 }
      );
    }

    const result = await handleGetCoordinatorDetail(id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error(`[GET /api/coordinators/[id]] Error:`, error);
    
    if (error?.message === "Coordinator không tồn tại") {
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
