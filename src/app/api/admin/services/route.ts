import { NextRequest, NextResponse, connection } from "next/server";
import { handleGetServices, handleCreateService } from "@/features/service/controller/service.controller";

export async function GET() {
  await connection();
  try {
    const services = await handleGetServices();
    return NextResponse.json({ services }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/admin/services] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connection();
  try {
    const body = await req.json();
    const result = await handleCreateService({
      name: body.name,
      description: body.description,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/services] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
