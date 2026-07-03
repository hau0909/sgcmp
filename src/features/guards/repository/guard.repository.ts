import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import type {
  InsertGuardInformationParams,
  UploadGuardAvatarRepositoryParams,
  UploadGuardAvatarResult,
  GuardListItem,
  GuardDetailDatabase,
  GetAllGuardsRepositoryParams,
  GetAllGuardsRepositoryResult,
} from "../type";
import { Guard } from "@/types/Guard";

export const insertGuardInformation = async ({
  user_id,
  company_id,
  full_name,
  phone_number,
  email,
  date_of_birth,
  gender,
  address,
  avatar_url,
}: InsertGuardInformationParams) => {
  const supabase = await createClient();

  const { data: profile, error: profile_error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone_number,
      email,
      date_of_birth,
      gender,
      address,
      avatar_url: avatar_url ?? null,
      role: "guard",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user_id)
    .select()
    .single();

  if (profile_error) {
    throw new Error(`Không thể cập nhật profile Guard`);
  }

  const { data: guard, error: guard_error } = await supabase
    .from("guards")
    .insert({
      user_id,
      company_id,
    })
    .select("guard_id, user_id, company_id, created_at")
    .single();

  if (guard_error) {
    throw new Error(`Không thể thêm Guard`);
  }

  return {
    profile,
    guard,
  };
};

export const getCoordinatorCompanyId = async (
  user_id: string,
): Promise<string> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coordinators")
    .select("company_id")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Get Coordinator Company Error:", error);
    throw error;
  }

  if (!data?.company_id) {
    throw new Error("Không tìm thấy công ty của Coordinator.");
  }

  return data.company_id;
};

export const uploadGuardAvatar = async ({
  user_id,
  file,
}: UploadGuardAvatarRepositoryParams): Promise<UploadGuardAvatarResult> => {
  const authSupabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const { data: currentProfile, error: profileError } = await authSupabase
    .from("profiles")
    .select("user_id, role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !currentProfile) {
    throw new Error("Không tìm thấy hồ sơ người dùng hiện tại.");
  }

  if (currentProfile.role !== "Coordinator") {
    throw new Error("Bạn không có quyền tải ảnh bảo vệ.");
  }

  const bucket_name = "profiles";

  const file_extension = file.name.split(".").pop()?.toLowerCase();

  if (!file_extension) {
    throw new Error("Không xác định được định dạng ảnh.");
  }

  const allowedExtensions = ["jpg", "jpeg", "png"];

  if (!allowedExtensions.includes(file_extension)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, JPEG hoặc PNG.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File tải lên không phải là ảnh.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ảnh không được vượt quá 2MB.");
  }

  const file_name = `avatar-${Date.now()}.${file_extension}`;
  const file_path = `${user_id}/avatar/${file_name}`;

  const supabaseAdmin = createAdminClient();

  const { data: upload_data, error: upload_error } = await supabaseAdmin.storage
    .from(bucket_name)
    .upload(file_path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (upload_error) {
    console.error("Upload Guard Avatar Error:", upload_error);
    throw new Error(upload_error.message);
  }

  const {
    data: { publicUrl: public_url },
  } = supabaseAdmin.storage.from(bucket_name).getPublicUrl(file_path);

  return {
    file_path: upload_data.path,
    public_url,
  };
};

export const uploadGuardFile = async ({
  user_id,
  file,
  type,
}: {
  user_id: string;
  file: File;
  type: "avatar" | "cccd_front" | "cccd_back";
}): Promise<UploadGuardAvatarResult> => {
  const authSupabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const { data: currentProfile, error: profileError } = await authSupabase
    .from("profiles")
    .select("user_id, role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !currentProfile) {
    throw new Error("Không tìm thấy hồ sơ người dùng hiện tại.");
  }

  if (currentProfile.role !== "Coordinator") {
    throw new Error("Bạn không có quyền tải ảnh bảo vệ.");
  }

  const bucket_name = "profiles";

  const file_extension = file.name.split(".").pop()?.toLowerCase();

  if (!file_extension) {
    throw new Error("Không xác định được định dạng ảnh.");
  }

  const allowedExtensions = ["jpg", "jpeg", "png"];

  if (!allowedExtensions.includes(file_extension)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, JPEG hoặc PNG.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File tải lên không phải là ảnh.");
  }

  if (type === "avatar" && file.size > 2 * 1024 * 1024) {
    throw new Error("Ảnh không được vượt quá 2MB.");
  }

  let file_name = "";
  let file_path = "";

  if (type === "avatar") {
    file_name = `avatar-${Date.now()}.${file_extension}`;
    file_path = `${user_id}/avatar/${file_name}`;
  } else if (type === "cccd_front") {
    file_name = `cccd-front-${Date.now()}.${file_extension}`;
    file_path = `${user_id}/identity/${file_name}`;
  } else if (type === "cccd_back") {
    file_name = `cccd-back-${Date.now()}.${file_extension}`;
    file_path = `${user_id}/identity/${file_name}`;
  }

  const supabaseAdmin = createAdminClient();

  const { data: upload_data, error: upload_error } = await supabaseAdmin.storage
    .from(bucket_name)
    .upload(file_path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (upload_error) {
    console.error("Upload Guard File Error:", upload_error);
    throw new Error(upload_error.message);
  }

  const {
    data: { publicUrl: public_url },
  } = supabaseAdmin.storage.from(bucket_name).getPublicUrl(file_path);

  return {
    file_path: upload_data.path,
    public_url,
  };
};

export const getAllGuards = async ({
  company_id,
  page,
  limit,
  search,
}: GetAllGuardsRepositoryParams): Promise<GetAllGuardsRepositoryResult> => {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let matchedUserIds: string[] | null = null;

  const keyword = search?.trim();

  if (keyword) {
    const safeKeyword = keyword.replace(/[,()]/g, " ");
    const searchPattern = `%${safeKeyword}%`;

    const { data: matchedProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .or(
        `full_name.ilike.${searchPattern},phone_number.ilike.${searchPattern},email.ilike.${searchPattern}`,
      );

    if (profileError) {
      throw new Error(profileError.message);
    }

    matchedUserIds = (matchedProfiles ?? []).map((profile) => profile.user_id);

    if (matchedUserIds.length === 0) {
      return {
        guards: [],
        total: 0,
      };
    }
  }

  let query = supabase
    .from("guards")
    .select(
      `
      guard_id,
      profiles!guards_user_id_fkey (
        user_id,
        full_name,
        phone_number,
        avatar_url,
        email,
        status
      )
    `,
      {
        count: "exact",
      },
    )
    .eq("company_id", company_id)
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (matchedUserIds) {
    query = query.in("user_id", matchedUserIds);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    guards: (data ?? []) as unknown as GuardListItem[],
    total: count ?? 0,
  };
};

export const getCompanyByOwnerId = async (
  owner_id: string,
): Promise<string> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("company_id")
    .eq("owner_id", owner_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.company_id;
};

export const getGuardDetail = async (
  guard_id: string,
  company_id: string,
): Promise<GuardDetailDatabase | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select(
      `
      guard_id,
      user_id,
      company_id,

      profiles!guards_user_id_fkey (
        full_name,
        phone_number,
        email,
        gender,
        date_of_birth,
        address,
        avatar_url
      )
    `,
    )
    .eq("guard_id", guard_id)
    .eq("company_id", company_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as GuardDetailDatabase | null;
};

export const getGuardIdByUserId = async (
  userId: string,
): Promise<string | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("guard_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Get Guard ID By User ID Error:", error);
    throw new Error(error.message);
  }

  return data?.guard_id ?? null;
};

export const getGuardByUserId = async (
  userId: string,
): Promise<Guard | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Guard) || null;
};

export const getGuardsByIds = async (guardIds: string[]): Promise<Guard[]> => {
  if (guardIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("*")
    .in("guard_id", guardIds);

  if (error) {
    throw error;
  }

  return (data as Guard[]) || [];
};

export const getGuardCountByCompanyId = async (
  company_id: string,
): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("guards")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company_id);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};
