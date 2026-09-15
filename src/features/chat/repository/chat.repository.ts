import { createClient } from "@/lib/supabase/server";
import { Conversation } from "@/types/Conversation";
import { Message } from "@/types/Message";
import { SendMessagePayload, ConversationWithDetails } from "../types";

export const getConversations = async (companyId: string, userId: string): Promise<ConversationWithDetails[]> => {
  const supabase = await createClient();

  const { data: convs, error } = await supabase
    .from("conversations")
    .select("conversation_id, company_id, customer_id, created_at, updated_at")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return Promise.all((convs || []).map(async (conv) => {
    // 1. Lấy tin nhắn mới nhất
    const { data: latestData } = await supabase.from("messages")
      .select("content").eq("conversation_id", conv.conversation_id)
      .order("created_at", { ascending: false }).limit(1);
    const latest = latestData?.[0];

    // 2. Truy vấn Tên & Avatar từ profile dựa vào customer_id
    let profileData: { customer_name?: string; customer_avatar?: string } = {};
    if (conv.customer_id) {
      const { data: profile } = await supabase.from("profiles")
        .select("full_name, avatar_url").eq("user_id", conv.customer_id).single();
      profileData = { customer_name: profile?.full_name, customer_avatar: profile?.avatar_url || undefined };
    }

    return { ...conv, latest_message: latest?.content, ...profileData };
  }));
};

/**
 * Lấy tất cả conversations mà một customer đã tham gia (dùng cho widget phía khách hàng)
 */
export const getConversationsByCustomerId = async (
  customerId: string
): Promise<ConversationWithDetails[]> => {
  const supabase = await createClient();

  // Lấy thông tin các conversation có customer_id này
  const { data: convs, error } = await supabase
    .from("conversations")
    .select("conversation_id, company_id, customer_id, created_at, updated_at")
    .eq("customer_id", customerId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!convs || convs.length === 0) return [];

  return Promise.all((convs as Conversation[]).map(async (conv) => {
    // Tin nhắn mới nhất
    const { data: latestData } = await supabase
      .from("messages")
      .select("content")
      .eq("conversation_id", conv.conversation_id)
      .order("created_at", { ascending: false })
      .limit(1);
    const latest = latestData?.[0];

    // Lấy tên công ty và logo từ bảng companies
    const { data: companyData } = await supabase
      .from("companies")
      .select("company_name, company_imgs (image_url, image_type)")
      .eq("company_id", conv.company_id)
      .maybeSingle();

    let logoUrl: string | undefined;
    if (companyData && companyData.company_imgs && Array.isArray(companyData.company_imgs)) {
      const logo = companyData.company_imgs.find((img: any) => img.image_type === 'logo');
      if (logo) logoUrl = logo.image_url;
    }

    const profileData = {
      customer_name: companyData?.company_name || `Công ty`,
      customer_avatar: logoUrl,
    };

    return { ...conv, latest_message: latest?.content, ...profileData };
  }));
};

export const getOrCreateConversation = async (
  companyId: string,
  customerId: string
): Promise<Conversation> => {
  const supabase = await createClient();

  // Tìm conversation đã tồn tại giữa khách hàng này và công ty
  const { data: existing } = await supabase
    .from("conversations")
    .select("conversation_id, company_id, customer_id, created_at, updated_at")
    .eq("company_id", companyId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0] as Conversation;
  }

  // Tạo conversation mới
  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({ company_id: companyId, customer_id: customerId })
    .select("conversation_id, company_id, customer_id, created_at, updated_at")
    .single();

  if (error) throw error;
  return newConv as Conversation;
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
