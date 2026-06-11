/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetcher = async (url: string, options?: any) => {
  const isFormData = options?.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(options?.headers || {}),
  };
  
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API_URL + url, {
    ...options,
    credentials: "include",
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
