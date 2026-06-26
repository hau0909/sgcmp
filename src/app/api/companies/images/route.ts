import { NextRequest, NextResponse } from "next/server";
import { handleUploadCompanyImage } from "@/features/company/controller/company.controller";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const image_type = formData.get("image_type");

    const result = await handleUploadCompanyImage({
      file,
      image_type,
    });

    if (
      result &&
      typeof result === "object" &&
      "success" in result &&
      result.success === false
    ) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tải ảnh công ty thành công.",
        data: result,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Upload Company Image API Error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Không thể tải ảnh công ty.",
        data: null,
      },
      { status: 500 },
    );
  }
};
