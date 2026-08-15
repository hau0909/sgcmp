import { createClient } from "@/lib/supabase/server";
import { ShiftSwapRequest, ShiftSwapRequestItem } from "@/types/ShiftSwapRequest";

export interface EligibleShiftForSwap {
  assignment_id: string;
  shift_id: string;
  shift_name: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  contract_id: string | null;
  company_name?: string | null;
}

export interface ShiftSwapRequestWithDetails extends ShiftSwapRequest {
  requester_name?: string;
  requester_avatar?: string | null;
  requester_phone?: string | null;
  shift_details?: Record<string, {
    shift_id: string;
    shift_name: string | null;
    start_time: string;
    end_time: string;
    location: string | null;
    company_name?: string | null;
  }>;
  replacement_guards_details?: Record<string, {
    guard_id: string;
    full_name: string;
    avatar_url: string | null;
  }>;
}

/**
 * Get guard's upcoming assigned shifts eligible for swap (starting >= 24h from now)
 */
export const getGuardEligibleShiftsForSwapRepository = async (
  guardId: string
): Promise<EligibleShiftForSwap[]> => {
  const supabase = await createClient();
  const minStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Retrieve user_id associated with guard_id because shift_assignments.guard_id might hold either guard_id or user_id
  const { data: guardData } = await supabase
    .from("guards")
    .select("user_id")
    .eq("guard_id", guardId)
    .maybeSingle();

  const userId = guardData?.user_id;
  const guardIdsToMatch = Array.from(new Set([guardId, userId].filter((id): id is string => Boolean(id))));

  const { data, error } = await supabase
    .from("shift_assignments")
    .select(`
      assignment_id,
      shift_id,
      guard_id,
      status,
      shift:shifts!inner (
        shift_id,
        shift_name,
        start_time,
        end_time,
        location,
        contract_id,
        contract:contracts (
          booking:bookings (
            company_name
          )
        )
      )
    `)
    .in("guard_id", guardIdsToMatch)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching eligible shifts for swap:", error);
    throw new Error(error.message);
  }

  if (!data) return [];

  const minTimeMs = new Date(minStartTime).getTime();

  return data
    .filter((item: any) => {
      if (!item.shift || !item.shift.start_time) return false;
      // Allow assigned, active or unset status; exclude finished/cancelled ones
      if (item.status && ["completed", "checkout", "absent", "late", "cancelled"].includes(item.status)) {
        return false;
      }
      const shiftStartMs = new Date(item.shift.start_time).getTime();
      return shiftStartMs >= minTimeMs;
    })
    .map((item: any) => {
      const contractObj = Array.isArray(item.shift?.contract) ? item.shift.contract[0] : item.shift?.contract;
      const bookingObj = Array.isArray(contractObj?.booking) ? contractObj.booking[0] : contractObj?.booking;

      return {
        assignment_id: item.assignment_id,
        shift_id: item.shift.shift_id,
        shift_name: item.shift.shift_name,
        start_time: item.shift.start_time,
        end_time: item.shift.end_time,
        location: item.shift.location,
        contract_id: item.shift.contract_id,
        company_name: bookingObj?.company_name || null,
      };
    });
};

/**
 * Create new shift swap request
 */
export const createShiftSwapRequestRepository = async (data: {
  company_id: string;
  requester_guard_id: string;
  reason: string;
  items: ShiftSwapRequestItem[];
}): Promise<ShiftSwapRequest> => {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from("shift_swap_requests")
    .insert({
      company_id: data.company_id,
      requester_guard_id: data.requester_guard_id,
      reason: data.reason,
      status: "PENDING",
      items: data.items,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating shift swap request:", error);
    throw new Error(error.message);
  }

  return created as ShiftSwapRequest;
};

/**
 * Get swap requests for a guard
 */
export const getGuardSwapRequestsRepository = async (
  guardId: string
): Promise<ShiftSwapRequestWithDetails[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_swap_requests")
    .select("*")
    .eq("requester_guard_id", guardId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guard swap requests:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return [];

  return await enrichSwapRequestsWithDetails(data);
};

/**
 * Get swap requests for a company (Coordinator view)
 */
export const getCompanySwapRequestsRepository = async (
  companyId: string
): Promise<ShiftSwapRequestWithDetails[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_swap_requests")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching company swap requests:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return [];

  return await enrichSwapRequestsWithDetails(data);
};

/**
 * Reject shift swap request
 */
export const rejectShiftSwapRequestRepository = async (
  requestId: string,
  rejectionReason: string
): Promise<ShiftSwapRequest> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shift_swap_requests")
    .update({
      status: "REJECTED",
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString(),
    })
    .eq("request_id", requestId)
    .select()
    .single();

  if (error) {
    console.error("Error rejecting shift swap request:", error);
    throw new Error(error.message);
  }

  return data as ShiftSwapRequest;
};

/**
 * Approve shift swap request and assign replacement guards
 */
export const approveShiftSwapRequestRepository = async (
  requestId: string,
  items: ShiftSwapRequestItem[]
): Promise<ShiftSwapRequest> => {
  const supabase = await createClient();

  // 1. Update swap request status & items
  const { data, error } = await supabase
    .from("shift_swap_requests")
    .update({
      status: "APPROVED",
      items: items,
      updated_at: new Date().toISOString(),
    })
    .eq("request_id", requestId)
    .select()
    .single();

  if (error) {
    console.error("Error approving shift swap request:", error);
    throw new Error(error.message);
  }

  // 2. Perform guard replacement in shift_assignments table
  const replacementGuardIds = items
    .map((it) => it.replacement_guard_id)
    .filter((id): id is string => Boolean(id));

  if (replacementGuardIds.length > 0) {
    // Look up user_id for all replacement guard IDs
    const { data: guardsData } = await supabase
      .from("guards")
      .select("guard_id, user_id")
      .or(`guard_id.in.(${replacementGuardIds.join(",")}),user_id.in.(${replacementGuardIds.join(",")})`);

    const guardIdToUserIdMap: Record<string, string> = {};
    (guardsData || []).forEach((g: any) => {
      if (g.guard_id && g.user_id) {
        guardIdToUserIdMap[g.guard_id] = g.user_id;
        guardIdToUserIdMap[g.user_id] = g.user_id;
      }
    });

    // Fetch details for all assignments & shifts in items
    const assignmentIds = items.map((it) => it.assignment_id).filter(Boolean);
    const { data: assignmentsData } = await supabase
      .from("shift_assignments")
      .select(
        `
        assignment_id,
        shift_id,
        shifts!inner (
          shift_id,
          start_time,
          end_time
        )
      `
      )
      .in("assignment_id", assignmentIds);

    const assignmentShiftInfoMap: Record<string, { startTime: string; endTime: string; durationMinutes: number }> = {};
    (assignmentsData || []).forEach((item: any) => {
      const shift = Array.isArray(item.shifts) ? item.shifts[0] : item.shifts;
      if (shift?.start_time && shift?.end_time) {
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
        assignmentShiftInfoMap[item.assignment_id] = {
          startTime: shift.start_time,
          endTime: shift.end_time,
          durationMinutes,
        };
      }
    });

    // Sort items by shift start time chronologically
    const sortedItems = [...items].sort((a, b) => {
      const tA = assignmentShiftInfoMap[a.assignment_id]?.startTime || "";
      const tB = assignmentShiftInfoMap[b.assignment_id]?.startTime || "";
      return tA.localeCompare(tB);
    });

    // Collect all target user IDs
    const allTargetUserIds = Array.from(new Set(Object.values(guardIdToUserIdMap)));

    // Pre-query prior DB minutes for targetUserIds excluding ALL swap items being replaced
    const initialGuardDailyMinutesMap: Record<string, Record<string, number>> = {};

    if (allTargetUserIds.length > 0) {
      const { data: priorDbAssignments } = await supabase
        .from("shift_assignments")
        .select(
          `
          assignment_id,
          guard_id,
          shifts!inner (
            start_time,
            end_time
          )
        `
        )
        .in("guard_id", allTargetUserIds)
        .neq("status", "absent");

      (priorDbAssignments || []).forEach((ea: any) => {
        // Skip any assignment that is part of the current swap request
        if (assignmentIds.includes(ea.assignment_id)) return;

        const s = Array.isArray(ea.shifts) ? ea.shifts[0] : ea.shifts;
        if (s?.start_time && s?.end_time) {
          const localD = new Date(s.start_time);
          localD.setUTCHours(localD.getUTCHours() + 7);
          const dStr = localD.toISOString().split("T")[0];
          const d = Math.max(0, Math.round((new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60)));

          if (!initialGuardDailyMinutesMap[ea.guard_id]) {
            initialGuardDailyMinutesMap[ea.guard_id] = {};
          }
          initialGuardDailyMinutesMap[ea.guard_id][dStr] = (initialGuardDailyMinutesMap[ea.guard_id][dStr] || 0) + d;
        }
      });
    }

    // Track running daily minutes per targetUserId and date
    const guardDailyMinutesMap: Record<string, Record<string, number>> = structuredClone(initialGuardDailyMinutesMap);

    for (const item of sortedItems) {
      if (item.assignment_id && item.replacement_guard_id) {
        const targetUserId =
          guardIdToUserIdMap[item.replacement_guard_id] || item.replacement_guard_id;
        const shiftInfo = assignmentShiftInfoMap[item.assignment_id];
        const shiftDuration = shiftInfo?.durationMinutes || 480;

        let dateStr = new Date().toISOString().split("T")[0];
        if (shiftInfo?.startTime) {
          const localD = new Date(shiftInfo.startTime);
          localD.setUTCHours(localD.getUTCHours() + 7);
          dateStr = localD.toISOString().split("T")[0];
        }

        if (!guardDailyMinutesMap[targetUserId]) {
          guardDailyMinutesMap[targetUserId] = {};
        }

        const accumulatedBefore = guardDailyMinutesMap[targetUserId][dateStr] || 0;
        const totalMinutes = accumulatedBefore + shiftDuration;

        let is_overtime = false;
        let overtime_minutes = 0;

        if (totalMinutes > 480) {
          is_overtime = true;
          overtime_minutes = Math.min(shiftDuration, totalMinutes - 480);
        }

        guardDailyMinutesMap[targetUserId][dateStr] = accumulatedBefore + shiftDuration;

        const { error: assignError } = await supabase
          .from("shift_assignments")
          .update({
            guard_id: targetUserId,
            is_overtime,
            overtime_minutes,
            updated_at: new Date().toISOString(),
          })
          .eq("assignment_id", item.assignment_id);

        if (assignError) {
          console.error(`Error replacing guard on assignment ${item.assignment_id}:`, assignError);
        }
      }
    }
  }

  return data as ShiftSwapRequest;
};

/**
 * Helper to enrich swap requests with guard profiles and shift details
 */
async function enrichSwapRequestsWithDetails(
  requests: any[]
): Promise<ShiftSwapRequestWithDetails[]> {
  const supabase = await createClient();

  // Extract all guard IDs (requesters & replacements) and shift IDs
  const guardIdsSet = new Set<string>();
  const shiftIdsSet = new Set<string>();

  requests.forEach((req) => {
    if (req.requester_guard_id) guardIdsSet.add(req.requester_guard_id);
    const items: ShiftSwapRequestItem[] = Array.isArray(req.items) ? req.items : [];
    items.forEach((it) => {
      if (it.shift_id) shiftIdsSet.add(it.shift_id);
      if (it.replacement_guard_id) guardIdsSet.add(it.replacement_guard_id);
    });
  });

  const guardIdsArr = Array.from(guardIdsSet);
  const shiftIdsArr = Array.from(shiftIdsSet);

  // Fetch guard profiles
  const guardsMap: Record<string, { guard_id: string; full_name: string; avatar_url: string | null; phone_number?: string | null }> = {};
  if (guardIdsArr.length > 0) {
    const { data: guardsData } = await supabase
      .from("guards")
      .select("guard_id, user_id, profile:profiles!guards_user_id_fkey(full_name, avatar_url, phone_number)")
      .in("guard_id", guardIdsArr);

    (guardsData || []).forEach((g: any) => {
      const prof = Array.isArray(g.profile) ? g.profile[0] : g.profile;
      guardsMap[g.guard_id] = {
        guard_id: g.guard_id,
        full_name: prof?.full_name || "Bảo vệ",
        avatar_url: prof?.avatar_url || null,
        phone_number: prof?.phone_number || null,
      };
    });
  }

  // Fetch shift details
  const shiftsMap: Record<string, { shift_id: string; shift_name: string | null; start_time: string; end_time: string; location: string | null; company_name?: string | null }> = {};
  if (shiftIdsArr.length > 0) {
    const { data: shiftsData } = await supabase
      .from("shifts")
      .select(`
        shift_id,
        shift_name,
        start_time,
        end_time,
        location,
        contract:contracts (
          booking:bookings (
            company_name
          )
        )
      `)
      .in("shift_id", shiftIdsArr);

    (shiftsData || []).forEach((s: any) => {
      const contractObj = Array.isArray(s.contract) ? s.contract[0] : s.contract;
      const bookingObj = Array.isArray(contractObj?.booking) ? contractObj.booking[0] : contractObj?.booking;

      shiftsMap[s.shift_id] = {
        shift_id: s.shift_id,
        shift_name: s.shift_name,
        start_time: s.start_time,
        end_time: s.end_time,
        location: s.location,
        company_name: bookingObj?.company_name || null,
      };
    });
  }

  // Attach details to each request
  return requests.map((req) => {
    const requester = guardsMap[req.requester_guard_id];
    const items: ShiftSwapRequestItem[] = Array.isArray(req.items) ? req.items : [];

    const reqShiftDetails: Record<string, any> = {};
    const reqReplacements: Record<string, any> = {};

    items.forEach((it) => {
      if (it.shift_id && shiftsMap[it.shift_id]) {
        reqShiftDetails[it.shift_id] = shiftsMap[it.shift_id];
      }
      if (it.replacement_guard_id && guardsMap[it.replacement_guard_id]) {
        reqReplacements[it.replacement_guard_id] = guardsMap[it.replacement_guard_id];
      }
    });

    return {
      ...req,
      requester_name: requester?.full_name || "Bảo vệ",
      requester_avatar: requester?.avatar_url || null,
      requester_phone: requester?.phone_number || null,
      shift_details: reqShiftDetails,
      replacement_guards_details: reqReplacements,
    };
  });
}
