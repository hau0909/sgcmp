import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleGetMyRegistration } from "@/features/registration/controller/registration.controller";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập hoặc phiên làm việc đã hết hạn" },
        { status: 401 }
      );
    }

    const result = await handleGetMyRegistration(user.id);

    return NextResponse.json({ registration: result }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/registrations/my] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
