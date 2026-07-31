import {
  handleGetAdminCompanies,
  handleUpdateCompanyStatusByAdmin,
} from "@/features/company/controller/company.controller";
import { NextResponse, NextRequest, connection } from "next/server";

export async function GET() {
  await connection();
  try {
    const companies = await handleGetAdminCompanies();
    return NextResponse.json({ success: true, companies }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/admin/companies] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connection();
  try {
    const body = await request.json();
    const { company_id, status } = body;

    if (!company_id || !status) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu company_id hoặc status" },
        { status: 400 },
      );
    }

    await handleUpdateCompanyStatusByAdmin(company_id, status);
    return NextResponse.json(
      { success: true, message: "Cập nhật trạng thái thành công" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[PATCH /api/admin/companies] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
