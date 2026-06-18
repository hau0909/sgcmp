import type {
  ContractOption,
  CreateShiftInput,
  GetShiftDateRangeParams,
  GetGuardShiftsResult,
  GetGuardShiftsServiceParams,
} from "../type";

import { groupShiftsByDate } from "../utils/shift.utils";

import {
  getShiftContractsByCompanyId,
  createShiftAssignments,
  createShift,
  deleteShift,
  getContractGuardsPerSlot,
  getContractShiftRule,
  getOverlappingGuardShifts,
  getAllShiftsByDateRange,
  getGuardShiftsByRange,
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

export const getGuardShiftsService = async ({
  guard_id,
  start_date,
  end_date,
  start_time,
  end_time,
}: GetGuardShiftsServiceParams): Promise<GetGuardShiftsResult> => {
  const shifts = await getGuardShiftsByRange({
    guard_id,
    start_time,
    end_time,
  });

  return {
    range: {
      start_date,
      end_date,
    },
    shifts,
    grouped_by_date: groupShiftsByDate(shifts),
  };
};
