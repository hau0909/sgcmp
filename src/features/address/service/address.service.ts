import { CompanyAddress, City, Ward } from "../types";
import {
  getCities,
  getWards,
  getWardsByCityId,
  getAddressDetails,
} from "../repository/address.repository";

export const getCitiesService = async (): Promise<City[]> => {
  return await getCities();
};

export const getWardsService = async (cityId?: number): Promise<Ward[]> => {
  if (cityId !== undefined && !isNaN(cityId)) {
    return await getWardsByCityId(cityId);
  }
  return await getWards();
};

export const formatAddressService = async (
  address: CompanyAddress | string | null | undefined
): Promise<string> => {
  if (!address) {
    return "Địa chỉ chưa cập nhật";
  }

  if (typeof address === "string") {
    try {
      const parsed = JSON.parse(address) as CompanyAddress;
      if (parsed && typeof parsed === "object" && parsed.city_id && parsed.ward_id) {
        return await formatAddressObject(parsed);
      }
    } catch {
      // Not a JSON string, treat it as a direct string address
      return address;
    }
    return address;
  }

  if (address && typeof address === "object" && address.city_id && address.ward_id) {
    return await formatAddressObject(address);
  }

  return "Địa chỉ không hợp lệ";
};

const formatAddressObject = async (address: CompanyAddress): Promise<string> => {
  try {
    const details = await getAddressDetails(address.city_id, address.ward_id);
    const parts: string[] = [];

    if (address.street?.trim()) {
      parts.push(address.street.trim());
    }
    if (details.wardName) {
      parts.push(details.wardName);
    }
    if (details.cityName) {
      parts.push(details.cityName);
    }

    return parts.length > 0 ? parts.join(", ") : "Địa chỉ không xác định";
  } catch {
    return address.street || "Địa chỉ không xác định";
  }
};
