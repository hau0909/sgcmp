import { fetcher } from "@/lib/fetcher";
import { RegisterPayload, LoginPayload } from "../types";

export const requestRegisterAccount = async (payload: RegisterPayload) => {
  const result = await fetcher("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result;
};

export const requestLoginAccount = async (payload: LoginPayload) => {
  const result = await fetcher("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result;
};
