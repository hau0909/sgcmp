import { createClient } from "@/lib/supabase/server";
import { RegisterParams } from "../types";

export const registerAccount = async ({
  email,
  password,
  phoneNumber,
  fullName,
  isCoordinator,
  tempPass,
  tempPasswordExpiresAt,
}: RegisterParams) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_API_URL}/verify`,
      data: {
        fullname: fullName,
        phonenumber: phoneNumber,
        role: isCoordinator ? "Coordinator" : "customer",
        is_coordinator: isCoordinator,
        must_change_password: isCoordinator,
        temp_password: isCoordinator ? tempPass : undefined,
        temp_password_expires_at: isCoordinator
          ? tempPasswordExpiresAt
          : undefined,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};
