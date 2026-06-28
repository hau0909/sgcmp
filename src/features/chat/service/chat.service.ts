import { Conversation } from "@/types/Conversation";
import { Message } from "@/types/Message";
import { SendMessagePayload, ConversationWithDetails } from "../types";
import {
  getConversations,
  getMessagesByConversationId,
  insertMessage,
  getOrCreateConversation,
  getConversationsByCustomerId,
} from "../repository/chat.repository";

export const getConversationsService = async (companyId: string, userId: string): Promise<ConversationWithDetails[]> => {
  const result = await getConversations(companyId, userId);
  return result;
};

export const getMessagesByConversationIdService = async (
  conversationId: string
): Promise<Message[]> => {
  const result = await getMessagesByConversationId(conversationId);
  return result;
};

export const sendMessageService = async (
  payload: SendMessagePayload
): Promise<Message> => {
  const result = await insertMessage(payload);
  return result;
};

export const getOrCreateConversationService = async (
  companyId: string,
  customerId: string
): Promise<Conversation> => {
  return await getOrCreateConversation(companyId, customerId);
};

export const getConversationsByCustomerIdService = async (
  customerId: string
): Promise<ConversationWithDetails[]> => {
  return await getConversationsByCustomerId(customerId);
};
