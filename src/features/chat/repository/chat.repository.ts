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

/**
 * Lấy tất cả conversations mà một customer đã tham gia (dùng cho widget phía khách hàng)
 */
export const getConversationsByCustomerId = async (
  customerId: string
): Promise<ConversationWithDetails[]> => {
  const supabase = await createClient();

  // Lấy tất cả conversation_id mà customer đã nhắn tin
  const { data: msgRows, error: msgErr } = await supabase
    .from("messages")
    .select("conversation_id")
    .eq("sender_id", customerId);

  if (msgErr) throw msgErr;
  if (!msgRows || msgRows.length === 0) return [];

  const conversationIds = [...new Set(msgRows.map(r => r.conversation_id))];

  // Lấy thông tin các conversation đó
  const { data: convs, error } = await supabase
    .from("conversations")
    .select("conversation_id, company_id, created_at, updated_at")
    .in("conversation_id", conversationIds)
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
    .select("conversation_id, company_id, created_at, updated_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (existing && existing.length > 0) {
    // Kiểm tra xem có conversation nào mà customer đã từng nhắn không
    for (const conv of existing) {
      const { data: msg } = await supabase
        .from("messages")
        .select("message_id")
        .eq("conversation_id", conv.conversation_id)
        .eq("sender_id", customerId)
        .limit(1);
      if (msg && msg.length > 0) {
        return conv as Conversation;
      }
    }
  }

  // Tạo conversation mới
  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({ company_id: companyId })
    .select("conversation_id, company_id, created_at, updated_at")
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
