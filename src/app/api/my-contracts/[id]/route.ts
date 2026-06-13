import { NextRequest, NextResponse } from "next/server";
import { handleGetCustomerContractDetail, handleSignContractCustomer } from "@/features/contract/controller/contract.controller";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const result = await handleGetCustomerContractDetail(id, user.id);
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (body.action !== "sign") {
      return NextResponse.json(
        { error: "Thao tác không hợp lệ" },
        { status: 400 }
      );
    }

    const result = await handleSignContractCustomer(id, user.id);

    return NextResponse.json(
      { success: true, contract: result },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("[PUT /api/my-contracts/[id]] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
