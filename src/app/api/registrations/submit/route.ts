import { NextResponse } from "next/server";
import { handleCreateRegistrationFlow } from "@/features/registration/controller/registration.controller";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const { userId, profile, identity, company, images } = body;

    if (!userId || !profile || !identity || !company) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu thông tin đăng ký bắt buộc",
        },
        { status: 400 }
      );
    }

    const registrationCode = await handleCreateRegistrationFlow({
      userId,
      profile,
      identity,
      company,
      images: images || [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gửi hồ sơ đăng ký thành công",
        registrationCode,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[POST /api/registrations/submit] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lỗi xử lý yêu cầu đăng ký",
      },
      { status: 500 }
    );
  }
};
