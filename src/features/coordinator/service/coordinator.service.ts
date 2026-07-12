import { getCoordinators, insertCoordinatorRecord, getCoordinatorById, updateCoordinatorInfo } from "../repository/coordinator.repository";
import { CoordinatorWithUser } from "../types";
import { getIdentityByUserId } from "@/features/identity/repository/identity.repository";

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

export const getCoordinatorDetailService = async (coordinatorId: string) => {
  if (!coordinatorId) throw new Error("Coordinator ID là bắt buộc");
  
  const coordinator = await getCoordinatorById(coordinatorId);
  const identity = await getIdentityByUserId(coordinator.user_id);
  
  return { ...coordinator, identity };
};

export const updateCoordinatorService = async (
  userId: string,
  payload: {
    fullName: string;
    phoneNumber: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    identityId: string;
    issueDate: string;
    issuePlace: string;
    avatarUrl?: string;
    frontUrl?: string;
    backUrl?: string;
  }
): Promise<void> => {
  if (!userId) throw new Error("User ID là bắt buộc");
  await updateCoordinatorInfo(userId, payload);
};

