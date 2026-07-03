import { NextRequest, NextResponse } from "next/server";
import { handleCreateIdentity } from "@/features/identity/controller/identity.controller";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, identityId, issueDate, issuePlace, frontUrl, backUrl } = body;

    const result = await handleCreateIdentity(userId, identityId, issueDate, issuePlace, frontUrl, backUrl);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Đã có lỗi xảy ra khi gọi API Identity" },
      { status: 500 }
    );
  }
}
