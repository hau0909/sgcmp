import { fetcher } from "@/lib/fetcher";
import { Verification, VerificationStatus } from "../types";

export interface VerificationListItem {
  verification_id: string;
  booking_id: string;
  status: VerificationStatus;
  description: string | null;
  images: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  booking: {
    customer_name: string;
    service_name: string;
    address: string;
    start_date: string;
  };
}

export async function requestGetVerificationsByCompany(
  companyId: string,
  page: number,
  limit: number,
  status?: VerificationStatus
): Promise<{ verifications: VerificationListItem[]; totalCount: number }> {
  const query = new URLSearchParams({ companyId, page: String(page), limit: String(limit) });
  if (status) query.append("status", status);
  return await fetcher(`/api/verifications?${query.toString()}`, { method: "GET" });
}



export async function requestGetVerification(
  bookingId: string
): Promise<{ verification: Verification | null }> {
  return await fetcher(`/api/bookings/${bookingId}/verification`, {
    method: "GET",
  });
}

export async function requestCreateVerificationSession(
  bookingId: string
): Promise<{ verification: Verification }> {
  return await fetcher(`/api/bookings/${bookingId}/verification`, {
    method: "POST",
  });
}

export async function requestUpdateVerification(
  bookingId: string,
  updates: {
    status?: VerificationStatus;
    description?: string;
    notes?: string;
    images?: string[];
  }
): Promise<{ verification: Verification }> {
  return await fetcher(`/api/bookings/${bookingId}/verification`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
