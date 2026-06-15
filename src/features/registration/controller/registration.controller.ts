import { RegistrationWithCompany, RegistrationDetail } from "../types";
import {
  getRegistrationsService,
  getRegistrationDetailService,
  updateRegistrationStatusService,
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
  status: "approved" | "rejected"
): Promise<void> => {
  await updateRegistrationStatusService(id, status);
};
