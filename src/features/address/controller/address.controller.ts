import { City, Ward } from "../types";
import {
  getCitiesService,
  getWardsService,
} from "../service/address.service";

export const handleGetCities = async (): Promise<City[]> => {
  return await getCitiesService();
};

export const handleGetWards = async (cityId?: number): Promise<Ward[]> => {
  return await getWardsService(cityId);
};
