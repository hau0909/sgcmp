import { fetcher } from "@/lib/fetcher";

interface CreateIdentityPayload {
  userId: string;
  identityId: string;
  issueDate: string;
  issuePlace: string;
  frontUrl?: string;
  backUrl?: string;
}

export const requestCreateIdentity = async (
  payload: CreateIdentityPayload
): Promise<{ success: boolean; message: string }> => {
  return fetcher("/api/identities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
