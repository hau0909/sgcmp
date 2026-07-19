import { NextResponse } from "next/server";
import {
  handleGetPlanById,
  handleUpdatePlan,
  handleDeletePlan,
} from "@/features/subscription/controller/subscription.controller";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const planId = parseInt(id);
    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: "Plan ID hợp lệ là bắt buộc" },
        { status: 400 },
      );
    }

    const plan = await handleGetPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy gói dịch vụ" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, plan }, { status: 200 });
  } catch (error: any) {
    console.error(`[GET /api/subscriptions/plans/[id]] Error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const planId = parseInt(id);
    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: "Plan ID hợp lệ là bắt buộc" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const plan = await handleUpdatePlan(planId, body);
    return NextResponse.json({ success: true, plan }, { status: 200 });
  } catch (error: any) {
    console.error(`[PUT /api/subscriptions/plans/[id]] Error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const planId = parseInt(id);
    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: "Plan ID hợp lệ là bắt buộc" },
        { status: 400 },
      );
    }

    await handleDeletePlan(planId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(`[DELETE /api/subscriptions/plans/[id]] Error:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || "Không thể xóa gói dịch vụ này vì có thể đã có tài khoản đang đăng ký sử dụng." },
      { status: 500 },
    );
  }
}
