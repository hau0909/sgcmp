import { fetcher } from "@/lib/fetcher";
import { EligibleShiftForSwap, ShiftSwapRequestWithDetails } from "../repository/shift-swap.repository";
import { ShiftSwapRequestItem } from "@/types/ShiftSwapRequest";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const requestGetEligibleSwapShifts = async (): Promise<ApiResponse<EligibleShiftForSwap[]>> => {
  return fetcher("/api/shifts/swap-requests/eligible-shifts", {
    method: "GET",
  });
};

export const requestCreateSwapRequest = async (payload: {
  reason: string;
  items: ShiftSwapRequestItem[];
}): Promise<ApiResponse<any>> => {
  return fetcher("/api/shifts/swap-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const requestGetMySwapRequests = async (): Promise<ApiResponse<ShiftSwapRequestWithDetails[]>> => {
  return fetcher("/api/shifts/swap-requests/my-requests", {
    method: "GET",
  });
};

export const requestGetCompanySwapRequests = async (): Promise<ApiResponse<ShiftSwapRequestWithDetails[]>> => {
  return fetcher("/api/shifts/swap-requests", {
    method: "GET",
  });
};

export const requestRejectSwapRequest = async (
  requestId: string,
  rejectionReason: string
): Promise<ApiResponse<any>> => {
  return fetcher(`/api/shifts/swap-requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectionReason }),
  });
};

export const requestApproveSwapRequest = async (
  requestId: string,
  items: ShiftSwapRequestItem[]
): Promise<ApiResponse<any>> => {
  return fetcher(`/api/shifts/swap-requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
};
