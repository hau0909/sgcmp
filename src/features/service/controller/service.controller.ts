import { getAllServicesService, createServiceService, updateServiceService, deleteServiceService } from "../service/service.service";
import { validateCreateServiceInput, validateUpdateServiceInput } from "../validator/service.validate";
import type { Service } from "@/types/Service";

export const handleGetServices = async (): Promise<Service[]> => {
  return await getAllServicesService();
};

export const handleCreateService = async (payload: {
  name: string;
  description: string;
}): Promise<{ success: boolean; message: string; service?: Service }> => {
  try {
    validateCreateServiceInput(payload);

    const service = await createServiceService(payload);
    return { success: true, message: "Tạo dịch vụ thành công", service };
  } catch (error: any) {
    console.error("[Service Controller] Error creating service:", error);
    return {
      success: false,
      message: error?.message || "Đã có lỗi xảy ra khi tạo dịch vụ",
    };
  }
};

export const handleUpdateService = async (
  serviceId: string,
  payload: { name?: string; description?: string }
): Promise<{ success: boolean; message: string; service?: Service }> => {
  try {
    if (!serviceId) {
      return { success: false, message: "Thiếu ID dịch vụ." };
    }

    validateUpdateServiceInput(payload);

    const service = await updateServiceService(serviceId, payload);
    return { success: true, message: "Cập nhật dịch vụ thành công", service };
  } catch (error: any) {
    console.error("[Service Controller] Error updating service:", error);
    return {
      success: false,
      message: error?.message || "Đã có lỗi xảy ra khi cập nhật dịch vụ",
    };
  }
};

export const handleDeleteService = async (
  serviceId: string
): Promise<{ success: boolean; message: string }> => {
  try {
     if (!serviceId) {
       return { success: false, message: "Thiếu ID dịch vụ." };
     }
     await deleteServiceService(serviceId);
     return { success: true, message: "Xóa dịch vụ thành công" };
  } catch (error: any) {
     console.error("[Service Controller] Error deleting service:", error);
     return {
       success: false,
       message: error?.message || "Đã có lỗi xảy ra khi xóa dịch vụ",
     };
  }
};
