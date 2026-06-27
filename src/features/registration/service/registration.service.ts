import { RegistrationWithCompany, RegistrationDetail } from "../types";
import {
  getRegistrations,
  getRegistrationDetail,
  updateRegistrationStatus,
  createRegistrationFlow,
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
  status: "approved" | "rejected"
): Promise<void> => {
  await updateRegistrationStatus(id, status);
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
