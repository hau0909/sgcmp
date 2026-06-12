import { NextResponse } from "next/server";
import { handleUploadGuardAvatar } from "@/features/guards/controller/guard.controller";

export const POST = async (request: Request) => {
  try {
    console.log("UPLOAD CONTENT TYPE:", request.headers.get("content-type"));

    const form_data = await request.formData();

    console.log("UPLOAD USER ID:", form_data.get("user_id"));

    const avatar_file = form_data.get("avatar_file");

    console.log("UPLOAD FILE:", {
      is_file: avatar_file instanceof File,
      name: avatar_file instanceof File ? avatar_file.name : null,
      type: avatar_file instanceof File ? avatar_file.type : null,
      size: avatar_file instanceof File ? avatar_file.size : null,
    });

    const result = await handleUploadGuardAvatar(form_data);

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
