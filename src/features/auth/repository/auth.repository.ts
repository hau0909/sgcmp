import { createClient } from "@/lib/supabase/server";
import { RegisterParams, LoginParams } from "../types";

export const registerAccount = async ({
  email,
  password,
  phone_number,
  full_name,
  role,
  tempPass,
  tempPasswordExpiresAt,
  registration_type,
  company_name,
  business_license_no,
  company_email,
  company_phone,
}: RegisterParams) => {
  const supabase = await createClient();

  const isTemporaryAccount = role === "guard" || role === "Coordinator";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_API_URL}/verify`,
      data: {
        full_name,
        phone_number,
        role,
        must_change_password: isTemporaryAccount,
        temp_password: isTemporaryAccount ? tempPass : null,
        temp_password_expires_at: isTemporaryAccount
          ? tempPasswordExpiresAt
          : null,
        // Company registration metadata (read by email template)
        registration_type: registration_type ?? null,
        company_name: company_name ?? null,
        business_license_no: business_license_no ?? null,
        company_email: company_email ?? null,
        company_phone: company_phone ?? null,
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
      email: email.trim().toLowerCase(),
      password,
    });

  if (loginError) {
    throw new Error(loginError.message);
  }

  const userId = loginData.user?.id;

  if (!userId) {
    throw new Error("Không tìm thấy thông tin tài khoản.");
  }

  let tempUserProfile: Awaited<ReturnType<typeof getUserProfile>> | null = null;
  try {
    tempUserProfile = await getUserProfile(userId);
  } catch (err) {
    // Bỏ qua lỗi nếu không tìm thấy profile để tránh block việc kiểm tra xác thực email
  }

  if (!loginData.user.email_confirmed_at) {
    await supabase.auth.signOut();

    if (tempUserProfile && tempUserProfile.status === "unactive") {
      throw new Error("Email chưa được xác thực. Vui lòng kiểm tra email");
    }

    throw new Error(
      "Email chưa được xác thực. Vui lòng kiểm tra email trước khi đăng nhập.",
    );
  }

  const activeProfile = tempUserProfile || (await getUserProfile(userId));

  let companyId: string | null = null;
  let company = null;

  if (activeProfile.role === "company-admin") {
    const { data, error } = await supabase
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

    if (error) {
      await supabase.auth.signOut();

      throw new Error(`Không thể lấy thông tin công ty: ${error.message}`);
    }

    company = data;
    companyId = data.company_id;
  }

  if (activeProfile.role === "Coordinator") {
    const { data, error } = await supabase
      .from("coordinators")
      .select("company_id")
      .eq("user_id", userId)
      .single();

    if (error) {
      await supabase.auth.signOut();

      throw new Error(
        `Không thể lấy thông tin điều phối viên: ${error.message}`,
      );
    }

    companyId = data.company_id;
  }

  if (activeProfile.role === "guard") {
    const { data, error } = await supabase
      .from("guards")
      .select("company_id")
      .eq("user_id", userId)
      .single();

    if (error) {
      await supabase.auth.signOut();

      throw new Error(`Không thể lấy thông tin bảo vệ: ${error.message}`);
    }

    companyId = data.company_id;
  }

  return {
    ...activeProfile,
    user_id: userId,
    company_id: companyId,
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

export const getCurrentUser = async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
};

export const logoutUser = async () => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
