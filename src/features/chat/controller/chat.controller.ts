import { Conversation } from "@/types/Conversation";
import { Message } from "@/types/Message";
import { SendMessagePayload, ConversationWithDetails } from "../types";
import {
  getConversationsService,
  getMessagesByConversationIdService,
  sendMessageService,
} from "../service/chat.service";

export const handleGetConversations = async (
  companyId: string,
  userId: string
): Promise<ConversationWithDetails[]> => {
  if (!companyId || !userId) {
    throw new Error("companyId and userId are required");
  }

  const result = await getConversationsService(companyId, userId);
  return result;
};

export const handleGetMessages = async (
  conversationId: string
): Promise<Message[]> => {
  if (!conversationId) {
    throw new Error("conversationId is required");
  }

  const result = await getMessagesByConversationIdService(conversationId);
  return result;
};

export const handleSendMessage = async (
  payload: SendMessagePayload
): Promise<Message> => {
  if (!payload.conversationId || !payload.senderId || !payload.content?.trim()) {
    throw new Error("conversationId, senderId, and content are required");
  }

  const result = await sendMessageService(payload);
  return result;
};
