import { createClient } from "@/lib/supabase/server";
import { RegisterParams, LoginParams } from "../types";

export const registerAccount = async ({
  email,
  password,
  phone_number,
  full_name,
  isCoordinator = false,
  tempPass,
  tempPasswordExpiresAt,
}: RegisterParams) => {
  const supabase = await createClient();

  console.log("REGISTER PARAMS:", {
    email,
    password,
    phone_number,
    full_name,
    isCoordinator,
  });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_API_URL}/verify`,
      data: {
        full_name,
        phone_number,
        role: isCoordinator ? "coordinator" : "customer",
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

export const loginAccount = async ({ email, password }: LoginParams) => {
  const supabase = await createClient();

  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (loginError) {
    throw new Error(loginError.message);
  }

  const userId = loginData.user?.id;

  if (!userId) {
    throw new Error("Không tìm thấy thông tin tài khoản");
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, email, full_name, phone_number, role, status, avatar_url")
    .eq("user_id", userId)
    .single();

  if (profileError || !userProfile) {
    throw new Error("Không tìm thấy vai trò của tài khoản");
  }

  return {
    id: userProfile.user_id,
    email: userProfile.email,
    full_name: userProfile.full_name,
    phone_number: userProfile.phone_number,
    role: userProfile.role,
    status: userProfile.status,
    avatar_url: userProfile.avatar_url,
  };
};
