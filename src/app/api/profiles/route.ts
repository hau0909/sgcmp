import { NextRequest, NextResponse } from "next/server";
import { handleUpdateProfile } from "@/features/profile/controller/profile.controller";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullName, phoneNumber, gender, dateOfBirth, address, avatarUrl } = body;

    const result = await handleUpdateProfile(userId, {
      fullName,
      phoneNumber,
      gender,
      dateOfBirth,
      address,
      avatarUrl,
    });

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Đã có lỗi xảy ra khi gọi API Profile" },
      { status: 500 }
    );
  }
}
