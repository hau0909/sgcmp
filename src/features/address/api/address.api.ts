import { fetcher } from "@/lib/fetcher";

export async function requestGetCities() {
  return await fetcher("/api/address/cities", {
    method: "GET",
  });
}

export async function requestGetWards(cityId?: number) {
  const url =
    cityId !== undefined && !isNaN(cityId)
      ? `/api/address/wards?cityId=${cityId}`
      : "/api/address/wards";
  return await fetcher(url, {
    method: "GET",
  });
}
