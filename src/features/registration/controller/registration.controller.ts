import { RegistrationWithCompany } from "../types";
import { getRegistrationsService } from "../service/registration.service";

export const handleGetRegistrations = async (): Promise<RegistrationWithCompany[]> => {
  const result = await getRegistrationsService();
  return result;
};
