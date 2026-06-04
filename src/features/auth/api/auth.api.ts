import { fetcher } from "@/lib/fetcher";

type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
};

export async function requestRegisterAccount(payload: RegisterPayload) {
  const result = await fetcher("/api/auth", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return result;
}
