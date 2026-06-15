export type ShiftAssignmentStatus = "assigned" | "completed" | "absent";

export type Shift = {
  shift_id: string;
  contract_id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  required_guards: number;
  location: string;
  created_at: string;
  updated_at: string;
};

export type ShiftAssignment = {
  assignment_id: string;
  shift_id: string;
  guard_id: string;
  assigned_by: string;
  status: ShiftAssignmentStatus;
  created_at: string;
  updated_at: string;

  guard_name: string;
  guard_code: string;
  note?: string;
};

export type ShiftWithAssignments = Shift & {
  assignments: ShiftAssignment[];
};

export type TimeSlot = {
  id: string;
  label: string;
  start: string;
  end: string;
};

export type ContractOption = {
  contract_id: string;
  code: string;
  customer_name: string;
  company_name: string;
  service_name: string;
  address: string;
  start_date: string;
  end_date: string;
};

export type GuardOption = {
  guard_id: string;
  guard_code: string;
  full_name: string;
  phone_number: string;
  email: string;
  status: "active" | "unactive";
};
