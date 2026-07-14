import { Verification, VerificationStatus } from "../types";
import { UpdateVerificationInput } from "../validator/verification.validate";
import {
  getVerificationService,
  createVerificationService,
  updateVerificationService,
  getVerificationsByCompanyService,
  VerificationWithBooking,
} from "../service/verification.service";

export type { VerificationWithBooking };

export const handleGetVerificationsByCompany = async (
  companyId: string,
  page: number,
  limit: number,
  status?: VerificationStatus
): Promise<{ verifications: VerificationWithBooking[]; totalCount: number }> => {
  return await getVerificationsByCompanyService(companyId, page, limit, status);
};

export const handleGetVerification = async (
  bookingId: string
): Promise<Verification | null> => {
  return await getVerificationService(bookingId);
};

export const handleCreateVerification = async (
  bookingId: string
): Promise<Verification> => {
  return await createVerificationService(bookingId);
};

export const handleUpdateVerification = async (
  bookingId: string,
  updates: UpdateVerificationInput
): Promise<Verification> => {
  return await updateVerificationService(bookingId, updates);
};
