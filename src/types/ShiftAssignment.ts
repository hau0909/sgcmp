import { ShiftAssignmentStatus } from "./Enum";

export interface Shift_Assignment {
  assignment_id: string;
  shift_id: string;
  guard_id: string;
  assigned_by: string | null;
  status: ShiftAssignmentStatus;
  created_at: string;
  updated_at: string;
};