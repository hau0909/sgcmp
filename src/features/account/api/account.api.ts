import { fetcher } from "@/lib/fetcher";

export async function requestGetAllAccounts() {
  return await fetcher("/api/admin/accounts", {
    method: "GET",
  });
}

export async function requestGetAccountDetail(userId: string) {
  return await fetcher(`/api/admin/accounts/${userId}`, {
    method: "GET",
  });
}

export async function requestBanAccount(userId: string) {
  return await fetcher(`/api/admin/accounts/${userId}/banned`, {
    method: "PATCH",
  });
}
