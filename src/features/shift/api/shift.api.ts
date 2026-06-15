import { fetcher } from "@/lib/fetcher";
import type {
  CreateWorkShiftResponse,
  GetShiftContractsResponse,
  CreateShiftInput,
  GetAllShiftsResponse,
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
