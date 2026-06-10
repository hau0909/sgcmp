import { RegistrationWithCompany, RegistrationDetail } from "../types";
import {
  getRegistrations,
  getRegistrationDetail,
  updateRegistrationStatus,
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
