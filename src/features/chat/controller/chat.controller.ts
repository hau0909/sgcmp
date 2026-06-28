import { Conversation } from "@/types/Conversation";
import { Message } from "@/types/Message";
import { SendMessagePayload, ConversationWithDetails } from "../types";
import {
  getConversationsService,
  getMessagesByConversationIdService,
  sendMessageService,
  getOrCreateConversationService,
  getConversationsByCustomerIdService,
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

export const handleGetOrCreateConversation = async (
  companyId: string,
  customerId: string
): Promise<Conversation> => {
  if (!companyId || !customerId) {
    throw new Error("companyId and customerId are required");
  }
  return await getOrCreateConversationService(companyId, customerId);
};

export const handleGetConversationsByCustomerId = async (
  customerId: string
): Promise<ConversationWithDetails[]> => {
  if (!customerId) throw new Error("customerId is required");
  return await getConversationsByCustomerIdService(customerId);
};
