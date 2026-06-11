import { NextRequest, NextResponse } from "next/server";
import {
  handleUploadContractFile,
  handleDeleteContractFile,
} from "@/features/contract/controller/contract.controller";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Tệp tải lên là bắt buộc" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Hệ thống chỉ chấp nhận tệp định dạng PDF" },
        { status: 400 }
      );
    }

    const publicUrl = await handleUploadContractFile(id, file);

    return NextResponse.json(
      { success: true, contract_file_url: publicUrl },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("[POST /api/contracts/[id]/upload] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Mã hợp đồng là bắt buộc" },
        { status: 400 }
      );
    }

    await handleDeleteContractFile(id);

    return NextResponse.json(
      { success: true, message: "Đã xóa tệp hợp đồng thành công" },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("[DELETE /api/contracts/[id]/upload] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
