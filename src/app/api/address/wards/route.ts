import { handleGetWards } from "@/features/address";
import { NextResponse, type NextRequest, connection } from "next/server";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const cityIdStr = searchParams.get("cityId");

    let cityId: number | undefined;
    if (cityIdStr) {
      cityId = parseInt(cityIdStr, 10);
    }

    const wards = await handleGetWards(cityId);
    return NextResponse.json({ success: true, wards }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/address/wards] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi lấy danh sách phường/xã" },
      { status: 500 }
    );
  }
}
