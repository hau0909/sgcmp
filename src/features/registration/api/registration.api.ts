import { fetcher } from "@/lib/fetcher";

export async function requestGetRegistrations() {
  return await fetcher("/api/registrations", {
    method: "GET",
  });
}
