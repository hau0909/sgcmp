import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/Profile";
import { ReasonBan } from "@/types/ReasonBan";

export const getAllAccounts = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as Profile[]) || [];
};

export const getAccountByUserId = async (
  userId: string,
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Profile) || null;
};

export const banAccount = async (
  userId: string,
  reason: string,
  bannedBy: string
) => {
  const { error, data } = await supabase
    .from("profiles")
    .update({ status: "banned" })
    .select("status")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Không thể khóa tài khoản: ${error.message}`);
  }

  const { error: banReasonError } = await supabase
    .from("reason_ban")
    .insert({
      user_id: userId,
      reason: reason,
      banned_by: bannedBy,
    });

  if (banReasonError) {
    console.error("Lỗi khi lưu lý do khóa tài khoản:", banReasonError);
    throw new Error(`Không thể lưu lý do khóa tài khoản: ${banReasonError.message}`);
  }

  return data;
};

export const getBanReasonByUserId = async (
  userId: string
): Promise<ReasonBan | null> => {
  const { data, error } = await supabase
    .from("reason_ban")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Lỗi khi tải lý do khóa tài khoản:", error);
    return null;
  }

  return (data as ReasonBan) || null;
};

