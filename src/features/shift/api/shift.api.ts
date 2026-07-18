import { fetcher } from "@/lib/fetcher";
import type {
  CreateWorkShiftResponse,
  GetShiftContractsResponse,
  CreateShiftInput,
  GetAllShiftsResponse,
  GetGuardShiftsResponse,
  GuardShiftDetailResponse,
  CheckinGuardShiftResponse,
  GuardAvailabilityResponse,
} from "../type";

export const requestGetGuardAvailability = async ({
  guardIds,
  startTime,
  endTime,
  proposedShifts,
}: {
  guardIds: string[];
  startTime?: string;
  endTime?: string;
  proposedShifts?: { startTime: string; endTime: string }[];
}): Promise<GuardAvailabilityResponse> => {
  return fetcher("/api/shifts/guards/availability", {
    method: "POST",
    body: JSON.stringify({ guardIds, startTime, endTime, proposedShifts }),
  });
};

export const requestGetShiftContracts =
  async (): Promise<GetShiftContractsResponse> => {
    return fetcher("/api/shifts/contracts", {
      method: "GET",
    });
  };

export const requestCreateWorkShift = async (
  input: CreateShiftInput,
): Promise<CreateWorkShiftResponse> => {
  return fetcher("/api/shifts", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

export const requestGetAllShiftsByDay = async ({
  date,
  location = "all",
}: {
  date: string;
  location?: string;
}): Promise<GetAllShiftsResponse> => {
  const params = new URLSearchParams({
    date,
    location,
  });

  return fetcher(`/api/shifts/day?${params.toString()}`, {
    method: "GET",
  });
};

export const requestGetAllShiftsByWeek = async ({
  date,
  location = "all",
}: {
  date: string;
  location?: string;
}): Promise<GetAllShiftsResponse> => {
  const params = new URLSearchParams({
    date,
    location,
  });

  return fetcher(`/api/shifts/week?${params.toString()}`, {
    method: "GET",
  });
};

export const requestGetGuardShiftsByDay = async ({
  date,
}: {
  date: string;
}): Promise<GetGuardShiftsResponse> => {
  const params = new URLSearchParams({
    date,
  });

  return fetcher(`/api/shifts/guard/day?${params.toString()}`, {
    method: "GET",
  });
};

export const requestGetGuardShiftsByWeek = async ({
  date,
}: {
  date: string;
}): Promise<GetGuardShiftsResponse> => {
  const params = new URLSearchParams({
    date,
  });

  return fetcher(`/api/shifts/guard/week?${params.toString()}`, {
    method: "GET",
  });
};

export const requestGetGuardShiftDetail = async ({
  shiftId,
}: {
  shiftId: string;
}): Promise<GuardShiftDetailResponse> => {
  return await fetcher(`/api/shifts/${encodeURIComponent(shiftId)}`, {
    method: "GET",
  });
};

export const requestCheckinGuardShift = async ({
  shiftId,
  imageFile,
}: {
  shiftId: string;
  imageFile?: File;
}): Promise<CheckinGuardShiftResponse> => {
  const formData = new FormData();
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return await fetcher(`/api/shifts/${encodeURIComponent(shiftId)}/checkin`, {
    method: "POST",
    body: formData,
  });
};

export const requestGetLatestShiftDate = async (
  contractId: string,
): Promise<{ message: string; data: string | null }> => {
  return fetcher(`/api/shifts/contracts/${encodeURIComponent(contractId)}/latest`, {
    method: "GET",
  });
};

export const requestGetScheduledShiftDates = async (
  contractId: string,
): Promise<{ message: string; data: string[] }> => {
  return fetcher(`/api/shifts/contracts/${encodeURIComponent(contractId)}/scheduled-dates`, {
    method: "GET",
  });
};

export const requestGetReplacementGuards = async ({
  shiftId,
  assignmentId,
}: {
  shiftId: string;
  assignmentId: string;
}): Promise<{
  success: boolean;
  data: {
    contractGuards: any[];
    outsideContractGuards: any[];
    currentReplacementGuards: any[];
  };
}> => {
  return fetcher(`/api/shifts/${encodeURIComponent(shiftId)}/replacement-guards?assignmentId=${encodeURIComponent(assignmentId)}`, {
    method: "GET",
  });
};

export const requestUpdateReplacementGuards = async ({
  shiftId,
  assignmentId,
  replacementGuardIds,
}: {
  shiftId: string;
  assignmentId: string;
  replacementGuardIds: string[];
}): Promise<{
  success: boolean;
  message: string;
  data: any;
}> => {
  return fetcher(`/api/shifts/${encodeURIComponent(shiftId)}/assignments/${encodeURIComponent(assignmentId)}/replacements`, {
    method: "PATCH",
    body: JSON.stringify({ replacementGuardIds }),
  });
};
