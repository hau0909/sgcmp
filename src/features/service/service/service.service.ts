import type { Service } from "@/types/Service";

import { getServiceById } from "../repository/service.repository";

export const getServiceByIdService = async (
  serviceId: string,
): Promise<Service | null> => {
  return await getServiceById(serviceId);
};