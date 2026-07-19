import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/Profile";

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

export const banAccount = async (userId: string) => {
  const { error, data } = await supabase
    .from("profiles")
    .update({ status: "banned" })
    .select("status")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Không thể khóa tài khoản: ${error.message}`);
  }

  return data;
};
