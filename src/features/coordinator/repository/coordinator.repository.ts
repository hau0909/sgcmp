import { supabase } from "@/lib/supabase";
import { CoordinatorWithUser } from "../types";

export const getCoordinators = async (
  companyId: string,
  page = 1,
  limit = 10
): Promise<{ data: CoordinatorWithUser[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("coordinators")
    .select("*, profiles!inner(*)", { count: "exact" })
  const { data, error, count } = await query;

  if (error) throw error;

  if (!data || data.length === 0) {
    return { data: [], total: 0 };
  }

  // Khỏi cần map, data trả về đã match chính xác snake_case của CoordinatorWithUser
  return {
    data: data as unknown as CoordinatorWithUser[],
    total: count || 0,
  };
};
