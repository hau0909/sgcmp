import { createClient } from "@/lib/supabase/server";

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
