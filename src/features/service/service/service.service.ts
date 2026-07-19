import type { Service } from "@/types/Service";

import { getServiceById, getAllServices, createService, updateService, deleteService } from "../repository/service.repository";

export const getServiceByIdService = async (
  serviceId: string,
): Promise<Service | null> => {
  return await getServiceById(serviceId);
};

export const getAllServicesService = async (): Promise<Service[]> => {
  return await getAllServices();
};

export const createServiceService = async (payload: {
  name: string;
  description: string;
}): Promise<Service> => {
  return await createService(payload);
};

export const updateServiceService = async (
  serviceId: string,
  payload: { name?: string; description?: string }
): Promise<Service> => {
  return await updateService(serviceId, payload);
};

export const deleteServiceService = async (serviceId: string): Promise<void> => {
  return await deleteService(serviceId);
};