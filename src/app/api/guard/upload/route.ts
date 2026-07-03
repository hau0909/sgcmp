import { NextResponse } from "next/server";
import { handleUploadGuardFile } from "@/features/guards/controller/guard.controller";

export const POST = async (request: Request) => {
  try {
    console.log("UPLOAD CONTENT TYPE:", request.headers.get("content-type"));

    const form_data = await request.formData();

    console.log("UPLOAD USER ID:", form_data.get("user_id"));

    const file = form_data.get("file") || form_data.get("avatar_file");
    const type = form_data.get("type") || "avatar";

    console.log("UPLOAD FILE:", {
      is_file: file instanceof File,
      name: file instanceof File ? file.name : null,
      type: file instanceof File ? file.type : null,
      size: file instanceof File ? file.size : null,
      upload_type: type,
    });

    const result = await handleUploadGuardFile(form_data);

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("POST /api/guard/upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Không thể xử lý file ảnh.",
      },
      {
        status: 500,
      },
    );
  }
};
