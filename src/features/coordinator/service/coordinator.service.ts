import { getCoordinators, insertCoordinatorRecord } from "../repository/coordinator.repository";
import { CoordinatorWithUser } from "../types";

export const getCoordinatorsService = async (
  companyId: string,
  page = 1,
  limit = 10
): Promise<{ data: CoordinatorWithUser[]; total: number }> => {
  if (!companyId) throw new Error("Company ID is required");
  return await getCoordinators(companyId, page, limit);
};

export const addCoordinatorToCompanyService = async (
  userId: string,
  companyId: string
): Promise<void> => {
  if (!userId || !companyId) throw new Error("User ID và Company ID là bắt buộc");
  await insertCoordinatorRecord(userId, companyId);
};
