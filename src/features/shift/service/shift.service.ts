import type {
  ContractOption,
  CreateShiftInput,
  GetShiftDateRangeParams,
} from "../type";
import {
  getShiftContractsByCompanyId,
  createShiftAssignments,
  createShift,
  deleteShift,
  getContractGuardsPerSlot,
  getContractShiftRule,
  getOverlappingGuardShifts,
  getAllShiftsByDateRange,
} from "../repository/shift.repository";

export const getShiftContractOptionsService = async (
  companyId: string,
): Promise<ContractOption[]> => {
  return getShiftContractsByCompanyId(companyId);
};

export const createWorkShiftService = async ({
  input,
  assignedBy,
}: {
  input: CreateShiftInput;
  assignedBy: string;
}) => {
  const shift = await createShift(input);

  try {
    const assignments = await createShiftAssignments({
      shiftId: shift.shift_id,
      guardIds: input.guard_id,
      assignedBy,
    });

    return {
      shift,
      assignments,
    };
  } catch (error) {
    await deleteShift(shift.shift_id);
    throw error;
  }
};

export const getContractGuardsPerSlotService = async (
  contractId: string,
): Promise<number | null> => {
  return getContractGuardsPerSlot(contractId);
};

export const getContractShiftRuleService = async (contractId: string) => {
  return getContractShiftRule(contractId);
};

export const getOverlappingGuardShiftsService = async ({
  guardId,
  startTime,
  endTime,
}: {
  guardId: string[];
  startTime: string;
  endTime: string;
}) => {
  return getOverlappingGuardShifts({
    guardId,
    startTime,
    endTime,
  });
};

export const getAllShiftsByDateRangeService = async (
  params: GetShiftDateRangeParams,
) => {
  return getAllShiftsByDateRange(params);
};
