import { NextResponse } from "next/server";
import { handleInsertGuardInformation } from "@/features/guards/controller/guard.controller";
import type { InsertGuardInformationBody } from "@/features/guards/type";

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as InsertGuardInformationBody;

    console.log("POST /api/guard BODY:", body);

    const result = await handleInsertGuardInformation(body);

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("POST /api/guard ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể thêm thông tin bảo vệ.",
      },
      {
        status: 500,
      },
    );
  }
};
