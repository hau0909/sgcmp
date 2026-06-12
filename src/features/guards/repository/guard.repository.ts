import { createClient } from "@/lib/supabase/server";

import type {
  InsertGuardInformationParams,
  UploadGuardAvatarRepositoryParams,
  UploadGuardAvatarResult,
} from "../type";

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
  const supabase = await createClient();

  const file_extension = file.name.split(".").pop()?.toLowerCase();

  if (!file_extension) {
    throw new Error("Không xác định được định dạng ảnh.");
  }

  const file_path = `${user_id}/avatar-${Date.now()}.${file_extension}`;

  const { data: upload_data, error: upload_error } = await supabase.storage
    .from("guard-avatars")
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
  } = supabase.storage.from("guard-avatars").getPublicUrl(upload_data.path);

  return {
    file_path: upload_data.path,
    public_url,
  };
};
