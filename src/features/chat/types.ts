import { Conversation } from "@/types/Conversation";

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
}

export interface ConversationWithDetails extends Conversation {
  customer_name?: string;
  customer_avatar?: string;
  latest_message?: string;
}
