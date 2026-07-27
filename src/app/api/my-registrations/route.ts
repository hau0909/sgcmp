import { NextResponse, NextRequest, connection } from "next/server";
import {
  handleGetMyRegistration,
  handleUpdateRegistrationFlow,
} from "@/features/registration/controller/registration.controller";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const result = await handleGetMyRegistration(userId);

    return NextResponse.json({ registration: result }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/my-registrations] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connection();
  try {
    const body = await request.json();
    const { userId, registrationId, profile, identity, company, images, companyId } = body;

    if (!userId || !registrationId || !profile || !identity || !company || !companyId) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc để cập nhật hồ sơ" },
        { status: 400 }
      );
    }

    // Verify registration exists and is rejected
    const existing = await handleGetMyRegistration(userId);
    if (!existing) {
      return NextResponse.json(
        { error: "Không tìm thấy hồ sơ đăng ký" },
        { status: 404 }
      );
    }
    if (existing.status !== "rejected") {
      return NextResponse.json(
        { error: "Chỉ có thể cập nhật hồ sơ đang ở trạng thái bị từ chối" },
        { status: 400 }
      );
    }

    await handleUpdateRegistrationFlow(userId, registrationId, {
      profile,
      identity,
      company,
      images: images || [],
      companyId,
    });

    return NextResponse.json(
      { success: true, message: "Cập nhật và gửi lại hồ sơ thành công" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[PATCH /api/my-registrations] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
