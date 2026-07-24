import { RegistrationWithCompany, RegistrationDetail } from "../types";
import {
  getRegistrationsService,
  getRegistrationDetailService,
  updateRegistrationStatusService,
  createRegistrationFlowService,
  getRegistrationByOwnerIdService,
} from "../service/registration.service";


export const handleGetRegistrations = async (): Promise<RegistrationWithCompany[]> => {
  const result = await getRegistrationsService();
  return result;
};

export const handleGetRegistrationDetail = async (id: string): Promise<RegistrationDetail | null> => {
  const result = await getRegistrationDetailService(id);
  return result;
};

export const handleUpdateRegistrationStatus = async (
  id: string,
  status: "approved" | "rejected",
  note?: string
): Promise<void> => {
  await updateRegistrationStatusService(id, status, note);
};

export const handleCreateRegistrationFlow = async (payload: {
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
  return await createRegistrationFlowService(payload);
};

export const handleGetMyRegistration = async (userId: string): Promise<RegistrationDetail | null> => {
  const result = await getRegistrationByOwnerIdService(userId);
  return result;
};
