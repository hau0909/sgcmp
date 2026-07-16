import { createClient } from "@/lib/supabase/server";
import { CoordinatorWithUser } from "../types";
import { supabase } from "@/lib/supabase";

export const getCoordinators = async (
  companyId: string,
  page = 1,
  limit = 10,
  search?: string
): Promise<{ data: CoordinatorWithUser[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("coordinators")
    .select("*, profiles!inner(*)", { count: "exact" })
    .eq("company_id", companyId);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`, { foreignTable: "profiles" });
  }

  const { data, error, count } = await query.range(from, to);

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

export const updateCoordinatorInfo = async (
  userId: string,
  payload: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    identityId: string;
    issueDate: string;
    issuePlace: string;
    avatarUrl?: string;
    frontUrl?: string;
    backUrl?: string;
  }
): Promise<void> => {
  const supabaseServer = await createClient();

  const profileUpdateData: any = {
    full_name: payload.fullName,
    phone_number: payload.phoneNumber,
    gender: payload.gender || null,
    date_of_birth: payload.dateOfBirth || null,
    address: payload.address || null,
  };
  if (payload.avatarUrl !== undefined) {
    profileUpdateData.avatar_url = payload.avatarUrl;
  }

  const { error: profileError } = await supabaseServer
    .from("profiles")
    .update(profileUpdateData)
    .eq("user_id", userId);

  if (profileError) throw profileError;

  // Update identity
  // Note: an upsert or check may be needed in case identity doesn't exist,
  // but typically coordinators always have identities from registration.
  const identityUpdateData: any = {
    identity_id: payload.identityId,
    issue_date: payload.issueDate,
    issue_place: payload.issuePlace,
  };
  if (payload.frontUrl !== undefined) {
    identityUpdateData.front_url = payload.frontUrl;
  }
  if (payload.backUrl !== undefined) {
    identityUpdateData.back_url = payload.backUrl;
  }

  const { error: identityError } = await supabaseServer
    .from("identities")
    .update(identityUpdateData)
    .eq("user_id", userId);

  if (identityError) throw identityError;
};

export const getCoordinatorCountByCompanyId = async (
  companyId: string,
): Promise<number> => {
  const supabaseServer = await createClient();

  const { count, error } = await supabaseServer
    .from("coordinators")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId);

  if (error) throw error;
  return count ?? 0;
};
