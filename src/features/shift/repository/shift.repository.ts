import { formatDateKey, formatTimes } from "./../utils/shift.utils";
import { createClient } from "@/lib/supabase/server";
import type {
  ContractOption,
  ContractQueryResult,
  CreateShiftInput,
  Shift,
  ContractGuardsPerSlotQuery,
  ContractShiftRule,
  ContractShiftRuleQuery,
  OverlappingGuardShift,
  OverlappingGuardShiftQuery,
  GetShiftDateRangeParams,
  ShiftAssignment,
  ShiftWithAssignments,
  ShiftAssignmentQuery,
  ShiftQuery,
  GuardShiftItem,
  ShiftRow,
  UpdateShiftAssignmentStatusParams,
} from "../type";
import { Shifts } from "@/types/Shift";
import { Shift_Assignment } from "@/types/ShiftAssignment";

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

const getSingleRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
};

export const getShiftContractsByCompanyId = async (
  companyId: string,
): Promise<ContractOption[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      contract_id,
      start_date,
      end_date,
      status,
      booking:bookings!inner (
        booking_id,
        company_id,
        address,
        description,
        guards_per_slot,
        time_slots,
        day_per_week,
        customer:profiles!bookings_customer_id_fkey (
          full_name
        ),
        company:companies!bookings_company_id_fkey (
          company_name
        ),
        service:services!bookings_service_id_fkey (
          name
        )
      )
    `,
    )
    .eq("booking.company_id", companyId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ContractQueryResult[]).map(
    (contract, index) => {
      const booking = getSingleRelation(contract.booking);
      const customer = getSingleRelation(booking?.customer);
      const company = getSingleRelation(booking?.company);
      const service = getSingleRelation(booking?.service);

      return {
        contract_id: contract.contract_id,
        code: `HD-${String(index + 1).padStart(3, "0")}`,
        customer_name: customer?.full_name ?? "Chưa cập nhật",
        company_name: company?.company_name ?? "Chưa cập nhật",
        service_name: service?.name ?? "Chưa cập nhật",
        address: booking?.address ?? "Chưa cập nhật",
        guards_per_slot: booking?.guards_per_slot ?? 1,
        description: booking?.description ?? "Chưa cập nhật",
        start_date: contract.start_date,
        end_date: contract.end_date,
        time_slots: toStringArray(booking?.time_slots) ?? "Chưa cập nhật",
        day_per_week: toStringArray(booking?.day_per_week) ?? "Chưa cập nhật",
      };
    },
  );
};

export const createShift = async (input: CreateShiftInput): Promise<Shift> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shifts")
    .insert({
      contract_id: input.contract_id,
      shift_name: input.shift_name,
      start_time: input.start_time,
      end_time: input.end_time,
      required_guards: input.required_guards,
      location: input.location,
    })
    .select(
      `
      shift_id,
      contract_id,
      shift_name,
      start_time,
      end_time,
      required_guards,
      location,
      created_at,
      updated_at
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Shift;
};

export const createShiftAssignments = async ({
  shiftId,
  guardIds,
  assignedBy,
}: {
  shiftId: string;
  guardIds: string[];
  assignedBy: string;
}) => {
  const supabase = await createClient();

  const assignments = guardIds.map((guardId) => ({
    shift_id: shiftId,
    guard_id: guardId,
    assigned_by: assignedBy,
    status: "assigned",
  }));

  const { data, error } = await supabase
    .from("shift_assignments")
    .insert(assignments)
    .select(
      `
      assignment_id,
      shift_id,
      guard_id,
      assigned_by,
      status,
      created_at,
      updated_at
    `,
    );

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const deleteShift = async (shiftId: string) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("shifts")
    .delete()
    .eq("shift_id", shiftId);

  if (error) {
    throw new Error(error.message);
  }
};

export const getContractGuardsPerSlot = async (
  contractId: string,
): Promise<number | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      booking:bookings!inner (
        guards_per_slot
      )
    `,
    )
    .eq("contract_id", contractId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const contract = data as unknown as ContractGuardsPerSlotQuery;
  const booking = getSingleRelation(contract.booking);

  return booking?.guards_per_slot ?? null;
};

export const getContractShiftRule = async (
  contractId: string,
): Promise<ContractShiftRule | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contracts")
    .select(
      `
      start_date,
      end_date,
      booking:bookings!inner (
        guards_per_slot
      )
    `,
    )
    .eq("contract_id", contractId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const contract = data as unknown as ContractShiftRuleQuery;
  const booking = getSingleRelation(contract.booking);

  return {
    guards_per_slot: booking?.guards_per_slot ?? null,
    start_date: contract.start_date,
    end_date: contract.end_date,
  };
};

export const getOverlappingGuardShifts = async ({
  guardId,
  startTime,
  endTime,
}: {
  guardId: string[];
  startTime: string;
  endTime: string;
}): Promise<OverlappingGuardShift[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_assignments")
    .select(
      `
      assignment_id,
      guard_id,
      status,
      shifts!inner (
        shift_id,
        shift_name,
        start_time,
        end_time
      )
    `,
    )
    .in("guard_id", guardId)
    .neq("status", "absent")
    .lt("shifts.start_time", endTime)
    .gt("shifts.end_time", startTime);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as OverlappingGuardShiftQuery[]).map(
    (item) => {
      const shift = Array.isArray(item.shifts) ? item.shifts[0] : item.shifts;

      return {
        assignment_id: item.assignment_id,
        guard_id: item.guard_id,
        shift_id: shift?.shift_id ?? "",
        shift_name: shift?.shift_name ?? "Ca trực",
        start_time: shift?.start_time ?? "",
        end_time: shift?.end_time ?? "",
      };
    },
  );
};

const mapShiftAssignment = (
  assignment: ShiftAssignmentQuery,
): ShiftAssignment => {
  const profile = getSingleRelation(assignment.profiles);

  return {
    assignment_id: assignment.assignment_id,
    shift_id: assignment.shift_id,
    guard_id: assignment.guard_id,
    assigned_by: assignment.assigned_by,
    status: assignment.status,
    created_at: assignment.created_at,
    updated_at: assignment.updated_at,
    guard_name: profile?.full_name ?? "Chưa cập nhật",
  };
};

const mapShiftWithAssignments = (shift: ShiftQuery): ShiftWithAssignments => {
  const contract = getSingleRelation(shift.contracts);
  const booking = getSingleRelation(contract?.bookings);

  return {
    shift_id: shift.shift_id,
    contract_id: shift.contract_id,
    shift_name: shift.shift_name,
    start_time: shift.start_time,
    end_time: shift.end_time,
    required_guards: shift.required_guards,
    location: shift.location,
    contract_address: booking?.address ?? "",
    created_at: shift.created_at,
    updated_at: shift.updated_at,
    assignments: (shift.shift_assignments ?? []).map(mapShiftAssignment),
  };
};

export const getAllShiftsByDateRange = async ({
  contractId,
  startTime,
  endTime,
}: GetShiftDateRangeParams): Promise<ShiftWithAssignments[]> => {
  const supabase = await createClient();

  if (contractId.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("shifts")
    .select(
      `
        shift_id,
        contract_id,
        shift_name,
        start_time,
        end_time,
        required_guards,
        location,
        created_at,
        updated_at,
        contracts!inner (
          bookings!inner (
            address
          )
        ),
        shift_assignments (
          assignment_id,
          shift_id,
          guard_id,
          assigned_by,
          status,
          created_at,
          updated_at,
          profiles!shift_assignments_guard_id_fkey (
            full_name
          )
        )
      `,
    )
    .in("contract_id", contractId)
    .gte("start_time", startTime)
    .lt("start_time", endTime)
    .order("start_time", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ShiftQuery[]).map(mapShiftWithAssignments);
};

const getFirstItem = <T>(value: T | T[] | null | undefined): T | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
};

const mapShiftRowToItem = (row: ShiftRow): GuardShiftItem | null => {
  const shift = getFirstItem(row.shifts);

  if (!shift) {
    return null;
  }

  const contract = getFirstItem(shift.contracts);
  const booking = getFirstItem(contract?.bookings);

  const startTime = formatTimes(shift.start_time);
  const endTime = formatTimes(shift.end_time);

  return {
    id: row.assignment_id,
    assignment_id: row.assignment_id,
    shift_id: shift.shift_id,
    contract_id: shift.contract_id,

    date: formatDateKey(shift.start_time),
    time: `${startTime} - ${endTime}`,

    start_time: shift.start_time,
    end_time: shift.end_time,

    location: shift.location ?? "Chưa cập nhật vị trí",
    address: booking?.address ?? "Chưa cập nhật địa chỉ",

    status: row.status,
  };
};

export const getGuardIdByUserId = async (
  user_id: string,
): Promise<string | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("guard_id")
    .eq("user_id", user_id)
    .single();

  if (error || !data) {
    return null;
  }

  return data.guard_id;
};

export const getGuardShiftsByRange = async ({
  guard_id,
  start_time,
  end_time,
}: {
  guard_id: string;
  start_time: string;
  end_time: string;
}): Promise<GuardShiftItem[]> => {
  const supabase = await createClient();

  const { data: guardData, error: guardError } = await supabase
    .from("guards")
    .select("user_id")
    .eq("guard_id", guard_id)
    .maybeSingle();

  if (guardError) {
    console.error("Get Guard User ID Error:", guardError);
    throw new Error(guardError.message);
  }

  const assignmentGuardId = guardData?.user_id ?? guard_id;

  const { data, error } = await supabase
    .from("shift_assignments")
    .select(
      `
      assignment_id,
      shift_id,
      guard_id,
      assigned_by,
      status,
      created_at,
      updated_at,
      shifts!inner (
        shift_id,
        contract_id,
        shift_name,
        start_time,
        end_time,
        required_guards,
        location,
        contracts!inner (
          contract_id,
          bookings!inner (
            booking_id,
            address
          )
        )
      )
    `,
    )
    .eq("guard_id", assignmentGuardId)
    .lt("shifts.start_time", end_time)
    .gt("shifts.end_time", start_time);

  if (error) {
    console.error("Get Guard Shifts Error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as ShiftRow[])
    .map(mapShiftRowToItem)
    .filter((shift): shift is GuardShiftItem => Boolean(shift))
    .sort((first, second) => {
      return (
        new Date(first.start_time).getTime() -
        new Date(second.start_time).getTime()
      );
    });
};

export const getShiftById = async (shiftId: string): Promise<Shifts | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("shift_id", shiftId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Shifts) || null;
};

export const getShiftAssignmentByShiftAndGuard = async ({
  shiftId,
  guardId,
}: {
  shiftId: string;
  guardId: string;
}): Promise<Shift_Assignment | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_assignments")
    .select("*")
    .eq("shift_id", shiftId)
    .eq("guard_id", guardId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Shift_Assignment) || null;
};

export const getShiftAssignmentsByShiftId = async (
  shiftId: string,
): Promise<Shift_Assignment[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_assignments")
    .select("*")
    .eq("shift_id", shiftId);

  if (error) {
    throw error;
  }

  return (data as Shift_Assignment[]) || [];
};

export const updateShiftAssignmentStatusByShiftAndGuard = async ({
  shiftId,
  guardId,
  status,
}: UpdateShiftAssignmentStatusParams): Promise<Shift_Assignment | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_assignments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("shift_id", shiftId)
    .eq("guard_id", guardId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Update Shift Assignment Status Error:", error);
    throw new Error(error.message);
  }

  return data;
};

export const updateAssignedShiftAssignmentsToAbsentByShiftId = async (
  shiftId: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_assignments")
    .update({
      status: "absent",
      updated_at: new Date().toISOString(),
    })
    .eq("shift_id", shiftId)
    .eq("status", "assigned")
    .select("*");

  if (error) {
    console.error("Update Shift Assignments To Absent Error:", error);
    throw new Error(error.message);
  }

  return data ?? [];
};
