import { fetcher } from "@/lib/fetcher";
import type {
  CreateWorkShiftResponse,
  GetShiftContractsResponse,
  CreateShiftInput,
  GetAllShiftsResponse,
  GetGuardShiftsResponse,
  GuardShiftDetailResponse,
  CheckinGuardShiftResponse,
} from "../type";

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
  imageUrl,
  imagePath,
}: {
  shiftId: string;
  imageUrl?: string;
  imagePath?: string;
}): Promise<CheckinGuardShiftResponse> => {
  return await fetcher(`/api/shifts/${encodeURIComponent(shiftId)}/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl, imagePath }),
  });
};
