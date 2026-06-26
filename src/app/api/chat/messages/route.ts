import { NextRequest, NextResponse } from "next/server";
import {
  handleGetMessages,
  handleSendMessage,
} from "@/features/chat/controller/chat.controller";
import { SendMessagePayload } from "@/features/chat/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const result = await handleGetMessages(conversationId);
    return NextResponse.json({ messages: result }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/chat/messages] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SendMessagePayload = await req.json();
    const result = await handleSendMessage(body);
    return NextResponse.json({ message: result }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/chat/messages] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
