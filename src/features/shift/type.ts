export type ShiftAssignmentStatus = "assigned" | "completed" | "absent";

export type Shift = {
  shift_id: string;
  contract_id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  required_guards: number;
  location: string;
  contract_address?: string;
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
  guards_per_slot: number;
  description: string | null;
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

export type CreateShiftInput = {
  contract_id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  required_guards: number;
  location: string;
  guard_id: string[];
};

export type ShiftOptionResponse = {
  contracts: ContractOption[];
  guards: GuardOption[];
};

export type GetShiftsParams = {
  startDate?: string;
  endDate?: string;
  location?: string;
};

export type ContractQueryResult = {
  contract_id: string;
  start_date: string;
  end_date: string;
  booking:
    | {
        booking_id: string;
        company_id: string;
        address: string | null;
        guards_per_slot: number | null;
        description: string | null;
        customer:
          | {
              full_name: string | null;
            }
          | {
              full_name: string | null;
            }[]
          | null;
        company:
          | {
              company_name: string | null;
            }
          | {
              company_name: string | null;
            }[]
          | null;
        service:
          | {
              name: string | null;
            }
          | {
              name: string | null;
            }[]
          | null;
      }
    | {
        booking_id: string;
        company_id: string;
        address: string | null;
        guards_per_slot: number | null;
        description: string | null;
        customer:
          | {
              full_name: string | null;
            }
          | {
              full_name: string | null;
            }[]
          | null;
        company:
          | {
              company_name: string | null;
            }
          | {
              company_name: string | null;
            }[]
          | null;
        service:
          | {
              name: string | null;
            }
          | {
              name: string | null;
            }[]
          | null;
      }[]
    | null;
};

export type ContractGuardsPerSlotQuery = {
  booking:
    | {
        guards_per_slot: number | null;
      }
    | {
        guards_per_slot: number | null;
      }[]
    | null;
};

export type GetShiftContractsResponse = {
  message: string;
  data: ContractOption[];
};

export type CreateWorkShiftResponse = {
  message: string;
  data: {
    shift: {
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
    assignments: {
      assignment_id: string;
      shift_id: string;
      guard_id: string;
      assigned_by: string;
      status: string;
      created_at: string;
      updated_at: string;
    }[];
  };
};

export type ContractShiftRule = {
  guards_per_slot: number | null;
  start_date: string;
  end_date: string;
};

export type ContractShiftRuleQuery = {
  start_date: string;
  end_date: string;
  booking:
    | {
        guards_per_slot: number | null;
      }
    | {
        guards_per_slot: number | null;
      }[]
    | null;
};

export type OverlappingGuardShiftQuery = {
  assignment_id: string;
  guard_id: string;
  shifts:
    | {
        shift_id: string;
        shift_name: string;
        start_time: string;
        end_time: string;
      }
    | {
        shift_id: string;
        shift_name: string;
        start_time: string;
        end_time: string;
      }[]
    | null;
};

export type OverlappingGuardShift = {
  assignment_id: string;
  guard_id: string;
  shift_id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
};

export type GetAllShiftsResponse = {
  message: string;
  data: ShiftWithAssignments[];
};

export type GetShiftDateRangeParams = {
  contractId: string[];
  startTime: string;
  endTime: string;
  location?: string;
};

export type CompanyContractQuery = {
  contract_id: string;
};

export type ShiftAssignmentQuery = {
  assignment_id: string;
  shift_id: string;
  guard_id: string;
  assigned_by: string;
  status: ShiftAssignment["status"];
  created_at: string;
  updated_at: string;
  profiles:
    | {
        full_name: string | null;
      }
    | {
        full_name: string | null;
      }[]
    | null;
};

export type ShiftContractQuery = {
  bookings:
    | {
        address: string | null;
      }
    | {
        address: string | null;
      }[]
    | null;
};

export type ShiftQuery = {
  shift_id: string;
  contract_id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  required_guards: number;
  location: string;
  created_at: string;
  updated_at: string;
  contracts: ShiftContractQuery | ShiftContractQuery[] | null;
  shift_assignments: ShiftAssignmentQuery[] | null;
};
