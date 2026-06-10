import { createClient } from "@/lib/supabase/server";

export const createIdentity = async (
  userId: string,
  identityId: string,
  issueDate: string,
  issuePlace: string
): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase.from("identities").insert({
    user_id: userId,
    identity_id: identityId,
    issue_date: issueDate,
    issue_place: issuePlace,
  });

  if (error) throw error;
};

export const checkIdentityExists = async (
  identityId: string
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
