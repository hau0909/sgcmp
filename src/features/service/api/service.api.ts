import type { Service } from "@/types/Service";

export async function requestGetAdminServices(): Promise<Service[]> {
  const res = await fetch("/api/admin/services", { method: "GET" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Lỗi khi tải danh sách dịch vụ");
  }
  return data.services as Service[];
}

export async function requestCreateService(payload: {
  name: string;
  description: string;
}): Promise<{ success: boolean; message: string; service?: Service }> {
  const res = await fetch("/api/admin/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data.error || "Lỗi khi tạo dịch vụ" };
  }
  return data;
}

export async function requestUpdateService(
  serviceId: string,
  payload: { name?: string; description?: string }
): Promise<{ success: boolean; message: string; service?: Service }> {
  const res = await fetch(`/api/admin/services/${serviceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data.message || "Lỗi khi cập nhật dịch vụ" };
  }
  return data;
}

export async function requestDeleteService(
  serviceId: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/services/${serviceId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data.message || "Lỗi khi xóa dịch vụ" };
  }
  return data;
}
