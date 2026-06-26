import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleUpdateCompanyProfile } from "@/features/company/controller/company.controller";
import { UpdateCompanyProfileInput } from "@/features/company/types";

const getErrorStatus = (message?: string) => {
  if (!message) return 500;

  if (message.includes("chưa đăng nhập")) return 401;
  if (message.includes("không hợp lệ")) return 400;
  if (message.includes("Không tìm thấy")) return 404;
  if (message.includes("không có quyền")) return 403;

  return 500;
};

export const PATCH = async (req: NextRequest) => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          message: "Bạn chưa đăng nhập",
          data: null,
        },
        { status: 401 },
      );
    }

    const body = (await req.json()) as UpdateCompanyProfileInput;

    const result = await handleUpdateCompanyProfile({
      user_id: user.id,
      input: body,
    });

    if (
      result &&
      typeof result === "object" &&
      "success" in result &&
      result.success === false
    ) {
      return NextResponse.json(
        {
          message: result.message,
          data: result.data,
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message: "Cập nhật thông tin công ty thành công.",
        data: result,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Update Company Profile API Error:", err);

    return NextResponse.json(
      {
        message: err.message || "Không thể cập nhật thông tin công ty.",
        data: null,
      },
      { status: getErrorStatus(err.message) },
    );
  }
};
