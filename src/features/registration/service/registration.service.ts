import { RegistrationWithCompany } from "../types";
import { getRegistrations } from "../repository/registration.repository";

export const getRegistrationsService = async (): Promise<RegistrationWithCompany[]> => {
  const result = await getRegistrations();
  return result;
};
