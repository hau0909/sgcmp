import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/Profile";

export const updateProfile = async (
  userId: string,
  payload: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
  }
): Promise<void> => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: payload.fullName,
      phone_number: payload.phoneNumber,
      gender: payload.gender || null,
      date_of_birth: payload.dateOfBirth || null,
      address: payload.address || null,
    })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
};

export const getProfileByUserId = async (
  userId: string,
): Promise<Profile | null> => {
  const supabase = await createClient();

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

export const getProfilesByUserIds = async (
  userIds: string[],
): Promise<Profile[]> => {
  if (userIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", userIds);

  if (error) {
    throw error;
  }

  return (data as Profile[]) || [];
};