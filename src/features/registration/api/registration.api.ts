import { fetcher } from "@/lib/fetcher";

export async function requestGetRegistrations() {
  return await fetcher("/api/registrations", {
    method: "GET",
  });
}

export async function requestGetRegistrationDetail(id: string) {
  return await fetcher(`/api/registrations/${id}`, {
    method: "GET",
  });
}

export async function requestUpdateRegistrationStatus(
  id: string,
  status: "approved" | "rejected"
) {
  return await fetcher(`/api/registrations/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
