import { NextResponse } from "next/server";
import { handleCreateGuardAccount } from "@/features/guards/controller/guard.controller";
import type { CreateGuardAccountBody } from "@/features/guards/type";

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as CreateGuardAccountBody;

    console.log("POST /api/guard/create BODY:", body);

    const result = await handleCreateGuardAccount(body);

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("POST /api/guard/create error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof SyntaxError
            ? "Dữ liệu JSON gửi lên không hợp lệ."
            : error instanceof Error
              ? error.message
              : "Không thể tạo tài khoản bảo vệ.",
      },
      {
        status: 500,
      },
    );
  }
};
