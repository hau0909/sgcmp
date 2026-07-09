import { Verification, VerificationStatus } from "../types";
import { UpdateVerificationInput } from "../validator/verification.validate";
import {
  getVerificationByBookingId,
  createVerification,
  updateVerification,
  getVerificationsByCompanyId,
  VerificationWithBooking,
} from "../repository/verification.repository";

export type { VerificationWithBooking };

export const getVerificationService = async (
  bookingId: string
): Promise<Verification | null> => {
  return await getVerificationByBookingId(bookingId);
};

export const createVerificationService = async (
  bookingId: string
): Promise<Verification> => {
  const existing = await getVerificationByBookingId(bookingId);
  if (existing) {
    throw new Error("Phiên khảo sát cho yêu cầu này đã tồn tại.");
  }
  return await createVerification(bookingId);
};

export const getVerificationsByCompanyService = async (
  companyId: string,
  page: number,
  limit: number,
  status?: VerificationStatus
): Promise<{ verifications: VerificationWithBooking[]; totalCount: number }> => {
  const { data, count } = await getVerificationsByCompanyId(companyId, page, limit, status);
  return { verifications: data, totalCount: count };
};

export const updateVerificationService = async (
  bookingId: string,
  updates: UpdateVerificationInput
): Promise<Verification> => {
  const existing = await getVerificationByBookingId(bookingId);
  if (!existing) {
    throw new Error("Không tìm thấy phiên khảo sát cho yêu cầu này.");
  }
  return await updateVerification(bookingId, updates);
};
