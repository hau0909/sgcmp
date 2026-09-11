import type {
  ContractOption,
  ContractShiftRule,
  CreateShiftInput,
  GetShiftDateRangeParams,
  GetGuardShiftsResult,
  GetGuardShiftsServiceParams,
  GuardShiftSimpleItem,
  OverlappingGuardShift,
  Shift,
  ShiftWithAssignments,
  UpdateShiftAssignmentStatusParams,
} from "../type";

import type { Shifts } from "@/types/Shift";
import type { Shift_Assignment } from "@/types/ShiftAssignment";
import type { Shift_Img } from "@/types/ShiftImg";

import { groupShiftsByDate } from "../utils/shift.utils";

import {
  getShiftContractsByCompanyId,
  getShiftContractsByCustomerId,
  createShiftAssignments,
  createShift,
  deleteShift,
  getContractGuardsPerSlot,
  getContractShiftRule,
  getOverlappingGuardShifts,
  getGuardsShiftsOnDate,
  getGuardsShiftsInWeek,
  getGuardsShiftsInRange,
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

export const getCustomerShiftContractOptionsService = async (
  customerId: string,
): Promise<ContractOption[]> => {
  return getShiftContractsByCustomerId(customerId);
};

export const createWorkShiftService = async ({
  input,
  assignedBy,
}: {
  input: CreateShiftInput;
  assignedBy: string;
}): Promise<{ shift: Shift; assignments: Shift_Assignment[] }> => {
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

export const getContractShiftRuleService = async (
  contractId: string,
): Promise<ContractShiftRule | null> => {
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
}): Promise<OverlappingGuardShift[]> => {
  return getOverlappingGuardShifts({
    guardId,
    startTime,
    endTime,
  });
};

export const getGuardsShiftsOnDateService = async ({
  guardIds,
  date,
}: {
  guardIds: string[];
  date: string;
}): Promise<GuardShiftSimpleItem[]> => {
  return getGuardsShiftsOnDate({
    guardIds,
    date,
  });
};

export const getGuardsShiftsInWeekService = async ({
  guardIds,
  date,
}: {
  guardIds: string[];
  date: string;
}): Promise<GuardShiftSimpleItem[]> => {
  return getGuardsShiftsInWeek({
    guardIds,
    date,
  });
};

export const getGuardsShiftsInRangeService = async ({
  guardIds,
  startTime,
  endTime,
}: {
  guardIds: string[];
  startTime: string;
  endTime: string;
}): Promise<GuardShiftSimpleItem[]> => {
  return getGuardsShiftsInRange({
    guardIds,
    startTime,
    endTime,
  });
};

export const getAllShiftsByDateRangeService = async (
  params: GetShiftDateRangeParams,
): Promise<ShiftWithAssignments[]> => {
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
): Promise<Shift_Assignment | null> => {
  return await updateShiftAssignmentStatusByShiftAndGuard(params);
};

export const updateAssignedShiftAssignmentsToAbsentByShiftIdService = async (
  shiftId: string,
): Promise<Shift_Assignment[]> => {
  return await updateAssignedShiftAssignmentsToAbsentByShiftId(shiftId);
};

export const createShiftImageService = async (params: {
  assignmentId: string;
  imageUrl: string;
  imagePath: string | null;
  imageType: string;
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
): Promise<{ path: string; publicUrl: string }> => {
  return await uploadShiftCheckinImage(assignmentId, file);
};

export const updateReplacementGuardsService = async (
  assignmentId: string,
  replacementGuardIds: string[],
): Promise<Shift_Assignment> => {
  return await updateReplacementGuards(assignmentId, replacementGuardIds);
};

