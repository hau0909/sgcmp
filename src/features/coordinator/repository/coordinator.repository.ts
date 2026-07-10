import { createClient } from "@/lib/supabase/server";
import { CoordinatorWithUser } from "../types";
import { supabase } from "@/lib/supabase";

export const getCoordinators = async (
  companyId: string,
  page = 1,
  limit = 10
): Promise<{ data: CoordinatorWithUser[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("coordinators")
    .select("*, profiles!inner(*)", { count: "exact" })
    .eq("company_id", companyId)
    .range(from, to);

  if (error) throw error;

  if (!data || data.length === 0) {
    return { data: [], total: 0 };
  }

  return {
    data: data as unknown as CoordinatorWithUser[],
    total: count || 0,
  };
};

export const insertCoordinatorRecord = async (
  userId: string,
  companyId: string
): Promise<void> => {
  const supabaseServer = await createClient();

  const { error } = await supabaseServer.from("coordinators").insert({
    user_id: userId,
    company_id: companyId,
  });

  if (error) throw error;
};

export const getCoordinatorById = async (
  coordinatorId: string
): Promise<CoordinatorWithUser> => {
  const supabaseServer = await createClient();

  const { data, error } = await supabaseServer
    .from("coordinators")
    .select("*, profiles!inner(*)")
    .eq("coordinator_id", coordinatorId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Coordinator không tồn tại");

  return data as unknown as CoordinatorWithUser;
};
