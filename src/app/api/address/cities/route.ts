import { handleGetCities } from "@/features/address";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cities = await handleGetCities();
    return NextResponse.json({ success: true, cities }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/address/cities] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi lấy danh sách thành phố" },
      { status: 500 }
    );
  }
}
