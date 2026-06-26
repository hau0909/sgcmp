import { NextRequest, NextResponse } from "next/server";
import { handleUpdateCompanyProfile } from "@/features/company/controller/company.controller";
import { UpdateCompanyProfileInput } from "@/features/company/types";

export const PATCH = async (req: NextRequest) => {
  try {
    const body = (await req.json()) as UpdateCompanyProfileInput;

    const result = await handleUpdateCompanyProfile({
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
          success: false,
          message: result.message,
          data: result.data,
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật thông tin công ty thành công.",
        data: result,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Update Company Profile API Error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Không thể cập nhật thông tin công ty.",
        data: null,
      },
      { status: 500 },
    );
  }
};
