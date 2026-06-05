import { getCoordinatorsService } from "../service/coordinator.service";
import { CoordinatorWithUser } from "../types";

export const handleGetCoordinators = async (
  companyId: string,
  page = 1,
  limit = 10
): Promise<{ data: CoordinatorWithUser[]; total: number }> => {
  return await getCoordinatorsService(companyId, page, limit);
};
