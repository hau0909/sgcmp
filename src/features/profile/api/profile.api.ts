import { fetcher } from "@/lib/fetcher";

interface UpdateProfilePayload {
  userId: string;
  fullName: string;
  phoneNumber: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  avatarUrl?: string;
}

export const requestUpdateProfile = async (
  payload: UpdateProfilePayload
): Promise<{ success: boolean; message: string }> => {
  return fetcher("/api/profiles", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};
