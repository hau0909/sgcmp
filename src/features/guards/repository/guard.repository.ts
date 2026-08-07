import { createClient } from "@/lib/supabase/server";
import { getEndOfDayInTimeZone } from "@/utils/dateTime";

import type {
  InsertGuardInformationParams,
  UploadGuardAvatarRepositoryParams,
  UploadGuardAvatarResult,
  GuardListItem,
  GuardDetailDatabase,
  GetAllGuardsRepositoryParams,
  GetAllGuardsRepositoryResult,
  GetGuardPerformanceSummaryParams,
  GuardPerformanceSummaryData,
  GetGuardPerformanceListParams,
  GuardPerformanceListItem,
} from "../type";
import { Guard } from "@/types/Guard";

export const insertGuardInformation = async ({
  user_id,
  company_id,
  full_name,
  phone_number,
  email,
  date_of_birth,
  gender,
  address,
  avatar_url,
}: InsertGuardInformationParams) => {
  const supabase = await createClient();

  const { data: profile, error: profile_error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone_number,
      email,
      date_of_birth,
      gender,
      address,
      avatar_url: avatar_url ?? null,
      role: "guard",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user_id)
    .select()
    .single();

  if (profile_error) {
    throw new Error(`Không thể cập nhật profile Guard`);
  }

  const { data: guard, error: guard_error } = await supabase
    .from("guards")
    .insert({
      user_id,
      company_id,
    })
    .select("guard_id, user_id, company_id, created_at")
    .single();

  if (guard_error) {
    throw new Error(`Không thể thêm Guard`);
  }

  return {
    profile,
    guard,
  };
};

export const getCoordinatorCompanyId = async (
  user_id: string,
): Promise<string> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coordinators")
    .select("company_id")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Get Coordinator Company Error:", error);
    throw error;
  }

  if (!data?.company_id) {
    throw new Error("Không tìm thấy công ty của Coordinator.");
  }

  return data.company_id;
};

export const uploadGuardAvatar = async ({
  user_id,
  file,
}: UploadGuardAvatarRepositoryParams): Promise<UploadGuardAvatarResult> => {
  const authSupabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const { data: currentProfile, error: profileError } = await authSupabase
    .from("profiles")
    .select("user_id, role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !currentProfile) {
    throw new Error("Không tìm thấy hồ sơ người dùng hiện tại.");
  }

  if (currentProfile.role !== "coordinator" && currentProfile.role !== "company-admin") {
    throw new Error("Bạn không có quyền tải ảnh bảo vệ.");
  }

  const bucket_name = "profiles";

  const file_extension = file.name.split(".").pop()?.toLowerCase();

  if (!file_extension) {
    throw new Error("Không xác định được định dạng ảnh.");
  }

  const allowedExtensions = ["jpg", "jpeg", "png"];

  if (!allowedExtensions.includes(file_extension)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, JPEG hoặc PNG.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File tải lên không phải là ảnh.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ảnh không được vượt quá 2MB.");
  }

  const file_name = `avatar-${Date.now()}.${file_extension}`;
  const file_path = `${user_id}/avatar/${file_name}`;

  const supabase = await createClient();

  const { data: upload_data, error: upload_error } = await supabase.storage
    .from(bucket_name)
    .upload(file_path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (upload_error) {
    console.error("Upload Guard Avatar Error:", upload_error);
    throw new Error(upload_error.message);
  }

  const {
    data: { publicUrl: public_url },
  } = supabase.storage.from(bucket_name).getPublicUrl(file_path);

  return {
    file_path: upload_data.path,
    public_url,
  };
};

export const uploadGuardFile = async ({
  user_id,
  file,
  type,
}: {
  user_id: string;
  file: File;
  type: "avatar" | "cccd_front" | "cccd_back";
}): Promise<UploadGuardAvatarResult> => {
  const authSupabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const { data: currentProfile, error: profileError } = await authSupabase
    .from("profiles")
    .select("user_id, role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !currentProfile) {
    throw new Error("Không tìm thấy hồ sơ người dùng hiện tại.");
  }

  if (currentProfile.role !== "coordinator" && currentProfile.role !== "company-admin") {
    throw new Error("Bạn không có quyền tải ảnh bảo vệ.");
  }

  const bucket_name = "profiles";

  const file_extension = file.name.split(".").pop()?.toLowerCase();

  if (!file_extension) {
    throw new Error("Không xác định được định dạng ảnh.");
  }

  const allowedExtensions = ["jpg", "jpeg", "png"];

  if (!allowedExtensions.includes(file_extension)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, JPEG hoặc PNG.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File tải lên không phải là ảnh.");
  }

  if (type === "avatar" && file.size > 2 * 1024 * 1024) {
    throw new Error("Ảnh không được vượt quá 2MB.");
  }

  let file_name = "";
  let file_path = "";

  if (type === "avatar") {
    file_name = `avatar-${Date.now()}.${file_extension}`;
    file_path = `${user_id}/avatar/${file_name}`;
  } else if (type === "cccd_front") {
    file_name = `cccd-front-${Date.now()}.${file_extension}`;
    file_path = `${user_id}/identity/${file_name}`;
  } else if (type === "cccd_back") {
    file_name = `cccd-back-${Date.now()}.${file_extension}`;
    file_path = `${user_id}/identity/${file_name}`;
  }

  const supabase = await createClient();

  const { data: upload_data, error: upload_error } = await supabase.storage
    .from(bucket_name)
    .upload(file_path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (upload_error) {
    console.error("Upload Guard File Error:", upload_error);
    throw new Error(upload_error.message);
  }

  const {
    data: { publicUrl: public_url },
  } = supabase.storage.from(bucket_name).getPublicUrl(file_path);

  return {
    file_path: upload_data.path,
    public_url,
  };
};

export const mapWorkingDaysToNumbers = (workingDays: string[]): number[] => {
  const result: number[] = [];
  const map: Record<string, number> = {
    "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6, "sunday": 0,
    "t2": 1, "t3": 2, "t4": 3, "t5": 4, "t6": 5, "t7": 6, "cn": 0,
    "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6, "8": 0, "chủ nhật": 0, "chu nhat": 0
  };

  const arr = Array.isArray(workingDays) ? workingDays : [];
  if (arr.length === 0) {
    return [0, 1, 2, 3, 4, 5, 6]; // default to all days
  }

  for (const day of arr) {
    const d = String(day).trim().toLowerCase();
    if (map[d] !== undefined) {
      if (!result.includes(map[d])) result.push(map[d]);
    } else if (d.includes("thứ 2") || d.includes("thu 2")) {
      if (!result.includes(1)) result.push(1);
    } else if (d.includes("thứ 3") || d.includes("thu 3")) {
      if (!result.includes(2)) result.push(2);
    } else if (d.includes("thứ 4") || d.includes("thu 4")) {
      if (!result.includes(3)) result.push(3);
    } else if (d.includes("thứ 5") || d.includes("thu 5")) {
      if (!result.includes(4)) result.push(4);
    } else if (d.includes("thứ 6") || d.includes("thu 6")) {
      if (!result.includes(5)) result.push(5);
    } else if (d.includes("thứ 7") || d.includes("thu 7")) {
      if (!result.includes(6)) result.push(6);
    } else if (d.includes("chủ nhật") || d.includes("chu nhat")) {
      if (!result.includes(0)) result.push(0);
    }
  }
  return result;
};

interface WeeklyInterval {
  start: number;
  end: number;
}

export const getWeeklyIntervals = (workingDays: number[], timeSlots: string[]): WeeklyInterval[] => {
  const intervals: WeeklyInterval[] = [];
  const parsedSlots = (timeSlots || []).map((slotStr) => {
    const match = slotStr.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (!match) return null;
    const startMin = parseInt(match[1]) * 60 + parseInt(match[2]);
    const endMin = parseInt(match[3]) * 60 + parseInt(match[4]);
    return { startMin, endMin };
  }).filter(Boolean);

  for (const day of workingDays) {
    for (const slot of parsedSlots) {
      if (!slot) continue;
      const { startMin, endMin } = slot;
      if (endMin > startMin) {
        // Normal slot
        intervals.push({
          start: day * 24 * 60 + startMin,
          end: day * 24 * 60 + endMin,
        });
      } else {
        // Midnight-crossing slot
        intervals.push({
          start: day * 24 * 60 + startMin,
          end: (day + 1) * 24 * 60,
        });
        const nextDay = (day + 1) % 7;
        intervals.push({
          start: nextDay * 24 * 60,
          end: nextDay * 24 * 60 + endMin,
        });
      }
    }
  }
  return intervals;
};

export const getAllGuards = async ({
  company_id,
  page,
  limit,
  search,
  gender,
  status,
  workStatus,
  timeZone,
  checkContractId,
}: GetAllGuardsRepositoryParams): Promise<GetAllGuardsRepositoryResult> => {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let matchedUserIds: string[] | null = null;
  let excludeUserIds: string[] | null = null;

  const keyword = search?.trim();

  if (keyword) {
    const safeKeyword = keyword.replace(/[,()]/g, " ");
    const searchPattern = `%${safeKeyword}%`;

    const { data: matchedProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .or(
        `full_name.ilike.${searchPattern},phone_number.ilike.${searchPattern},email.ilike.${searchPattern}`,
      );

    if (profileError) {
      throw new Error(profileError.message);
    }

    matchedUserIds = (matchedProfiles ?? []).map((profile) => profile.user_id);

    if (matchedUserIds.length === 0) {
      return {
        guards: [],
        total: 0,
      };
    }
  }

  // Handle workStatus filter
  if (workStatus) {
    const now = new Date();
    const nowStr = now.toISOString();
    const nowPlus1sStr = new Date(now.getTime() + 1000).toISOString();

    // 1. Get user IDs that are currently on duty
    const { data: activeAssignments, error: activeErr } = await supabase
      .from("shift_assignments")
      .select("guard_id, shifts!inner(start_time, end_time)")
      .neq("status", "absent")
      .lt("shifts.start_time", nowPlus1sStr)
      .gt("shifts.end_time", nowStr);

    if (activeErr) {
      throw new Error(activeErr.message);
    }

    const activeUserIds = Array.from(new Set((activeAssignments ?? []).map((a) => a.guard_id)));

    // 2. Get user IDs that have any shift today (active or future today)
    const todayEnd = getEndOfDayInTimeZone(now, timeZone);

    const { data: upcomingAssignments, error: upcomingErr } = await supabase
      .from("shift_assignments")
      .select("guard_id, shifts!inner(start_time, end_time)")
      .neq("status", "absent")
      .gt("shifts.end_time", nowStr)
      .lt("shifts.start_time", todayEnd);

    if (upcomingErr) {
      throw new Error(upcomingErr.message);
    }

    const upcomingUserIds = Array.from(new Set((upcomingAssignments ?? []).map((a) => a.guard_id)));

    // 3. Compute matching user IDs for this workStatus
    let workStatusMatchedUserIds: string[] = [];

    if (workStatus === "on_duty") {
      workStatusMatchedUserIds = activeUserIds;
    } else if (workStatus === "assigned") {
      // Upcoming today but not currently on duty
      workStatusMatchedUserIds = upcomingUserIds.filter((id) => !activeUserIds.includes(id));
    } else if (workStatus === "absent") {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const { data: absentAssignments } = await supabase
        .from("shift_assignments")
        .select("guard_id, shifts!inner(start_time, end_time)")
        .or("status.ilike.%absent%,status.ilike.%vắng mặt%")
        .lt("shifts.start_time", todayEnd)
        .gt("shifts.end_time", todayStart.toISOString());

      workStatusMatchedUserIds = Array.from(new Set((absentAssignments ?? []).map((a) => a.guard_id)));
    } else if (workStatus === "late") {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const { data: lateAssignments } = await supabase
        .from("shift_assignments")
        .select("guard_id, check_in_time, status, shifts!inner(start_time, end_time)")
        .lt("shifts.start_time", todayEnd)
        .gt("shifts.end_time", todayStart.toISOString());

      const lateIds = (lateAssignments ?? [])
        .filter((a: any) => {
          const st = (a.status || "").toLowerCase();
          const isLateStatus = st === "late" || st === "trễ";
          const checkIn = a.check_in_time ? new Date(a.check_in_time).getTime() : null;
          const shiftStart = a.shifts?.start_time ? new Date(a.shifts.start_time).getTime() : null;
          const isCheckInLate = Boolean(checkIn && shiftStart && checkIn > shiftStart);
          return isLateStatus || isCheckInLate;
        })
        .map((a: any) => a.guard_id);

      workStatusMatchedUserIds = Array.from(new Set(lateIds));
    } else if (workStatus === "substitute" || workStatus === "replacement") {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const { data: repAssignments } = await supabase
        .from("shift_assignments")
        .select("replacement_guard_ids, shifts!inner(start_time, end_time)")
        .not("replacement_guard_ids", "is", null)
        .lt("shifts.start_time", todayEnd)
        .gt("shifts.end_time", todayStart.toISOString());

      const repDbIds: string[] = [];
      (repAssignments ?? []).forEach((a: any) => {
        if (Array.isArray(a.replacement_guard_ids)) {
          repDbIds.push(...a.replacement_guard_ids);
        }
      });

      if (repDbIds.length > 0) {
        const { data: guardsForRep } = await supabase
          .from("guards")
          .select("user_id, guard_id")
          .in("guard_id", repDbIds);

        workStatusMatchedUserIds = Array.from(new Set((guardsForRep ?? []).map((g) => g.user_id)));
      } else {
        workStatusMatchedUserIds = [];
      }
    }

    if (
      workStatus === "on_duty" ||
      workStatus === "assigned" ||
      workStatus === "absent" ||
      workStatus === "late" ||
      workStatus === "substitute" ||
      workStatus === "replacement"
    ) {
      if (workStatusMatchedUserIds.length === 0) {
        return {
          guards: [],
          total: 0,
        };
      }

      if (matchedUserIds) {
        matchedUserIds = matchedUserIds.filter((id) => workStatusMatchedUserIds.includes(id));
      } else {
        matchedUserIds = workStatusMatchedUserIds;
      }

      if (matchedUserIds.length === 0) {
        return {
          guards: [],
          total: 0,
        };
      }
    } else if (workStatus === "available") {
      if (matchedUserIds) {
        matchedUserIds = matchedUserIds.filter((id) => !upcomingUserIds.includes(id));
        if (matchedUserIds.length === 0) {
          return {
            guards: [],
            total: 0,
          };
        }
      } else {
        if (upcomingUserIds.length > 0) {
          excludeUserIds = upcomingUserIds;
        }
      }
    }
  }

  let query = supabase
    .from("guards")
    .select(
      `
      guard_id,
      profiles!guards_user_id_fkey!inner (
        user_id,
        full_name,
        phone_number,
        avatar_url,
        email,
        status,
        gender
      )
    `,
      {
        count: "exact",
      },
    )
    .eq("company_id", company_id)
    .order("created_at", {
      ascending: false,
    })
    .order("guard_id", {
      ascending: false,
    })
    .range(from, to);

  if (matchedUserIds) {
    query = query.in("user_id", matchedUserIds);
  }

  if (excludeUserIds && excludeUserIds.length > 0) {
    query = query.not("user_id", "in", `(${excludeUserIds.join(",")})`);
  }

  if (gender) {
    const normalizedGender = gender.trim().toLowerCase();
    if (normalizedGender === "female" || normalizedGender === "nữ" || normalizedGender === "nu") {
      query = query.in("profiles.gender", ["female", "Female", "FEMALE", "nữ", "Nữ", "NỮ", "nu", "Nu", "NU"]);
    } else if (normalizedGender === "male" || normalizedGender === "nam") {
      query = query.in("profiles.gender", ["male", "Male", "MALE", "nam", "Nam", "NAM"]);
    } else {
      query = query.eq("profiles.gender", gender);
    }
  }

  if (status) {
    const normalizedStatus = status.trim().toLowerCase();
    if (normalizedStatus === "active") {
      query = query.or("status.eq.active,status.is.null", { foreignTable: "profiles" });
    } else if (normalizedStatus === "unactive" || normalizedStatus === "inactive") {
      query = query.eq("profiles.status", "unactive");
    } else if (normalizedStatus === "banned") {
      query = query.eq("profiles.status", "banned");
    } else {
      query = query.eq("profiles.status", status);
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const guardsList = (data ?? []) as unknown as GuardListItem[];

  if (checkContractId) {
    try {
      // 1. Get the current contract details
      const { data: currentContract } = await supabase
        .from("contracts")
        .select(`
          contract_id,
          start_date,
          end_date,
          status,
          bookings (
            time_slots,
            day_per_week
          )
        `)
        .eq("contract_id", checkContractId)
        .single();

      if (currentContract) {
        const cBooking = Array.isArray(currentContract.bookings)
          ? currentContract.bookings[0]
          : currentContract.bookings;

        const cDays = mapWorkingDaysToNumbers(cBooking?.day_per_week || []);
        const cSlots = cBooking?.time_slots || [];
        const cIntervals = getWeeklyIntervals(cDays, cSlots);

        // 2. Get all OTHER active or pending_signatures contracts with assigned guards for this company
        const { data: otherContracts } = await supabase
          .from("contracts")
          .select(`
            contract_id,
            start_date,
            end_date,
            status,
            guard_assigned,
            bookings!inner (
              time_slots,
              day_per_week,
              company_id
            )
          `)
          .eq("bookings.company_id", company_id)
          .neq("contract_id", checkContractId)
          .in("status", ["active", "pending_signatures"])
          .not("guard_assigned", "is", null);

        const guardsWithConflicts: Record<string, { hasConflict: boolean; reason: string; conflictContractCode?: string }> = {};

        if (otherContracts && otherContracts.length > 0) {
          const cStart = new Date(currentContract.start_date);
          const cEnd = new Date(currentContract.end_date);

          for (const o of otherContracts) {
            const oBooking = Array.isArray(o.bookings) ? o.bookings[0] : o.bookings;
            if (!oBooking) continue;

            const oStart = new Date(o.start_date);
            const oEnd = new Date(o.end_date);

            // Step 1: Check date range overlap
            const datesOverlap = cStart <= oEnd && cEnd >= oStart;
            if (!datesOverlap) continue;

            // Step 2 & 3: Check working days and time slots overlap
            const oDays = mapWorkingDaysToNumbers(oBooking.day_per_week || []);
            const oSlots = oBooking.time_slots || [];
            const oIntervals = getWeeklyIntervals(oDays, oSlots);

            let intervalsOverlap = false;
            for (const iC of cIntervals) {
              for (const iO of oIntervals) {
                if (iC.start < iO.end && iO.start < iC.end) {
                  intervalsOverlap = true;
                  break;
                }
              }
              if (intervalsOverlap) break;
            }

            if (intervalsOverlap) {
              const assignedGuards = o.guard_assigned || [];
              const oCode = `HD-${o.contract_id.slice(0, 8).toUpperCase()}`;
              for (const guardId of assignedGuards) {
                if (!guardsWithConflicts[guardId]) {
                  guardsWithConflicts[guardId] = {
                    hasConflict: true,
                    reason: "conflict",
                    conflictContractCode: oCode,
                  };
                }
              }
            }
          }
        }

        // Attach conflictInfo to each guard in the output list
        for (const guard of guardsList) {
          const conflict = guardsWithConflicts[guard.guard_id];
          guard.conflictInfo = conflict || { hasConflict: false, reason: "" };
        }
      }
    } catch (err) {
      console.error("Error checking contract overlaps for guards:", err);
    }
  } else {
    for (const guard of guardsList) {
      guard.conflictInfo = { hasConflict: false, reason: "" };
    }
  }

  return {
    guards: guardsList,
    total: count ?? 0,
  };
};

export const getCompanyByOwnerId = async (
  owner_id: string,
): Promise<string> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("company_id")
    .eq("owner_id", owner_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.company_id;
};

export const getGuardDetail = async (
  guard_id: string,
  company_id: string,
): Promise<GuardDetailDatabase | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select(
      `
      guard_id,
      user_id,
      company_id,

      profiles!guards_user_id_fkey (
        full_name,
        phone_number,
        email,
        gender,
        date_of_birth,
        address,
        avatar_url,
        status
      )
    `,
    )
    .eq("guard_id", guard_id)
    .eq("company_id", company_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as GuardDetailDatabase | null;
};

export const getGuardIdByUserId = async (
  userId: string,
): Promise<string | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("guard_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Get Guard ID By User ID Error:", error);
    throw new Error(error.message);
  }

  return data?.guard_id ?? null;
};

export const getGuardByUserId = async (
  userId: string,
): Promise<Guard | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Guard) || null;
};

export const getGuardsByIds = async (guardIds: string[]): Promise<Guard[]> => {
  if (guardIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("*")
    .in("guard_id", guardIds);

  if (error) {
    throw error;
  }

  return (data as Guard[]) || [];
};

export const getGuardCountByCompanyId = async (
  company_id: string,
): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("guards")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company_id);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};

export const getGuardsByContract = async ({
  contract_id,
  company_id,
  page,
  limit,
  search,
}: {
  contract_id: string;
  company_id: string;
  page: number;
  limit: number;
  search?: string;
}): Promise<GetAllGuardsRepositoryResult> => {
  const supabase = await createClient();

  // 1. Get guard_assigned from the contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("guard_assigned")
    .eq("contract_id", contract_id)
    .single();

  if (contractError) {
    throw new Error(contractError.message);
  }

  const guardAssigned = contract?.guard_assigned as string[] | null;
  if (!guardAssigned || guardAssigned.length === 0) {
    return { guards: [], total: 0 };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let matchedUserIds: string[] | null = null;
  const keyword = search?.trim();

  if (keyword) {
    const safeKeyword = keyword.replace(/[,()]/g, " ");
    const searchPattern = `%${safeKeyword}%`;

    const { data: matchedProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .or(
        `full_name.ilike.${searchPattern},phone_number.ilike.${searchPattern},email.ilike.${searchPattern}`,
      );

    if (profileError) {
      throw new Error(profileError.message);
    }

    matchedUserIds = (matchedProfiles ?? []).map((profile) => profile.user_id);

    if (matchedUserIds.length === 0) {
      return {
        guards: [],
        total: 0,
      };
    }
  }

  let query = supabase
    .from("guards")
    .select(
      `
      guard_id,
      profiles!guards_user_id_fkey (
        user_id,
        full_name,
        phone_number,
        avatar_url,
        email,
        status,
        gender
      )
    `,
      {
        count: "exact",
      },
    )
    .in("guard_id", guardAssigned)
    .eq("company_id", company_id)
    .order("created_at", {
      ascending: false,
    })
    .order("guard_id", {
      ascending: false,
    })
    .range(from, to);

  if (matchedUserIds) {
    query = query.in("user_id", matchedUserIds);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    guards: (data ?? []) as unknown as GuardListItem[],
    total: count ?? 0,
  };
};

export const updateGuardDetail = async (
  guard_id: string,
  company_id: string,
  user_id: string,
  params: {
    full_name: string;
    phone_number: string;
    email: string;
    date_of_birth: string;
    gender: string;
    address: string;
    identity_id: string;
    identity_issue_date: string;
    identity_issue_place: string;
    avatar_url?: string | null;
    front_url?: string | null;
    back_url?: string | null;
  }
): Promise<void> => {
  const supabase = await createClient();

  // 1. Update profiles table
  const profileUpdateData: any = {
    full_name: params.full_name,
    phone_number: params.phone_number,
    email: params.email,
    date_of_birth: params.date_of_birth,
    gender: params.gender,
    address: params.address,
    updated_at: new Date().toISOString(),
  };

  if (params.avatar_url !== undefined) {
    profileUpdateData.avatar_url = params.avatar_url;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdateData)
    .eq("user_id", user_id);

  if (profileError) {
    throw new Error(`Cập nhật hồ sơ thất bại: ${profileError.message}`);
  }

  // 2. Upsert identities table
  const identityUpsertData: any = {
    user_id,
    identity_id: params.identity_id,
    issue_date: params.identity_issue_date,
    issue_place: params.identity_issue_place,
    updated_at: new Date().toISOString(),
  };

  if (params.front_url !== undefined) {
    identityUpsertData.front_url = params.front_url;
  }

  if (params.back_url !== undefined) {
    identityUpsertData.back_url = params.back_url;
  }

  const { error: identityError } = await supabase
    .from("identities")
    .upsert(identityUpsertData);

  if (identityError) {
    throw new Error(`Cập nhật thông tin định danh thất bại: ${identityError.message}`);
  }
};

export const getGuardPerformanceSummary = async ({
  company_id,
  guard_id,
  startDate,
  endDate,
}: GetGuardPerformanceSummaryParams): Promise<GuardPerformanceSummaryData> => {
  const supabase = await createClient();

  let query = supabase.from("shifts").select(`
    shift_id,
    start_time,
    end_time,
    contracts!inner (
      bookings!inner (
        company_id
      )
    ),
    shift_assignments (
      guard_id,
      status,
      check_in_time,
      replacement_guard_ids
    )
  `);

  if (company_id) {
    query = query.eq("contracts.bookings.company_id", company_id);
  }
  if (startDate) {
    query = query.gte("start_time", startDate);
  }
  if (endDate) {
    query = query.lte("start_time", endDate);
  }

  const { data: shifts, error } = await query;

  if (error || !shifts || shifts.length === 0) {
    return {
      attendance_rate: {
        percentage: 0.0,
        trend_percentage: 0.0,
        total_shifts: 0,
        total_assignments: 0,
        absent_count: 0,
        absent_percentage: 0.0,
      },
      total_absent_count: {
        count: 0,
        total_shifts: 0,
      },
      late_rate: {
        percentage: 0.0,
        late_shift_count: 0,
        total_shifts: 0,
      },
      on_time_rate: {
        percentage: 0.0,
        trend_percentage: 0.0,
        on_time_shift_count: 0,
        total_shifts: 0,
      },
      late_check_in_rate: {
        percentage: 0.0,
        count: 0,
      },
      replacement_rate: {
        percentage: 0.0,
        count: 0,
      },
    };
  }

  let totalAssignedShifts = 0;
  let evaluableAssignedShifts = 0;
  let attendedShifts = 0;
  let lateCheckInShifts = 0;
  let onTimeCheckInShifts = 0;
  let absentShifts = 0;
  let lateCheckInTimeShifts = 0;
  let replacementShifts = 0;
  const guardShiftsSet = new Set<string>();
  const nowMs = new Date().getTime();

  shifts.forEach((shift: any) => {
    const shiftStartTime = shift.start_time ? new Date(shift.start_time).getTime() : null;
    const assignments = shift.shift_assignments || [];
    assignments.forEach((assignment: any) => {
      if (guard_id && assignment.guard_id !== guard_id) {
        return;
      }
      guardShiftsSet.add(shift.shift_id);
      totalAssignedShifts += 1;
      const status = (assignment.status || "").toLowerCase();
      const checkInTime = assignment.check_in_time ? new Date(assignment.check_in_time).getTime() : null;

      const isReplacement = Array.isArray(assignment.replacement_guard_ids) && assignment.replacement_guard_ids.length > 0;
      const isFutureUnstarted = status === "assigned" && shiftStartTime !== null && shiftStartTime > nowMs;

      if (isReplacement) {
        replacementShifts += 1;
      } else if (isFutureUnstarted) {
        // Shift scheduled in the future that hasn't started yet - exclude from attendance evaluation denominator
      } else {
        evaluableAssignedShifts += 1;
        if (status === "absent" || status === "vắng mặt") {
          absentShifts += 1;
        } else if (status === "assigned") {
          if (shiftStartTime && nowMs >= shiftStartTime) {
            absentShifts += 1;
          }
        } else if (status === "late" || status === "trễ") {
          if (checkInTime) {
            attendedShifts += 1;
            lateCheckInShifts += 1;
            lateCheckInTimeShifts += 1;
          }
        } else if (status === "completed" || status === "checkout" || status === "present" || status === "đúng giờ" || status === "ontime") {
          attendedShifts += 1;
          onTimeCheckInShifts += 1;
        } else {
          if (checkInTime) {
            attendedShifts += 1;
          } else {
            absentShifts += 1;
          }
        }
      }
    });
  });

  const distinctShiftsCount = guard_id ? guardShiftsSet.size : shifts.length;
  const effectiveAssignedShifts = Math.max(0, evaluableAssignedShifts);

  const attendancePercentage = effectiveAssignedShifts > 0
    ? Number(((attendedShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : (totalAssignedShifts > 0 && absentShifts === 0 ? 100.0 : 0.0);

  const absentPercentage = effectiveAssignedShifts > 0
    ? Number(((absentShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const latePercentage = effectiveAssignedShifts > 0
    ? Number(((lateCheckInShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const onTimePercentage = effectiveAssignedShifts > 0
    ? Number(((onTimeCheckInShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const lateCheckInPercentage = effectiveAssignedShifts > 0
    ? Number(((lateCheckInTimeShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const replacementPercentage = totalAssignedShifts > 0
    ? Number(((replacementShifts / totalAssignedShifts) * 100).toFixed(1))
    : 0.0;

  return {
    attendance_rate: {
      percentage: attendancePercentage,
      trend_percentage: 0.0,
      total_shifts: distinctShiftsCount,
      total_assignments: totalAssignedShifts,
      absent_count: absentShifts,
      absent_percentage: absentPercentage,
    },
    total_absent_count: {
      count: absentShifts,
      total_shifts: totalAssignedShifts,
    },
    late_rate: {
      percentage: latePercentage,
      late_shift_count: lateCheckInShifts,
      total_shifts: attendedShifts,
    },
    on_time_rate: {
      percentage: onTimePercentage,
      trend_percentage: 0.0,
      on_time_shift_count: onTimeCheckInShifts,
      total_shifts: attendedShifts,
    },
    completed_rate: {
      percentage: onTimePercentage,
      count: onTimeCheckInShifts,
    },
    late_check_in_rate: {
      percentage: lateCheckInPercentage,
      count: lateCheckInTimeShifts,
    },
    replacement_rate: {
      percentage: replacementPercentage,
      count: replacementShifts,
    },
  };
};

export const getGuardPerformanceList = async ({
  company_id,
  startDate,
  endDate,
  search = "",
  tab = "all",
  page = 1,
  limit = 10,
}: GetGuardPerformanceListParams): Promise<{
  guards: GuardPerformanceListItem[];
  total: number;
  totalPages: number;
}> => {
  const supabase = await createClient();

  // 1. Fetch guards belonging to company
  let guardsQuery = supabase.from("guards").select("guard_id, user_id, company_id");
  if (company_id) {
    guardsQuery = guardsQuery.eq("company_id", company_id);
  }

  const { data: guardsData, error: guardsError } = await guardsQuery;

  if (guardsError) {
    console.error("getGuardPerformanceList guardsQuery error:", guardsError);
  }

  if (!guardsData || guardsData.length === 0) {
    return { guards: [], total: 0, totalPages: 0 };
  }

  const guardUserIds = guardsData.map((g: any) => g.user_id).filter(Boolean);

  // 2. Fetch profiles for these guards
  const profilesByUserId: Record<string, any> = {};
  if (guardUserIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, phone_number, avatar_url")
      .in("user_id", guardUserIds);

    if (profilesError) {
      console.error("getGuardPerformanceList profilesQuery error:", profilesError);
    } else if (profilesData) {
      profilesData.forEach((p: any) => {
        profilesByUserId[p.user_id] = p;
      });
    }
  }

  // 3. Fetch shift assignments for shift statistics
  let assignQuery = supabase.from("shift_assignments").select(`
    assignment_id,
    guard_id,
    status,
    check_in_time,
    replacement_guard_ids,
    shifts!inner (
      start_time
    )
  `).in("guard_id", guardUserIds);

  if (startDate) {
    assignQuery = assignQuery.gte("shifts.start_time", startDate);
  }
  if (endDate) {
    assignQuery = assignQuery.lte("shifts.start_time", endDate);
  }

  const { data: assignments, error: assignError } = await assignQuery;
  if (assignError) {
    console.warn("getGuardPerformanceList assignQuery error:", assignError);
  }

  const assignmentsByGuard: Record<string, any[]> = {};
  (assignments || []).forEach((a: any) => {
    if (!assignmentsByGuard[a.guard_id]) {
      assignmentsByGuard[a.guard_id] = [];
    }
    assignmentsByGuard[a.guard_id].push(a);
  });

  const keyword = search.trim().toLowerCase();

  let items: GuardPerformanceListItem[] = guardsData.map((g: any) => {
    const list = assignmentsByGuard[g.user_id] || [];
    let totalAssigned = 0;
    let evaluableAssigned = 0;
    let attended = 0;
    let absent = 0;
    let late = 0;
    let onTime = 0;
    const nowMs = new Date().getTime();

    list.forEach((assignment: any) => {
      totalAssigned += 1;
      const status = (assignment.status || "").toLowerCase();
      const shiftStartTime = assignment.shifts?.start_time ? new Date(assignment.shifts.start_time).getTime() : null;
      const checkInTime = assignment.check_in_time ? new Date(assignment.check_in_time).getTime() : null;
      const isReplacement = Array.isArray(assignment.replacement_guard_ids) && assignment.replacement_guard_ids.length > 0;
      const isFutureUnstarted = status === "assigned" && shiftStartTime !== null && shiftStartTime > nowMs;

      if (isReplacement) {
        // Replacement shift - no check-in, do not count as absent, late, or onTime
      } else if (isFutureUnstarted) {
        // Unstarted future shift - exclude from attendance evaluation denominator
      } else {
        evaluableAssigned += 1;
        if (status === "absent" || status === "vắng mặt") {
          absent += 1;
        } else if (status === "assigned") {
          if (shiftStartTime && nowMs >= shiftStartTime) {
            absent += 1;
          }
        } else if (status === "late" || status === "trễ") {
          if (checkInTime) {
            attended += 1;
            late += 1;
          }
        } else if (status === "completed" || status === "checkout" || status === "present" || status === "đúng giờ" || status === "ontime") {
          attended += 1;
          onTime += 1;
        } else {
          if (checkInTime) {
            attended += 1;
          } else {
            absent += 1;
          }
        }
      }
    });

    const replacementCount = list.filter((a: any) => Array.isArray(a.replacement_guard_ids) && a.replacement_guard_ids.length > 0).length;
    const effectiveAssigned = Math.max(0, evaluableAssigned);

    // Độ chuyên cần = Số ca có check-in / Số ca phân công đã/đang diễn ra * 100
    const attendancePercentage = effectiveAssigned > 0
      ? Number(((attended / effectiveAssigned) * 100).toFixed(1))
      : (totalAssigned > 0 && absent === 0 ? 100.0 : 0.0);

    // Tỷ lệ vắng mặt = Số ca vắng / Số ca phân công đã/đang diễn ra * 100
    const absentRate = effectiveAssigned > 0
      ? Number(((absent / effectiveAssigned) * 100).toFixed(1))
      : 0.0;

    // Tỷ lệ đi trễ = Số ca đi trễ / Số ca phân công đã/đang diễn ra * 100
    const lateRate = effectiveAssigned > 0
      ? Number(((late / effectiveAssigned) * 100).toFixed(1))
      : 0.0;

    const performanceScore = attendancePercentage;

    const rating = totalAssigned > 0
      ? Number((4.0 + (performanceScore / 100) * 1.0).toFixed(1))
      : 0.0;

    let category: "XUẤT SẮC" | "TIÊU CHUẨN" | "CẦN CẢI THIỆN" | "CHƯA PHÂN CÔNG" = "CHƯA PHÂN CÔNG";
    if (totalAssigned === 0) {
      category = "CHƯA PHÂN CÔNG";
    } else if (attendancePercentage >= 95.0 && absentRate <= 2.0 && lateRate <= 3.0) {
      category = "XUẤT SẮC";
    } else if (attendancePercentage >= 90.0 && absentRate <= 5.0 && lateRate <= 10.0) {
      category = "TIÊU CHUẨN";
    } else {
      category = "CẦN CẢI THIỆN";
    }

    const profile = profilesByUserId[g.user_id] || {};
    return {
      id: g.user_id,
      name: profile.full_name || "Nhân viên bảo vệ",
      guardId: g.guard_code || `SG-${(g.guard_id || g.user_id).substring(0, 5)}`,
      phone: profile.phone_number || null,
      avatar: profile.avatar_url ?? null,
      location: "Trụ sở chính",
      role: "Bảo vệ",
      performanceScore,
      rating,
      category,
    };
  });

  if (keyword) {
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.guardId.toLowerCase().includes(keyword) ||
        (item.phone && item.phone.toLowerCase().includes(keyword)) ||
        item.location.toLowerCase().includes(keyword)
    );
  }

  if (tab === "top10") {
    items = items.filter((item) => item.category === "XUẤT SẮC");
  }

  items.sort((a, b) => b.performanceScore - a.performanceScore);

  if (tab === "top10") {
    items = items.slice(0, 10);
  }

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIdx = (page - 1) * limit;
  const paginatedGuards = items.slice(startIdx, startIdx + limit);

  return {
    guards: paginatedGuards,
    total,
    totalPages,
  };
};

