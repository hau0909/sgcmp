import { Conversation } from "@/types/Conversation";
import { Message } from "@/types/Message";
import { SendMessagePayload, ConversationWithDetails } from "../types";
import {
  getConversations,
  getMessagesByConversationId,
  insertMessage,
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
