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
  status: "approved" | "rejected",
  note?: string
) {
  return await fetcher(`/api/registrations/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status, note }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function requestSubmitRegistration(payload: {
  userId: string;
  profile: {
    fullName: string;
    phoneNumber: string;
    avatarUrl: string | null;
  };
  identity: {
    identityId: string;
    issueDate: string;
    issuePlace: string;
    frontUrl: string;
    backUrl: string;
  };
  company: {
    companyId?: string | null;
    companyName: string;
    businessLicenseNo: string;
    licenseFileUrl: string | null;
    address: any;
    email: string;
    phone: string;
    description: string | null;
  };
  images: {
    imageUrl: string;
    imageType: "logo" | "banner" | "other";
  }[];
}) {
  return await fetcher("/api/registrations/submit", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
