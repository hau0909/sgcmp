/* eslint-disable @typescript-eslint/no-explicit-any */

export const fetcher = async (url: string, options?: any) => {
  const isFormData = options?.body instanceof FormData;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const requestUrl =
    typeof window !== "undefined" && url.startsWith("/")
      ? url
      : `${baseUrl}${url}`;

  const res = await fetch(requestUrl, {
    ...options,
    credentials: "include",
    headers: {
      ...(!isFormData && {
        "Content-Type": "application/json",
      }),
      ...(typeof window !== "undefined" && {
        "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        "x-locale": navigator.language,
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
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
};
