/* eslint-disable @typescript-eslint/no-explicit-any */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetcher = async (url: string, options?: any) => {
  const isFormData = options?.body instanceof FormData;

  const res = await fetch(API_URL + url, {
    ...options,
    credentials: "include",
    headers: {
      ...(!isFormData && {
        "Content-Type": "application/json",
      }),
      ...(options?.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const responseText = await res.text();

    console.error("API returned non-JSON response:", {
      url,
      status: res.status,
      responseText,
    });

    throw new Error("API không trả về dữ liệu JSON.");
  }

  const data = await res.json();

  if (!res.ok) {
    const error: any = new Error(data.message || data.error || "Request failed");
    error.data = data;
    throw error;
  }

  return data;
};
