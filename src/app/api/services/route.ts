import { NextResponse } from "next/server";
import { getServices } from "@/features/company/repository/company.repository";

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json(services, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/services] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
