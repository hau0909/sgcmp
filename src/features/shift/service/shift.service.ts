import type {
  ContractOption,
  CreateShiftInput,
  GetShiftDateRangeParams,
  GetGuardShiftsResult,
  GetGuardShiftsServiceParams,
  UpdateShiftAssignmentStatusParams,
} from "../type";

import type { Shifts } from "@/types/Shift";
import type { Shift_Assignment } from "@/types/ShiftAssignment";
import type { Shift_Img } from "@/types/ShiftImg";

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
  getShiftAssignmentByShiftAndGuard,
  getShiftAssignmentsByShiftId,
  getShiftById,
  updateShiftAssignmentStatusByShiftAndGuard,
  updateAssignedShiftAssignmentsToAbsentByShiftId,
  createShiftImage,
  getShiftImageByAssignmentId,
  getLatestShiftByContract,
  getScheduledShiftDatesByContract,
  uploadShiftCheckinImage,
  updateReplacementGuards,
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

export const getShiftByIdService = async (
  shiftId: string,
): Promise<Shifts | null> => {
  return await getShiftById(shiftId);
};

export const getShiftAssignmentByShiftAndGuardService = async ({
  shiftId,
  guardId,
}: {
  shiftId: string;
  guardId: string;
}): Promise<Shift_Assignment | null> => {
  return await getShiftAssignmentByShiftAndGuard({
    shiftId,
    guardId,
  });
};

export const getShiftAssignmentsByShiftIdService = async (
  shiftId: string,
): Promise<Shift_Assignment[]> => {
  return await getShiftAssignmentsByShiftId(shiftId);
};

export const updateShiftAssignmentStatusByShiftAndGuardService = async (
  params: UpdateShiftAssignmentStatusParams,
) => {
  return await updateShiftAssignmentStatusByShiftAndGuard(params);
};

export const updateAssignedShiftAssignmentsToAbsentByShiftIdService = async (
  shiftId: string,
) => {
  return await updateAssignedShiftAssignmentsToAbsentByShiftId(shiftId);
};

export const createShiftImageService = async (params: {
  assignmentId: string;
  imageUrl: string;
  imagePath: string | null;
  imageType: string;
  note?: string | null;
}): Promise<Shift_Img | null> => {
  return await createShiftImage(params);
};

export const getShiftImageByAssignmentIdService = async (
  assignmentId: string,
): Promise<Shift_Img | null> => {
  return await getShiftImageByAssignmentId(assignmentId);
};

export const getLatestShiftDateService = async (
  contractId: string,
): Promise<string | null> => {
  return await getLatestShiftByContract(contractId);
};

export const getScheduledShiftDatesService = async (
  contractId: string,
): Promise<string[]> => {
  return await getScheduledShiftDatesByContract(contractId);
};

export const uploadShiftCheckinImageService = async (
  assignmentId: string,
  file: File,
) => {
  return await uploadShiftCheckinImage(assignmentId, file);
};

export const updateReplacementGuardsService = async (
  assignmentId: string,
  replacementGuardIds: string[],
): Promise<Shift_Assignment> => {
  return await updateReplacementGuards(assignmentId, replacementGuardIds);
};
