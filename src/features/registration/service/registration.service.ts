import { RegistrationWithCompany, RegistrationDetail } from "../types";
import {
  getRegistrations,
  getRegistrationDetail,
  updateRegistrationStatus,
  createRegistrationFlow,
  getRegistrationByOwnerId,
  updateRegistrationFlow,
  checkRegistrationDuplicatesRepo,
} from "../repository/registration.repository";


export const getRegistrationsService = async (): Promise<RegistrationWithCompany[]> => {
  const result = await getRegistrations();
  return result;
};

export const getRegistrationDetailService = async (id: string): Promise<RegistrationDetail | null> => {
  const result = await getRegistrationDetail(id);
  return result;
};

export const updateRegistrationStatusService = async (
  id: string,
  status: "approved" | "rejected",
  note?: string
): Promise<void> => {
  await updateRegistrationStatus(id, status, note);
};

export const createRegistrationFlowService = async (payload: {
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
}): Promise<string> => {
  return await createRegistrationFlow(payload);
};

export const getRegistrationByOwnerIdService = async (userId: string): Promise<RegistrationDetail | null> => {
  const result = await getRegistrationByOwnerId(userId);
  return result;
};

export const updateRegistrationFlowService = async (
  userId: string,
  registrationId: string,
  payload: Parameters<typeof updateRegistrationFlow>[2]
): Promise<void> => {
  // Validate duplicates explicitly for edit flow
  await checkRegistrationDuplicatesRepo(userId, {
    phoneNumber: payload.profile.phoneNumber,
    identityId: payload.identity.identityId,
    businessLicenseNo: payload.company.businessLicenseNo,
  });

  await updateRegistrationFlow(userId, registrationId, payload);
};
