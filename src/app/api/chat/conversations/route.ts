import { NextRequest, NextResponse } from "next/server";
import { handleGetConversations } from "@/features/chat/controller/chat.controller";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const userId = searchParams.get("userId");

    if (!companyId || !userId) {
      return NextResponse.json(
        { error: "companyId and userId are required" },
        { status: 400 }
      );
    }

    const result = await handleGetConversations(companyId, userId);
    return NextResponse.json({ conversations: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/chat/conversations] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
