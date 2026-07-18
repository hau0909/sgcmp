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
  userId: string
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
