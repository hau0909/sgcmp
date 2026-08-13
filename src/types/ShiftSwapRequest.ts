import { ShiftSwapRequestStatus } from "./Enum";

export interface ShiftSwapRequestItem {
    assignment_id: string;
    shift_id: string;
    replacement_guard_id: string | null;
}

export interface ShiftSwapRequest {
    request_id: string;
    company_id: string;
    requester_guard_id: string;
    reason: string;
    status: ShiftSwapRequestStatus;
    rejection_reason: string | null;
    items: ShiftSwapRequestItem[];
    created_at: string;
    updated_at: string;
}