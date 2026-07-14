import { fetcher } from "@/lib/fetcher";
import type {
  InsertGuardInformationInput,
  CreateGuardAccountInput,
  CreateGuardAccountResponse,
  UploadGuardAvatarResponse,
  GetAllGuardsResponse,
  GetGuardDetailResponse,
  GetAllGuardsParams,
  UpdateGuardAccountInput
} from "../type";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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

export const requestGetGuardDetail = async (
  guard_id: string,
): Promise<GetGuardDetailResponse> => {
  return fetcher(`/api/guard/${encodeURIComponent(guard_id)}`, {
    method: "GET",
  });
};

export const requestGetAllGuards = ({
  page = 1,
  limit = 10,
  search = "",
  gender = "",
  status = "",
  workStatus = "",
}: GetAllGuardsParams = {}) => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (search.trim()) {
    searchParams.set("search", search.trim());
  }

  if (gender) {
    searchParams.set("gender", gender);
  }

  if (status) {
    searchParams.set("status", status);
  }

  if (workStatus) {
    searchParams.set("workStatus", workStatus);
  }

  return fetcher(`/api/guard?${searchParams.toString()}`, {
    method: "GET",
  });
};

export const requestGetGuardsByContract = ({
  contractId,
  page = 1,
  limit = 10,
  search = "",
}: {
  contractId: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (search.trim()) {
    searchParams.set("search", search.trim());
  }

  return fetcher(
    `/api/contracts/${encodeURIComponent(contractId)}/guards?${searchParams.toString()}`,
    {
      method: "GET",
    },
  );
};

export const requestGetCustomerGuardsByContract = ({
  contractId,
  customerId,
  page = 1,
  limit = 10,
  search = "",
}: {
  contractId: string;
  customerId: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const searchParams = new URLSearchParams();

  searchParams.set("customerId", customerId);
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));

  if (search.trim()) {
    searchParams.set("search", search.trim());
  }

  return fetcher(
    `/api/my-contracts/${encodeURIComponent(contractId)}/guards?${searchParams.toString()}`,
    {
      method: "GET",
    },
  );
};

export const requestUploadGuardFile = async (
  file: File,
  user_id: string,
  type: "avatar" | "cccd_front" | "cccd_back",
): Promise<UploadGuardAvatarResponse> => {
  const form_data = new FormData();

  form_data.append("user_id", user_id);
  form_data.append("file", file);
  form_data.append("type", type);

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
    throw new Error(data.message || "Không thể tải file lên.");
  }

  return data;
};

export const requestCheckGuardQuota = async (): Promise<{
  success: boolean;
  message: string;
  data?: {
    isExceeded: boolean;
    maxGuards: number | null;
    currentGuards: number;
  };
}> => {
  return fetcher("/api/guard/quota", {
    method: "GET",
  });
};

export const requestUpdateGuardProfile = async (guardId: string,
  input: UpdateGuardAccountInput) => {
  return fetcher(`/api/guard/${guardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}