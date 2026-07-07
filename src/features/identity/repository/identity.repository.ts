import { createClient } from "@/lib/supabase/server";
import { IdentityDetail } from "../type";

export const createIdentity = async (
  userId: string,
  identityId: string,
  issueDate: string,
  issuePlace: string,
  frontUrl?: string,
  backUrl?: string,
): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase.from("identities").insert({
    user_id: userId,
    identity_id: identityId,
    issue_date: issueDate,
    issue_place: issuePlace,
    front_url: frontUrl ?? null,
    back_url: backUrl ?? null,
  });

  if (error) throw error;
};

export const checkIdentityExists = async (
  identityId: string,
): Promise<boolean> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("identities")
    .select("identity_id")
    .eq("identity_id", identityId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
};

export const getIdentityByUserId = async (
  user_id: string,
): Promise<IdentityDetail | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("identities")
    .select(
      `
      identity_id,
      issue_date,
      issue_place,
      front_url,
      back_url
    `,
    )
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
