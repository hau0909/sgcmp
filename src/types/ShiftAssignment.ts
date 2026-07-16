import { ShiftAssignmentStatus } from "./Enum";

export interface Shift_Assignment {
  assignment_id: string;
  shift_id: string;
  guard_id: string;
  assigned_by: string | null;
  status: ShiftAssignmentStatus;
  check_in_time: string | null;
  replacement_guard_ids: string[];
  created_at: string;
  updated_at: string;
};