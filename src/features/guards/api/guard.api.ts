import { fetcher } from "@/lib/fetcher";
import type {
  InsertGuardInformationInput,
  CreateGuardAccountInput,
  CreateGuardAccountResponse,
  UploadGuardAvatarResponse,
} from "../type";

export const requestInsertGuardInformation = async (
  input: InsertGuardInformationInput,
) => {
  return fetcher("/api/guard", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

export const requestCreateGuardAccount = async (
  input: CreateGuardAccountInput,
): Promise<CreateGuardAccountResponse> => {
  return fetcher("/api/guard/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

export const requestUploadGuardAvatar = async (
  file: File,
  user_id: string,
): Promise<UploadGuardAvatarResponse> => {
  const form_data = new FormData();

  form_data.append("user_id", user_id);
  form_data.append("avatar_file", file);

  const response = await fetch("/api/guard/upload", {
    method: "POST",
    body: form_data,
    credentials: "include",
  });

  const content_type = response.headers.get("content-type");

  if (!content_type?.includes("application/json")) {
    throw new Error("Phản hồi từ server không hợp lệ.");
  }

  const data: UploadGuardAvatarResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải ảnh bảo vệ.");
  }

  return data;
};
