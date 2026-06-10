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

  const userProfile = await getUserProfile(userId);

  let company = null;

  if (userProfile.role === "company-admin") {
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select(
        `
        company_id,
        owner_id,
        company_name,
        business_license_no,
        license_file_url,
        address,
        description,
        rating_average,
        status,
        created_at
        `,
      )
      .eq("owner_id", userId)
      .single();

    if (companyError || !companyData) {
      throw new Error("Không tìm thấy thông tin công ty của tài khoản");
    }

    company = companyData;
  }

  return {
    ...userProfile,
    company,
  };
};

export const getUserProfile = async (userId: string) => {
  const supabase = await createClient();

  if (!userId) {
    throw new Error("Không tìm thấy user id");
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      user_id,
      email,
      full_name,
      phone_number,
      gender,
      date_of_birth,
      address,
      role,
      avatar_url,
      status,
      created_at,
      updated_at
      `,
    )
    .eq("user_id", userId)
    .single();

  if (profileError || !userProfile) {
    throw new Error("Không tìm thấy thông tin người dùng");
  }

  return {
    user_id: userProfile.user_id,
    email: userProfile.email,
    full_name: userProfile.full_name,
    phone_number: userProfile.phone_number,
    gender: userProfile.gender,
    date_of_birth: userProfile.date_of_birth,
    address: userProfile.address,
    role: userProfile.role,
    avatar_url: userProfile.avatar_url,
    status: userProfile.status,
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at,
  };
};
