import { createClient } from "@/lib/supabase/server";
import { Conversation } from "@/types/Conversation";
import { Message } from "@/types/Message";
import { SendMessagePayload, ConversationWithDetails } from "../types";

export const getConversations = async (companyId: string, userId: string): Promise<ConversationWithDetails[]> => {
  const supabase = await createClient();

  const { data: convs, error } = await supabase
    .from("conversations")
    .select("conversation_id, company_id, created_at, updated_at")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return Promise.all((convs || []).map(async (conv) => {
    // 1. Lấy tin nhắn mới nhất
    const { data: latestData } = await supabase.from("messages")
      .select("content").eq("conversation_id", conv.conversation_id)
      .order("created_at", { ascending: false }).limit(1);
    const latest = latestData?.[0];

    // 2. Tìm ID của người gửi (khác với userId cố định của Company)
    const { data: otherData } = await supabase.from("messages")
      .select("sender_id").eq("conversation_id", conv.conversation_id)
      .neq("sender_id", userId).limit(1);
    const other = otherData?.[0];

    // 3. Truy vấn Tên & Avatar từ profile
    let profileData: { customer_name?: string; customer_avatar?: string } = {};
    if (other?.sender_id) {
      const { data: profile } = await supabase.from("profiles")
        .select("full_name, avatar_url").eq("user_id", other.sender_id).single();
      profileData = { customer_name: profile?.full_name, customer_avatar: profile?.avatar_url || undefined };
    }

    return { ...conv, latest_message: latest?.content, ...profileData };
  }));
};

export const getMessagesByConversationId = async (
  conversationId: string
): Promise<Message[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("message_id, conversation_id, sender_id, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Message[]) || [];
};

export const insertMessage = async (
  payload: SendMessagePayload
): Promise<Message> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: payload.conversationId,
      sender_id: payload.senderId,
      content: payload.content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Cập nhật updated_at cho hội thoại
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("conversation_id", payload.conversationId);

  return data as Message;
};
