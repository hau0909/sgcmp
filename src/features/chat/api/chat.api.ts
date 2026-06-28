import { fetcher } from "@/lib/fetcher";
import { SendMessagePayload } from "../types";

export async function requestGetConversations(companyId: string, userId: string) {
  return await fetcher(
    `/api/chat/conversations?companyId=${encodeURIComponent(companyId)}&userId=${encodeURIComponent(userId)}`,
    { method: "GET" }
  );
}

export async function requestGetMyConversations(customerId: string) {
  return await fetcher(
    `/api/chat/conversations?customerId=${encodeURIComponent(customerId)}`,
    { method: "GET" }
  );
}

export async function requestGetOrCreateConversation(companyId: string, customerId: string) {
  return await fetcher("/api/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ companyId, customerId }),
  });
}

export async function requestGetMessages(conversationId: string) {
  return await fetcher(
    `/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`,
    {
      method: "GET",
    }
  );
}

export async function requestSendMessage(payload: SendMessagePayload) {
  return await fetcher("/api/chat/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
