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

export const getAllGuards = async ({
  company_id,
  page,
  limit,
  search,
  gender,
  status,
  workStatus,
  timeZone,
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
    query = query.eq("profiles.status", status);
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
  let attendedShifts = 0;
  let lateCheckInShifts = 0;
  let onTimeCheckInShifts = 0;
  let absentShifts = 0;
  let lateCheckInTimeShifts = 0;
  let replacementShifts = 0;
  const guardShiftsSet = new Set<string>();

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
      const hasCheckIn = Boolean(checkInTime);

      const isReplacement = Array.isArray(assignment.replacement_guard_ids) && assignment.replacement_guard_ids.length > 0;

      if (isReplacement) {
        replacementShifts += 1;
      } else if (status === "absent" || status === "vắng mặt" || !hasCheckIn) {
        absentShifts += 1;
      } else {
        attendedShifts += 1;
        if (status === "late" || status === "trễ") {
          lateCheckInShifts += 1;
        } else if (status === "completed" || status === "present" || status === "đúng giờ" || status === "ontime") {
          onTimeCheckInShifts += 1;
        }

        if (shiftStartTime && checkInTime && checkInTime > shiftStartTime) {
          lateCheckInTimeShifts += 1;
        }
      }
    });
  });

  const distinctShiftsCount = guard_id ? guardShiftsSet.size : shifts.length;
  const effectiveAssignedShifts = Math.max(0, totalAssignedShifts - replacementShifts);

  const attendancePercentage = effectiveAssignedShifts > 0
    ? Number(((attendedShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : (totalAssignedShifts > 0 && absentShifts === 0 ? 100.0 : 0.0);

  const absentPercentage = effectiveAssignedShifts > 0
    ? Number(((absentShifts / effectiveAssignedShifts) * 100).toFixed(1))
    : 0.0;

  const latePercentage = attendedShifts > 0
    ? Number(((lateCheckInShifts / attendedShifts) * 100).toFixed(1))
    : 0.0;

  const onTimePercentage = attendedShifts > 0
    ? Number(((onTimeCheckInShifts / attendedShifts) * 100).toFixed(1))
    : 0.0;

  const lateCheckInPercentage = attendedShifts > 0
    ? Number(((lateCheckInTimeShifts / attendedShifts) * 100).toFixed(1))
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
    let attended = 0;
    let absent = 0;
    let late = 0;
    let onTime = 0;

    list.forEach((assignment: any) => {
      totalAssigned += 1;
      const status = (assignment.status || "").toLowerCase();
      const shiftStartTime = assignment.shifts?.start_time ? new Date(assignment.shifts.start_time).getTime() : null;
      const checkInTime = assignment.check_in_time ? new Date(assignment.check_in_time).getTime() : null;
      const hasCheckIn = Boolean(checkInTime);
      const isReplacement = Array.isArray(assignment.replacement_guard_ids) && assignment.replacement_guard_ids.length > 0;

      if (isReplacement) {
        // Replacement shift - no check-in, do not count as absent, late, or onTime
      } else if (status === "absent" || status === "vắng mặt" || !hasCheckIn) {
        absent += 1;
      } else {
        attended += 1;
        const isLate = status === "late" || status === "trễ" || (shiftStartTime && checkInTime && checkInTime > shiftStartTime);
        if (isLate) {
          late += 1;
        } else {
          onTime += 1;
        }
      }
    });

    const replacementCount = list.filter((a: any) => Array.isArray(a.replacement_guard_ids) && a.replacement_guard_ids.length > 0).length;
    const effectiveAssigned = Math.max(0, totalAssigned - replacementCount);

    // Độ chuyên cần = Số ca có check-in / Tổng ca phân công không thay ca * 100
    const attendancePercentage = effectiveAssigned > 0
      ? Number(((attended / effectiveAssigned) * 100).toFixed(1))
      : (totalAssigned > 0 && absent === 0 ? 100.0 : 0.0);

    // Tỷ lệ vắng mặt = Số ca vắng / Tổng ca phân công không thay ca * 100
    const absentRate = effectiveAssigned > 0
      ? Number(((absent / effectiveAssigned) * 100).toFixed(1))
      : 0.0;

    // Tỷ lệ đi trễ = Số ca đi trễ / Số ca đã tham gia * 100
    const lateRate = attended > 0
      ? Number(((late / attended) * 100).toFixed(1))
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

