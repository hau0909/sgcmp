import { NextRequest, NextResponse } from "next/server";
import { handleGetConversations, handleGetOrCreateConversation, handleGetConversationsByCustomerId } from "@/features/chat/controller/chat.controller";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const userId = searchParams.get("userId");
    const customerId = searchParams.get("customerId");

    // Customer fetching their own conversations (no companyId)
    if (customerId && !companyId) {
      const result = await handleGetConversationsByCustomerId(customerId);
      return NextResponse.json({ conversations: result }, { status: 200 });
    }

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, customerId } = body;

    if (!companyId || !customerId) {
      return NextResponse.json(
        { error: "companyId and customerId are required" },
        { status: 400 }
      );
    }

    const conversation = await handleGetOrCreateConversation(companyId, customerId);
    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/chat/conversations] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
