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
import { Shift_Img } from "@/types/ShiftImg";

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

const DAY_LABEL_MAP: Record<string, number> = {
  "thứ 2": 1, "thứ 3": 2, "thứ 4": 3, "thứ 5": 4, "thứ 6": 5, "thứ 7": 6, "chủ nhật": 0,
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0,
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
    .in("status", ["active", "completed", "cancelled"]) // status của contracts
    .eq("booking.company_id", companyId)
    .eq("booking.status", "accepted") // status của bookings
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const contractsData = (data ?? []) as unknown as ContractQueryResult[];
  if (contractsData.length === 0) return [];

  // Fetch unique start dates for all shifts of these contracts
  const contractIds = contractsData.map((c) => c.contract_id);
  const { data: shiftsData, error: shiftsError } = await supabase
    .from("shifts")
    .select("contract_id, start_time")
    .in("contract_id", contractIds);

  if (shiftsError) {
    throw new Error(shiftsError.message);
  }

  // Map contractId -> Set of unique local date strings
  const contractScheduledDatesMap: Record<string, Set<string>> = {};
  for (const shift of shiftsData || []) {
    if (shift.contract_id && shift.start_time) {
      if (!contractScheduledDatesMap[shift.contract_id]) {
        contractScheduledDatesMap[shift.contract_id] = new Set<string>();
      }
      contractScheduledDatesMap[shift.contract_id].add(shift.start_time.split(/[T ]/)[0]);
    }
  }

  return contractsData.map((contract, index) => {
    const booking = getSingleRelation(contract.booking);
    const customer = getSingleRelation(booking?.customer);
    const company = getSingleRelation(booking?.company);
    const service = getSingleRelation(booking?.service);

    const time_slots = toStringArray(booking?.time_slots) ?? [];
    const day_per_week = toStringArray(booking?.day_per_week) ?? [];

    // Calculate totalContractWorkingDays
    const targetDays = day_per_week
      .map((d) => DAY_LABEL_MAP[d.toLowerCase().trim()])
      .filter((n): n is number => n !== undefined);

    let totalWorkingDays = 0;
    if (contract.start_date && contract.end_date && targetDays.length > 0) {
      const cStart = new Date(`${contract.start_date}T00:00:00`);
      const cEnd = new Date(`${contract.end_date}T00:00:00`);
      const cur = new Date(cStart);
      while (cur <= cEnd) {
        if (targetDays.includes(cur.getDay())) {
          totalWorkingDays++;
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Calculate scheduledCount within target days and contract bounds
    const scheduledDatesSet = contractScheduledDatesMap[contract.contract_id] || new Set();
    let scheduledDays = 0;
    if (contract.start_date && contract.end_date && targetDays.length > 0) {
      const cStart = new Date(`${contract.start_date}T00:00:00`);
      const cEnd = new Date(`${contract.end_date}T00:00:00`);
      for (const dStr of Array.from(scheduledDatesSet)) {
        try {
          const dObj = new Date(`${dStr}T00:00:00`);
          if (dObj >= cStart && dObj <= cEnd && targetDays.includes(dObj.getDay())) {
            scheduledDays++;
          }
        } catch {}
      }
    }

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
      status: contract.status,
      time_slots,
      day_per_week,
      scheduled_days_count: scheduledDays,
      total_working_days_count: totalWorkingDays,
    };
  });
};

export const createShift = async (input: CreateShiftInput): Promise<Shift> => {
  const supabase = await createClient();

  // Check if a shift with the same contract, start/end time, and location already exists
  const { data: existing, error: checkError } = await supabase
    .from("shifts")
    .select("shift_id, shift_name")
    .eq("contract_id", input.contract_id)
    .eq("start_time", input.start_time)
    .eq("end_time", input.end_time)
    .eq("location", input.location)
    .limit(1);

  if (checkError) {
    throw new Error(checkError.message);
  }

  if (existing && existing.length > 0) {
    throw new Error(`Ca trực "${existing[0].shift_name}" cho khung giờ này đã tồn tại.`);
  }

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

  // Find their guard_ids from guards table (since replacement_guard_ids stores guards.guard_id)
  const { data: guardsData } = await supabase
    .from("guards")
    .select("guard_id, user_id")
    .in("user_id", guardId);

  const guardIdMap = guardsData || [];
  const dbGuardIds = guardIdMap.map(g => g.guard_id);

  let query = supabase
    .from("shift_assignments")
    .select(
      `
      assignment_id,
      guard_id,
      status,
      replacement_guard_ids,
      shifts!inner (
        shift_id,
        shift_name,
        start_time,
        end_time
      )
    `,
    )
    .neq("status", "absent")
    .lt("shifts.start_time", endTime)
    .gt("shifts.end_time", startTime);

  if (dbGuardIds.length > 0) {
    query = query.or(`guard_id.in.(${guardId.join(",")}),replacement_guard_ids.ov.{${dbGuardIds.join(",")}}`);
  } else {
    query = query.in("guard_id", guardId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const overlappingData = (data ?? []) as unknown as OverlappingGuardShiftQuery[];
  const results: OverlappingGuardShift[] = [];

  for (const item of overlappingData) {
    const shift = Array.isArray(item.shifts) ? item.shifts[0] : item.shifts;
    const shiftId = shift?.shift_id ?? "";
    const shiftName = shift?.shift_name ?? "Ca trực";
    const start_time = shift?.start_time ?? "";
    const end_time = shift?.end_time ?? "";

    // 1. Check if original guard matches
    if (guardId.includes(item.guard_id)) {
      results.push({
        assignment_id: item.assignment_id,
        guard_id: item.guard_id,
        shift_id: shiftId,
        shift_name: shiftName,
        start_time,
        end_time,
      });
    }

    // 2. Check if any replacement guards match
    if (item.replacement_guard_ids && item.replacement_guard_ids.length > 0) {
      for (const repGuardId of item.replacement_guard_ids) {
        const mappedGuard = guardIdMap.find(g => g.guard_id === repGuardId);
        if (mappedGuard && guardId.includes(mappedGuard.user_id)) {
          results.push({
            assignment_id: item.assignment_id,
            guard_id: mappedGuard.user_id, // Attribute conflict to the guard's user_id
            shift_id: shiftId,
            shift_name: shiftName,
            start_time,
            end_time,
          });
        }
      }
    }
  }

  return results;
};

const mapShiftAssignment = (
  assignment: ShiftAssignmentQuery,
): ShiftAssignment => {
  const profile = getSingleRelation(assignment.profiles);
  const shiftImg = getSingleRelation(assignment.shift_img);

  return {
    assignment_id: assignment.assignment_id,
    shift_id: assignment.shift_id,
    guard_id: assignment.guard_id,
    assigned_by: assignment.assigned_by,
    status: assignment.status,
    check_in_time: assignment.check_in_time,
    replacement_guard_ids: assignment.replacement_guard_ids || [],
    created_at: assignment.created_at,
    updated_at: assignment.updated_at,
    guard_name: profile?.full_name ?? "Chưa cập nhật",
    checkin_image: shiftImg
      ? {
          image_url: shiftImg.image_url,
          image_path: shiftImg.image_path,
        }
      : null,
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
          check_in_time,
          replacement_guard_ids,
          created_at,
          updated_at,
          profiles!shift_assignments_guard_id_fkey (
            full_name
          ),
          shift_img (
            image_url,
            image_path
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

  const rawShifts = ((data ?? []) as unknown as ShiftQuery[]).map(mapShiftWithAssignments);

  // Collect all replacement guard ids across shifts
  const replacementGuardIds = new Set<string>();
  rawShifts.forEach((s) => {
    s.assignments.forEach((a) => {
      if (a.replacement_guard_ids) {
        a.replacement_guard_ids.forEach((id) => replacementGuardIds.add(id));
      }
    });
  });

  if (replacementGuardIds.size > 0) {
    const { data: dbGuards } = await supabase
      .from("guards")
      .select(`
        guard_id,
        user_id,
        profiles!guards_user_id_fkey (
          full_name,
          phone_number,
          avatar_url
        )
      `)
      .in("guard_id", Array.from(replacementGuardIds));

    const guardsMapping = dbGuards || [];

    rawShifts.forEach((s) => {
      s.assignments.forEach((a) => {
        if (a.replacement_guard_ids && a.replacement_guard_ids.length > 0) {
          a.replacement_guards = a.replacement_guard_ids.map((repId) => {
            const mapped = guardsMapping.find((g) => g.guard_id === repId);
            const profile = mapped ? (Array.isArray(mapped.profiles) ? mapped.profiles[0] : mapped.profiles) : null;
            return {
              guard_id: repId,
              user_id: mapped?.user_id ?? "",
              full_name: profile?.full_name ?? "Chưa có tên",
              phone_number: profile?.phone_number ?? null,
              avatar_url: profile?.avatar_url ?? null,
            };
          });
        } else {
          a.replacement_guards = [];
        }
      });
    });
  }

  return rawShifts;
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

const mapShiftRowToItem = (
  row: ShiftRow,
  guardContext?: { assignmentGuardId: string; guardId: string },
): GuardShiftItem | null => {
  const shift = getFirstItem(row.shifts);

  if (!shift) {
    return null;
  }

  const contract = getFirstItem(shift.contracts);
  const booking = getFirstItem(contract?.bookings);

  const startTime = formatTimes(shift.start_time);
  const endTime = formatTimes(shift.end_time);

  // Determine if this guard is a replacement (their guard_id appears in replacement_guard_ids)
  const isReplacement = guardContext
    ? (row.replacement_guard_ids ?? []).includes(guardContext.guardId) &&
      row.guard_id !== guardContext.assignmentGuardId
    : false;

  return {
    id: row.assignment_id,
    assignment_id: row.assignment_id,
    shift_id: shift.shift_id,
    contract_id: shift.contract_id,

    date: formatDateKey(shift.start_time),
    time: `${startTime} - ${endTime}`,

    start_time: shift.start_time,
    end_time: shift.end_time,

    shift_name: shift.shift_name ?? "Chưa cập nhật tên ca trực",
    location: shift.location ?? "Chưa cập nhật vị trí",
    address: booking?.address ?? "Chưa cập nhật địa chỉ",

    status: row.status,
    guard_id: row.guard_id,
    replacement_guard_ids: row.replacement_guard_ids || [],
    is_replacement: isReplacement,
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
      replacement_guard_ids,
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
    .or(`guard_id.eq.${assignmentGuardId},replacement_guard_ids.cs.{${guard_id}}`)
    .lt("shifts.start_time", end_time)
    .gt("shifts.end_time", start_time);

  if (error) {
    console.error("Get Guard Shifts Error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as ShiftRow[])
    .map((row) => mapShiftRowToItem(row, { assignmentGuardId, guardId: guard_id }))
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

  // Find their guard_id from guards table (since replacement_guard_ids stores guards.guard_id)
  const { data: guardData } = await supabase
    .from("guards")
    .select("guard_id")
    .eq("user_id", guardId)
    .maybeSingle();

  const dbGuardId = guardData?.guard_id;

  let query = supabase
    .from("shift_assignments")
    .select("*")
    .eq("shift_id", shiftId);

  if (dbGuardId) {
    query = query.or(`guard_id.eq.${guardId},replacement_guard_ids.cs.{${dbGuardId}}`);
  } else {
    query = query.eq("guard_id", guardId);
  }

  const { data, error } = await query.maybeSingle();

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
  check_in_time,
}: UpdateShiftAssignmentStatusParams): Promise<Shift_Assignment | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_assignments")
    .update({
      status,
      ...(check_in_time !== undefined && { check_in_time }),
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

export const createShiftImage = async ({
  assignmentId,
  imageUrl,
  imagePath,
  imageType,
  note,
}: {
  assignmentId: string;
  imageUrl: string;
  imagePath: string | null;
  imageType: string;
  note?: string | null;
}): Promise<Shift_Img | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_img")
    .insert({
      shift_img_id: crypto.randomUUID(),
      assignment_id: assignmentId,
      image_url: imageUrl,
      image_path: imagePath,
      image_type: imageType,
      note: note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Create Shift Image Error:", error);
    throw new Error(error.message);
  }

  return data;
};

export const uploadShiftCheckinImage = async (
  assignmentId: string,
  file: File,
): Promise<{ path: string; publicUrl: string }> => {
  const supabase = await createClient();
  const file_extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uploadPath = `${assignmentId}/check-in/img.${file_extension}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("shifts")
    .upload(uploadPath, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Tải ảnh check-in lên storage thất bại: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("shifts")
    .getPublicUrl(uploadData.path);

  return {
    path: uploadData.path,
    publicUrl: publicUrlData.publicUrl,
  };
};

export const getShiftImageByAssignmentId = async (
  assignmentId: string,
): Promise<Shift_Img | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_img")
    .select("*")
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  if (error) {
    console.error("Get Shift Image by Assignment ID Error:", error);
    return null;
  }

  return data;
};

export const getLatestShiftByContract = async (
  contractId: string,
): Promise<string | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shifts")
    .select("start_time")
    .eq("contract_id", contractId)
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.start_time) return null;

  return data.start_time.split(/[T ]/)[0];
};

export const getScheduledShiftDatesByContract = async (
  contractId: string,
): Promise<string[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shifts")
    .select("start_time")
    .eq("contract_id", contractId);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return [];

  const uniqueDates = new Set<string>();
  for (const row of data) {
    if (row.start_time) {
      uniqueDates.add(row.start_time.split(/[T ]/)[0]);
    }
  }

  return Array.from(uniqueDates).sort();
};

export const updateReplacementGuards = async (
  assignmentId: string,
  replacementGuardIds: string[],
): Promise<Shift_Assignment> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_assignments")
    .update({
      replacement_guard_ids: replacementGuardIds,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_id", assignmentId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Shift_Assignment;
};
