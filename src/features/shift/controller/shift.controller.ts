import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

const writeDebugLog = (message: string, data?: any) => {
  try {
    const logPath = "/home/jooyoung/SEP490/SEP490/sgcmp/debug.log";
    const timestamp = new Date().toISOString();
    const dataStr = data ? JSON.stringify(data, null, 2) : "";
    fs.appendFileSync(logPath, `[${timestamp}] ${message} ${dataStr}\n`);
  } catch (err) {
    // ignore
  }
};

import {
  createWorkShiftService,
  getContractShiftRuleService,
  getShiftContractOptionsService,
  getOverlappingGuardShiftsService,
  getGuardsShiftsOnDateService,
  getGuardsShiftsInWeekService,
  getGuardsShiftsInRangeService,
  getAllShiftsByDateRangeService,
  updateAssignedShiftAssignmentsToAbsentByShiftIdService,
  createShiftImageService,
  getLatestShiftDateService,
  uploadShiftCheckinImageService,
  getScheduledShiftDatesService,
  updateReplacementGuardsService,
} from "../service/shift.service";
import { handleGetUserProfile } from "@/features/auth/controller/auth.controller";
import {
  getCompanyByOwnerIdService,
  getCoordinatorByCompanyIdService,
} from "@/features/guards/service/guard.service";
import { getUser } from "@/features/auth/service/auth.service";
import type { CreateShiftInput, GuardShiftDetailItem, ShiftAssignmentStatus } from "../type";
import {
  validateCreateShiftInput,
  validateShiftDateInContract,
} from "../validator/shift.validate";
import { deleteShift } from "../repository/shift.repository";
import { parseBookingSlot, calculateDurationMinutes } from "../utils/shift.utils";
import { getContractIdsByCompanyService } from "@/features/contract/service/contract.service";
import {
  getDayDateRange,
  getWeekDateRange,
  isValidDateKey,
  getStartOfWeekKey,
} from "@/utils/calcDate";

import { getGuardShiftQueryParams } from "../utils/shift-server.utils";
import { resolveGuardIdForShift } from "../utils/shift-server.utils";
import { addDaysToDateKey } from "@/utils/calcDate";
import {
  getGuardShiftsService,
  getShiftAssignmentByShiftAndGuardService,
  getShiftAssignmentsByShiftIdService,
  getShiftByIdService,
  updateShiftAssignmentStatusByShiftAndGuardService,
  getShiftImageByAssignmentIdService,
} from "../service/shift.service";
import {
  startOfWeekMondayDateKey,
  formatShiftTime,
  isValidUuid,
  formatTimes,
} from "../utils/shift.utils";
import {
  getGuardByUserIdService,
  getGuardsByIdsService,
} from "@/features/guards/service/guard.service";

import {
  getProfileByUserIdService,
  getProfilesByUserIdsService,
} from "@/features/profile/service/profile.service";

import { getContractByIdService } from "@/features/contract/service/contract.service";
import { getBookingByIdService } from "@/features/booking/service/booking.service";
import { getCompanyByIdService } from "@/features/company/service/company.service";
import { getServiceByIdService } from "@/features/service/service/service.service";

const CHECKIN_BEFORE_MINUTES = 5;
const CHECKIN_AFTER_MINUTES = 5;

export class ShiftApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ShiftApiError";
    this.statusCode = statusCode;
  }
}

export const handleGetShiftContracts = async () => {
  const user = await getUser();

  if (!user) {
    return Response.json(
      {
        message: "Người dùng chưa đăng nhập",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const profileResponse = await handleGetUserProfile(user.id);
    const profile = profileResponse.data;

    if (!profile) {
      return Response.json(
        {
          message: "Không tìm thấy thông tin người dùng",
        },
        {
          status: 404,
        },
      );
    }

    let companyId = "";

    if (profile.role === "company-admin") {
      const company = await getCompanyByOwnerIdService(profile.id);

      if (!company) {
        return Response.json(
          {
            message: "Tài khoản chưa được liên kết với công ty",
          },
          {
            status: 400,
          },
        );
      }

      companyId = company;
    } else if (profile.role === "coordinator") {
      const coordinatorCompanyId = await getCoordinatorByCompanyIdService(
        profile.id,
      );

      if (!coordinatorCompanyId) {
        return Response.json(
          {
            message: "Tài khoản điều phối chưa được liên kết với công ty",
          },
          {
            status: 400,
          },
        );
      }

      companyId = coordinatorCompanyId;
    } else {
      return Response.json(
        {
          message: "Bạn không có quyền xem hợp đồng để tạo ca trực",
        },
        {
          status: 403,
        },
      );
    }

    const contracts = await getShiftContractOptionsService(companyId);

    return Response.json(
      {
        message: "Lấy danh sách hợp đồng tạo ca trực thành công",
        data: contracts,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Lấy danh sách hợp đồng tạo ca trực thất bại";

    return Response.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
};

export const handleCreateWorkShift = async (request: Request) => {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json(
        {
          message: "Người dùng chưa đăng nhập",
        },
        {
          status: 401,
        },
      );
    }

    const profileResponse = await handleGetUserProfile(user.id);
    const profile = profileResponse.data;

    if (!profile) {
      return Response.json(
        {
          message: "Không tìm thấy thông tin người dùng",
        },
        {
          status: 404,
        },
      );
    }

    if (profile.role !== "coordinator" && profile.role !== "company-admin") {
      return Response.json(
        {
          message: "Bạn không có quyền tạo ca trực",
        },
        {
          status: 403,
        },
      );
    }

    const body = (await request.json()) as CreateShiftInput;

    const input: CreateShiftInput = {
      contract_id: body.contract_id,
      shift_name: body.shift_name,
      start_time: body.start_time,
      end_time: body.end_time,
      required_guards: Number(body.required_guards),
      location: body.location,
      guard_id: body.guard_id,
      original_slot: body.original_slot,
      splits: body.splits?.map((s) => ({
        start_time: s.start_time,
        end_time: s.end_time,
        guard_id: s.guard_id,
      })),
    };

    validateCreateShiftInput(input);

    let companyId = "";
    if (profile.role === "company-admin") {
      companyId = (await getCompanyByOwnerIdService(profile.id)) || "";
    } else if (profile.role === "coordinator") {
      companyId = (await getCoordinatorByCompanyIdService(profile.id)) || "";
    }

    if (!companyId) {
      return Response.json(
        { message: "Không tìm thấy công ty của tài khoản" },
        { status: 400 },
      );
    }

    const allGuardIds = Array.from(
      new Set(
        input.splits && input.splits.length > 0
          ? input.splits.flatMap((s) => s.guard_id)
          : input.guard_id,
      ),
    );

    const supabase = await createClient();

    // 1. Fetch guards and check if they exist in guards table and belong to the correct company
    const { data: guardsData, error: guardsError } = await supabase
      .from("guards")
      .select("guard_id, user_id, company_id")
      .in("user_id", allGuardIds);

    if (guardsError) {
      return Response.json({ message: "Lỗi truy vấn thông tin bảo vệ" }, { status: 500 });
    }

    const guardIdsInDb = (guardsData || []).map((g) => g.user_id);
    const missingGuards = allGuardIds.filter((id) => !guardIdsInDb.includes(id));
    if (missingGuards.length > 0) {
      return Response.json(
        { message: "Một hoặc nhiều bảo vệ không tồn tại trong hệ thống hoặc không hợp lệ" },
        { status: 400 },
      );
    }

    const wrongCompanyGuards = (guardsData || []).filter((g) => g.company_id !== companyId);
    if (wrongCompanyGuards.length > 0) {
      return Response.json(
        { message: "Một hoặc nhiều bảo vệ không thuộc công ty của bạn" },
        { status: 400 },
      );
    }

    // 2. Fetch profiles and check if status is active
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, status, full_name")
      .in("user_id", allGuardIds);

    if (profilesError) {
      return Response.json({ message: "Lỗi truy vấn hồ sơ bảo vệ" }, { status: 500 });
    }

    const profileMap: Record<string, { status: string; full_name: string }> = {};
    for (const p of profilesData || []) {
      profileMap[p.user_id] = { status: p.status || "", full_name: p.full_name || "" };
    }

    for (const id of allGuardIds) {
      const p = profileMap[id];
      if (!p || p.status !== "active") {
        const name = p?.full_name || "Bảo vệ";
        return Response.json(
          { message: `Bảo vệ ${name} hiện tại không hoạt động (status != active)` },
          { status: 400 },
        );
      }
    }

    const firstStartTime = input.splits && input.splits.length > 0 ? input.splits[0].start_time : input.start_time;
    const d = new Date(firstStartTime);
    d.setUTCHours(d.getUTCHours() + 7);
    const dateStr = d.toISOString().split("T")[0];

    const dbShifts = await getGuardsShiftsOnDateService({
      guardIds: allGuardIds,
      date: dateStr,
    });

    const dbWeekShifts = await getGuardsShiftsInWeekService({
      guardIds: allGuardIds,
      date: dateStr,
    });

    const guardDailyMinutes: Record<string, number> = {};
    for (const gs of dbShifts) {
      guardDailyMinutes[gs.guard_id] = (guardDailyMinutes[gs.guard_id] || 0) + gs.duration_minutes;
    }

    const guardWeeklyMinutes: Record<string, number> = {};
    for (const gs of dbWeekShifts) {
      guardWeeklyMinutes[gs.guard_id] = (guardWeeklyMinutes[gs.guard_id] || 0) + gs.duration_minutes;
    }

    if (input.splits && input.splits.length > 0) {
      for (const split of input.splits) {
        const start = new Date(split.start_time);
        const end = new Date(split.end_time);
        const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);

        for (const gid of split.guard_id) {
          guardDailyMinutes[gid] = (guardDailyMinutes[gid] || 0) + durationMin;
          guardWeeklyMinutes[gid] = (guardWeeklyMinutes[gid] || 0) + durationMin;
        }
      }
    } else {
      const start = new Date(input.start_time);
      const end = new Date(input.end_time);
      const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);

      for (const gid of input.guard_id) {
        guardDailyMinutes[gid] = (guardDailyMinutes[gid] || 0) + durationMin;
        guardWeeklyMinutes[gid] = (guardWeeklyMinutes[gid] || 0) + durationMin;
      }
    }

    for (const [gid, totalMinutes] of Object.entries(guardDailyMinutes)) {
      if (totalMinutes > 8 * 60) {
        const guardName = profileMap[gid]?.full_name || "Bảo vệ";
        const [yr, mo, dy] = dateStr.split("-");
        const formattedDate = `${dy}/${mo}/${yr}`;
        return Response.json(
          {
            success: false,
            message: `Bảo vệ ${guardName} sẽ làm tổng cộng ${(totalMinutes / 60).toFixed(1)} giờ trong ngày ${formattedDate}, vượt quá giới hạn 8 giờ.`,
          },
          { status: 400 },
        );
      }
    }

    for (const [gid, totalMinutes] of Object.entries(guardWeeklyMinutes)) {
      if (totalMinutes > 48 * 60) {
        const guardName = profileMap[gid]?.full_name || "Bảo vệ";
        const startOfWeekKey = getStartOfWeekKey(dateStr);
        const endOfWeekKey = addDaysToDateKey(startOfWeekKey, 6);
        const [sYr, sMo, sDy] = startOfWeekKey.split("-");
        const [eYr, eMo, eDy] = endOfWeekKey.split("-");
        const formattedStart = `${sDy}/${sMo}/${sYr}`;
        const formattedEnd = `${eDy}/${eMo}/${eYr}`;
        return Response.json(
          {
            success: false,
            message: `Bảo vệ ${guardName} sẽ làm tổng cộng ${(totalMinutes / 60).toFixed(1)} giờ trong tuần từ ${formattedStart} đến ${formattedEnd}, vượt quá giới hạn 48 giờ.`,
          },
          { status: 400 },
        );
      }
    }

    const contractRule = await getContractShiftRuleService(input.contract_id);

    if (!contractRule) {
      return Response.json(
        {
          message: "Không tìm thấy thông tin hợp đồng",
        },
        {
          status: 404,
        },
      );
    }

    if (!contractRule.guards_per_slot) {
      return Response.json(
        {
          message: "Không tìm thấy số lượng bảo vệ yêu cầu của hợp đồng",
        },
        {
          status: 404,
        },
      );
    }

    if (input.required_guards !== contractRule.guards_per_slot) {
      return Response.json(
        {
          message: `Số lượng bảo vệ phải đúng theo hợp đồng là ${contractRule.guards_per_slot} bảo vệ`,
        },
        {
          status: 400,
        },
      );
    }

    if (input.splits && input.splits.length > 0) {
      // 1. Mỗi ca nhỏ không quá 8 tiếng
      for (const split of input.splits) {
        const start = new Date(split.start_time);
        const end = new Date(split.end_time);
        const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
        if (durationMin > 8 * 60) {
          return Response.json(
            { message: "Ca trực không được vượt quá 8 tiếng." },
            { status: 400 }
          );
        }
      }

      // 2. Tổng duration bằng ca gốc
      const parsedSlot = parseBookingSlot(input.original_slot!);
      if (!parsedSlot) {
        return Response.json(
          { message: "Khung giờ gốc không hợp lệ." },
          { status: 400 }
        );
      }
      const originalDurationMin = calculateDurationMinutes(parsedSlot.start, parsedSlot.end);

      const totalSplitDurationMin = input.splits.reduce((sum, split) => {
        const start = new Date(split.start_time);
        const end = new Date(split.end_time);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);

      if (totalSplitDurationMin !== originalDurationMin) {
        return Response.json(
          { message: "Tổng thời gian sau khi tách phải bằng tổng thời gian ca ban đầu." },
          { status: 400 }
        );
      }

      // 3. Các ca nối tiếp nhau & 4. Không overlap
      const sortedSplits = [...input.splits].sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

      for (let i = 1; i < sortedSplits.length; i++) {
        const prevEnd = new Date(sortedSplits[i - 1].end_time).getTime();
        const currStart = new Date(sortedSplits[i].start_time).getTime();
        if (currStart > prevEnd) {
          return Response.json(
            { message: "Các ca tách phải liên tục, không được bị hở thời gian." },
            { status: 400 }
          );
        }
        if (currStart < prevEnd) {
          return Response.json(
            { message: "Các ca tách không được trùng thời gian." },
            { status: 400 }
          );
        }
      }

      // 5. Không vượt quá contract end date
      for (const split of input.splits) {
        validateShiftDateInContract({
          startTime: split.start_time,
          endTime: split.end_time,
          contractStartDate: contractRule.start_date,
          contractEndDate: contractRule.end_date,
        });
      }

      // Check overlapping shifts for each segment
      for (const split of input.splits) {
        const overlappingShifts = await getOverlappingGuardShiftsService({
          guardId: split.guard_id,
          startTime: split.start_time,
          endTime: split.end_time,
        });

        if (overlappingShifts.length > 0) {
          const conflictGuardIds = overlappingShifts.map((s) => s.guard_id);
          const conflictNames = conflictGuardIds.map((id) => profileMap[id]?.full_name || id).join(", ");
          return Response.json(
            {
              message: `Bảo vệ (${conflictNames}) đã có lịch trực trùng lặp trong khung giờ này`,
              data: overlappingShifts,
            },
            {
              status: 400,
            },
          );
        }
      }

      // 6. Create all split shifts
      const createdShifts = [];
      try {
        for (const split of input.splits) {
          const splitInput = {
            ...input,
            start_time: split.start_time,
            end_time: split.end_time,
            guard_id: split.guard_id,
          };
          const result = await createWorkShiftService({
            input: splitInput,
            assignedBy: user.id,
          });
          createdShifts.push(result);
        }
      } catch (error) {
        // Rollback
        for (const res of createdShifts) {
          try {
            await deleteShift(res.shift.shift_id);
          } catch (delError) {
            console.error("Lỗi rollback xóa ca trực:", delError);
          }
        }
        throw error;
      }

      return Response.json(
        {
          message: "Tạo ca trực thành công",
          data: createdShifts,
        },
        {
          status: 201,
        },
      );
    } else {
      validateShiftDateInContract({
        startTime: input.start_time,
        endTime: input.end_time,
        contractStartDate: contractRule.start_date,
        contractEndDate: contractRule.end_date,
      });

      const overlappingShifts = await getOverlappingGuardShiftsService({
        guardId: input.guard_id,
        startTime: input.start_time,
        endTime: input.end_time,
      });

      if (overlappingShifts.length > 0) {
        const conflictGuardIds = overlappingShifts.map((s) => s.guard_id);
        const conflictNames = conflictGuardIds.map((id) => profileMap[id]?.full_name || id).join(", ");
        return Response.json(
          {
            message: `Bảo vệ (${conflictNames}) đã có lịch trực trùng lặp trong khung giờ này`,
            data: overlappingShifts,
          },
          {
            status: 400,
          },
        );
      }

      const result = await createWorkShiftService({
        input,
        assignedBy: user.id,
      });

      return Response.json(
        {
          message: "Tạo ca trực thành công",
          data: result,
        },
        {
          status: 201,
        },
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tạo ca trực thất bại";

    return Response.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
};

const resolveShiftCompanyId = async () => {
  const user = await getUser();

  if (!user) {
    throw new Error("Người dùng chưa đăng nhập");
  }

  const profileResponse = await handleGetUserProfile(user.id);
  const profile = profileResponse.data;

  if (!profile) {
    throw new Error("Không tìm thấy thông tin người dùng");
  }

  if (profile.role === "company-admin") {
    const companyId = await getCompanyByOwnerIdService(profile.id);

    if (!companyId) {
      throw new Error("Tài khoản chưa được liên kết với công ty");
    }

    return companyId;
  }

  if (profile.role === "coordinator") {
    const companyId = await getCoordinatorByCompanyIdService(profile.id);

    if (!companyId) {
      throw new Error("Tài khoản chưa được liên kết với công ty");
    }

    return companyId;
  }

  throw new Error("Bạn không có quyền xem danh sách ca trực");
};

const getShiftQueryParams = (request: Request) => {
  const { searchParams } = new URL(request.url);

  const date = searchParams.get("date");
  const location = searchParams.get("location") ?? "all";

  if (!date || !isValidDateKey(date)) {
    throw new Error("Ngày xem ca trực không hợp lệ");
  }

  return {
    date,
    location,
  };
};

export const handleGetAllShiftsByDay = async (request: Request) => {
  try {
    const { date, location } = getShiftQueryParams(request);

    const companyId = await resolveShiftCompanyId();

    const contractId = await getContractIdsByCompanyService(
      companyId,
      location,
    );

    if (contractId.length === 0) {
      return Response.json(
        {
          message: "Công ty chưa có hợp đồng nào",
          data: [],
        },
        { status: 200 },
      );
    }

    const { startTime, endTime } = getDayDateRange(date);

    const shifts = await getAllShiftsByDateRangeService({
      contractId,
      startTime,
      endTime,
      location,
    });

    return Response.json(
      {
        message: "Lấy danh sách ca trực theo ngày thành công",
        data: shifts,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Lấy danh sách ca trực theo ngày thất bại";

    return Response.json({ message }, { status: 400 });
  }
};

export const handleGetAllShiftsByWeek = async (request: Request) => {
  try {
    const { date, location } = getShiftQueryParams(request);

    const companyId = await resolveShiftCompanyId();

    const contractId = await getContractIdsByCompanyService(
      companyId,
      location,
    );

    if (contractId.length === 0) {
      return Response.json(
        {
          message: "Công ty chưa có hợp đồng nào",
          data: [],
        },
        { status: 200 },
      );
    }

    const { startTime, endTime } = getWeekDateRange(date);

    const shifts = await getAllShiftsByDateRangeService({
      contractId,
      startTime,
      endTime,
      location,
    });

    return Response.json(
      {
        message: "Lấy danh sách ca trực theo tuần thành công",
        data: shifts,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Lấy danh sách ca trực theo tuần thất bại";

    return Response.json({ message }, { status: 400 });
  }
};

export const handleGetGuardShiftsByDay = async (request: Request) => {
  try {
    const { date } = getGuardShiftQueryParams(request);

    const guardResult = await resolveGuardIdForShift();

    if ("response" in guardResult) {
      return guardResult.response;
    }

    const { startTime, endTime } = getDayDateRange(date);

    const result = await getGuardShiftsService({
      guard_id: guardResult.guardId,
      start_date: date,
      end_date: addDaysToDateKey(date, 1),
      start_time: startTime,
      end_time: endTime,
    });

    return Response.json(
      {
        message: "Lấy ca trực trong ngày thành công",
        data: result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Lấy ca trực trong ngày thất bại";

    return Response.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
};

export const handleGetGuardShiftsByWeek = async (request: Request) => {
  try {
    const { date } = getGuardShiftQueryParams(request);

    const guardResult = await resolveGuardIdForShift();

    if ("response" in guardResult) {
      return guardResult.response;
    }

    const weekStartDate = startOfWeekMondayDateKey(date);
    const weekEndDate = addDaysToDateKey(weekStartDate, 7);

    const { startTime, endTime } = getWeekDateRange(date);

    const result = await getGuardShiftsService({
      guard_id: guardResult.guardId,
      start_date: weekStartDate,
      end_date: weekEndDate,
      start_time: startTime,
      end_time: endTime,
    });

    return Response.json(
      {
        message: "Lấy lịch trực theo tuần thành công",
        data: result,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Lấy lịch trực theo tuần thất bại";

    return Response.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
};

export const handleGetGuardShiftDetail = async ({
  shiftId,
}: {
  shiftId: string;
}): Promise<GuardShiftDetailItem> => {
  if (!shiftId || !isValidUuid(shiftId)) {
    throw new ShiftApiError("Mã ca trực không hợp lệ.", 400);
  }

  const user = await getUser();

  if (!user) {
    throw new ShiftApiError("Bạn cần đăng nhập để xem ca trực.", 401);
  }

  const guard = await getGuardByUserIdService(user.id);

  if (!guard) {
    throw new ShiftApiError("Không tìm thấy thông tin bảo vệ.", 403);
  }

  const assignment = await getShiftAssignmentByShiftAndGuardService({
    shiftId,
    guardId: user.id,
  });

  if (!assignment) {
    throw new ShiftApiError(
      "Bạn không có quyền xem ca trực này hoặc ca trực không tồn tại.",
      404,
    );
  }

  const shift = await getShiftByIdService(shiftId);

  if (!shift) {
    throw new ShiftApiError("Không tìm thấy ca trực.", 404);
  }

  const contract = shift.contract_id
    ? await getContractByIdService(shift.contract_id)
    : null;

  const booking = contract?.booking_id
    ? await getBookingByIdService(contract.booking_id)
    : null;

  const company = booking?.company_id
    ? await getCompanyByIdService(booking.company_id)
    : null;

  const service = booking?.service_id
    ? await getServiceByIdService(booking.service_id)
    : null;

  const assignedByProfile = assignment.assigned_by
    ? await getProfileByUserIdService(assignment.assigned_by)
    : null;

  const shiftAssignments = await getShiftAssignmentsByShiftIdService(
    shift.shift_id,
  );

  const userIds = shiftAssignments.map((item) => item.guard_id);
  const replacementGuardIds = shiftAssignments.flatMap((item) => item.replacement_guard_ids || []);
  const supabase = await createClient();
  let replacementUserIds: string[] = [];
  let guardsMapping: any[] = [];
  if (replacementGuardIds.length > 0) {
    const { data: dbGuards } = await supabase
      .from("guards")
      .select("guard_id, user_id")
      .in("guard_id", replacementGuardIds);
    guardsMapping = dbGuards || [];
    replacementUserIds = guardsMapping.map((g) => g.user_id);
  }

  const allUserIds = [...new Set([...userIds, ...replacementUserIds])];
  const profiles = await getProfilesByUserIdsService(allUserIds);

  const guardList: any[] = [];

  shiftAssignments.forEach((sa) => {
    const profile = profiles.find((item) => item.user_id === sa.guard_id);
    const hasRep = sa.replacement_guard_ids && sa.replacement_guard_ids.length > 0;

    // Add original guard
    guardList.push({
      guard_id: sa.guard_id,
      user_id: sa.guard_id,
      full_name: profile?.full_name || "Chưa có tên",
      phone_number: profile?.phone_number || null,
      avatar_url: profile?.avatar_url || null,
      status: hasRep ? "absent" : sa.status,
      check_in_time: hasRep ? null : sa.check_in_time,
      is_replacement: false,
      replacement_guard_ids: sa.replacement_guard_ids || [],
    });

    // Add replacement guards
    if (hasRep) {
      sa.replacement_guard_ids.forEach((repGuardId) => {
        const mappedGuard = guardsMapping.find((g) => g.guard_id === repGuardId);
        if (mappedGuard) {
          const repProfile = profiles.find((item) => item.user_id === mappedGuard.user_id);
          guardList.push({
            guard_id: mappedGuard.user_id,
            user_id: mappedGuard.user_id,
            full_name: repProfile?.full_name || "Chưa có tên",
            phone_number: repProfile?.phone_number || null,
            avatar_url: repProfile?.avatar_url || null,
            status: sa.status,
            check_in_time: sa.check_in_time,
            is_replacement: true,
            replaced_guard_name: profile?.full_name || "Bảo vệ gốc",
          });
        }
      });
    }
  });

  const shiftImage = await getShiftImageByAssignmentIdService(assignment.assignment_id);

  return {
    id: shift.shift_id,
    shift_id: shift.shift_id,
    assignment_id: assignment.assignment_id,
    time: formatShiftTime(shift.start_time, shift.end_time),
    location: shift.location || "Chưa cập nhật vị trí",
    shift_name: shift.shift_name || "Chưa cập nhật ca trực",
    address: booking?.address || shift.location || "Chưa cập nhật địa chỉ",
    status: assignment.status,
    check_in_time: assignment.check_in_time,
    start_time: shift.start_time,
    end_time: shift.end_time,
    required_guards: shift.required_guards,
    assigned_by: assignedByProfile
      ? {
        user_id: assignedByProfile.user_id,
        full_name: assignedByProfile.full_name || "Điều phối viên",
        phone_number: assignedByProfile.phone_number || null,
      }
      : null,
    allowed_late_minutes: company?.allowed_late_minutes ?? 5,
    allowed_absent_minutes: company?.allowed_absent_minutes ?? 35,
    company: company
      ? {
        company_id: company.company_id,
        company_name: company.company_name || "Chưa cập nhật công ty",
        address: typeof company.address === "string" ? company.address : null,
        allowed_late_minutes: company.allowed_late_minutes ?? 5,
        allowed_absent_minutes: company.allowed_absent_minutes ?? 35,
      }
      : null,
    service: service
      ? {
        service_id: service.service_id,
        name: service.name,
      }
      : null,
    contract: contract
      ? {
        contract_id: contract.contract_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        status: contract.status,
      }
      : null,
    guards: guardList,
    checkin_image: shiftImage
      ? {
        image_url: shiftImage.image_url,
        image_path: shiftImage.image_path,
        created_at: shiftImage.created_at,
      }
      : null,
  };
};

export const handleCheckinGuardShift = async ({
  shiftId,
  file,
}: {
  shiftId: string;
  file?: File;
}) => {
  if (!shiftId || !isValidUuid(shiftId)) {
    throw new ShiftApiError("Mã ca trực không hợp lệ.", 400);
  }

  const user = await getUser();

  if (!user) {
    throw new ShiftApiError("Bạn cần đăng nhập để điểm danh.", 401);
  }

  const guard = await getGuardByUserIdService(user.id);

  if (!guard) {
    throw new ShiftApiError("Không tìm thấy thông tin bảo vệ.", 403);
  }

  const shift = await getShiftByIdService(shiftId);

  if (!shift) {
    throw new ShiftApiError("Không tìm thấy ca trực.", 404);
  }

  const assignment = await getShiftAssignmentByShiftAndGuardService({
    shiftId,
    guardId: user.id,
  });

  if (!assignment) {
    throw new ShiftApiError(
      "Bạn không có quyền điểm danh ca trực này hoặc ca trực không tồn tại.",
      404,
    );
  }

  // Prevent replacement guards from checking in
  if (assignment.guard_id !== user.id) {
    throw new ShiftApiError(
      "Bảo vệ thay thế không cần điểm danh cho ca trực này.",
      403,
    );
  }

  if (assignment.check_in_time) {
    throw new ShiftApiError("Ca trực này đã được điểm danh.", 409);
  }

  if (assignment.status === "absent") {
    throw new ShiftApiError("Ca trực này đã bị đánh dấu vắng mặt.", 409);
  }

  const now = new Date();
  const shiftStartTime = new Date(shift.start_time);

  if (Number.isNaN(shiftStartTime.getTime())) {
    throw new ShiftApiError("Thời gian bắt đầu ca trực không hợp lệ.", 400);
  }

  let companyLateMinutes = 5;
  let companyAbsentMinutes = 35;

  if (shift.contract_id) {
    const contract = await getContractByIdService(shift.contract_id);
    if (contract?.booking_id) {
      const booking = await getBookingByIdService(contract.booking_id);
      if (booking?.company_id) {
        const company = await getCompanyByIdService(booking.company_id);
        if (company) {
          if (typeof company.allowed_late_minutes === "number" && company.allowed_late_minutes >= 0) {
            companyLateMinutes = company.allowed_late_minutes;
          }
          if (typeof company.allowed_absent_minutes === "number" && company.allowed_absent_minutes > 0) {
            companyAbsentMinutes = company.allowed_absent_minutes;
          }
        }
      }
    }
  }

  const startCheckinLimit = new Date(shiftStartTime.getTime());
  const lateCheckinLimit = new Date(shiftStartTime.getTime() + companyLateMinutes * 60 * 1000);
  const absentLimit = new Date(shiftStartTime.getTime() + companyAbsentMinutes * 60 * 1000);

  if (now < startCheckinLimit) {
    throw new ShiftApiError("Chưa đến thời gian điểm danh.", 400);
  }

  // Case: past absent limit
  if (now >= absentLimit) {
    await updateShiftAssignmentStatusByShiftAndGuardService({
      shiftId,
      guardId: user.id,
      status: "absent",
    });
    assignment.status = "absent";
    throw new ShiftApiError(
      "Đã quá thời gian điểm danh. Bạn được ghi nhận vắng mặt.",
      409,
    );
  }

  // Determine status and image type
  let determinedStatus: ShiftAssignmentStatus = "completed";
  let determinedImageType = "checkin";

  if (now > lateCheckinLimit && now < absentLimit) {
    determinedStatus = "late";
    determinedImageType = "late";
  }

  // Update status and check_in_time in DB
  const updatedAssignment =
    await updateShiftAssignmentStatusByShiftAndGuardService({
      shiftId,
      guardId: user.id,
      status: determinedStatus,
      check_in_time: now.toISOString(),
    });

  if (!updatedAssignment) {
    throw new ShiftApiError("Không thể điểm danh ca trực.", 500);
  }

  if (file) {
    try {
      const uploadResult = await uploadShiftCheckinImageService(
        updatedAssignment.assignment_id,
        file,
      );

      await createShiftImageService({
        assignmentId: updatedAssignment.assignment_id,
        imageUrl: uploadResult.publicUrl,
        imagePath: uploadResult.path,
        imageType: determinedImageType,
      });
    } catch (imgError) {
      console.error(
        "Lỗi khi tải lên storage hoặc lưu thông tin ảnh check-in vào DB:",
        imgError,
      );
    }
  }

  return {
    assignment: updatedAssignment,
    checkin_window: {
      server_time: now.toISOString(),
      can_checkin_from: startCheckinLimit.toISOString(),
      absent_after: absentLimit.toISOString(),
    },
  };
};

export const handleGetGuardAvailability = async (request: Request) => {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json(
        { message: "Người dùng chưa đăng nhập" },
        { status: 401 },
      );
    }

    const profileResponse = await handleGetUserProfile(user.id);
    const profile = profileResponse.data;

    if (!profile) {
      return Response.json(
        { message: "Không tìm thấy thông tin người dùng" },
        { status: 404 },
      );
    }

    if (profile.role !== "coordinator" && profile.role !== "company-admin") {
      return Response.json(
        { message: "Bạn không có quyền kiểm tra lịch bảo vệ" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      guardIds: string[];
      startTime?: string;
      endTime?: string;
      proposedShifts?: { startTime: string; endTime: string }[];
    };

    let proposedShifts = body.proposedShifts;
    if (!proposedShifts && body.startTime && body.endTime) {
      proposedShifts = [{ startTime: body.startTime, endTime: body.endTime }];
    }

    if (
      !Array.isArray(body.guardIds) ||
      !Array.isArray(proposedShifts) ||
      proposedShifts.length === 0
    ) {
      return Response.json(
        { message: "Thiếu thông tin kiểm tra lịch bảo vệ" },
        { status: 400 },
      );
    }

    // Determine total date range to query
    const startTimes = proposedShifts.map((ps) => new Date(ps.startTime).getTime());
    const endTimes = proposedShifts.map((ps) => new Date(ps.endTime).getTime());
    const minTime = new Date(Math.min(...startTimes));
    const maxTime = new Date(Math.max(...endTimes));

    // Convert to local dates to get week boundaries
    minTime.setUTCHours(minTime.getUTCHours() + 7);
    maxTime.setUTCHours(maxTime.getUTCHours() + 7);
    const minDateStr = minTime.toISOString().split("T")[0];
    const maxDateStr = maxTime.toISOString().split("T")[0];

    const startOfWeekKey = getStartOfWeekKey(minDateStr);
    const endOfWeekKey = addDaysToDateKey(getStartOfWeekKey(maxDateStr), 6);

    const rangeStartISO = new Date(`${startOfWeekKey}T00:00:00+07:00`).toISOString();
    const rangeEndISO = new Date(`${endOfWeekKey}T23:59:59+07:00`).toISOString();

    const dbShifts = await getGuardsShiftsInRangeService({
      guardIds: body.guardIds,
      startTime: rangeStartISO,
      endTime: rangeEndISO,
    });

    const availabilityMap: Record<string, {
      guardId: string;
      hasConflict: boolean;
      assignedMinutesToday: number;
      proposedMinutes: number;
      totalMinutesAfterAssign: number;
      exceedsDailyLimit: boolean;
      assignedMinutesThisWeek: number;
      totalMinutesWeekAfterAssign: number;
      exceedsWeeklyLimit: boolean;
      reason: string;
    }> = {};

    for (const guardId of body.guardIds) {
      const guardShifts = dbShifts.filter((s) => s.guard_id === guardId);

      let firstConflictDate: string | null = null;
      let firstExceedsDailyDate: string | null = null;
      let firstExceedsWeeklyDate: string | null = null;

      let lastProposedMinutes = 0;
      let lastAssignedMinutesToday = 0;
      let lastTotalMinutesAfterAssign = 0;
      let lastAssignedMinutesThisWeek = 0;
      let lastTotalMinutesWeekAfterAssign = 0;

      for (const ps of proposedShifts) {
        const startProposed = new Date(ps.startTime).getTime();
        const endProposed = new Date(ps.endTime).getTime();
        const proposedDuration = (endProposed - startProposed) / (1000 * 60);

        const localProp = new Date(ps.startTime);
        localProp.setUTCHours(localProp.getUTCHours() + 7);
        const propDateStr = localProp.toISOString().split("T")[0];
        const propWeekKey = getStartOfWeekKey(propDateStr);

        // Daily shifts of this guard on propDateStr
        let assignedToday = 0;
        let hasConflict = false;

        for (const gs of guardShifts) {
          // Get local date of gs
          const gsStart = new Date(gs.start_time);
          gsStart.setUTCHours(gsStart.getUTCHours() + 7);
          const gsDateStr = gsStart.toISOString().split("T")[0];

          if (gsDateStr === propDateStr) {
            assignedToday += gs.duration_minutes;

            const startDb = new Date(gs.start_time).getTime();
            const endDb = new Date(gs.end_time).getTime();
            if (startDb < endProposed && endDb > startProposed) {
              hasConflict = true;
            }
          }
        }

        // Weekly shifts of this guard in propWeekKey
        let assignedThisWeek = 0;
        for (const gs of guardShifts) {
          const gsStart = new Date(gs.start_time);
          gsStart.setUTCHours(gsStart.getUTCHours() + 7);
          const gsDateStr = gsStart.toISOString().split("T")[0];
          const gsWeekKey = getStartOfWeekKey(gsDateStr);

          if (gsWeekKey === propWeekKey) {
            assignedThisWeek += gs.duration_minutes;
          }
        }

        const totalToday = assignedToday + proposedDuration;
        const totalWeek = assignedThisWeek + proposedDuration;

        if (hasConflict && !firstConflictDate) {
          firstConflictDate = propDateStr;
        }
        if (totalToday > 8 * 60 && !firstExceedsDailyDate) {
          firstExceedsDailyDate = propDateStr;
        }
        if (totalWeek > 48 * 60 && !firstExceedsWeeklyDate) {
          firstExceedsWeeklyDate = propDateStr;
        }

        // Keep last checked stats to return in map
        lastProposedMinutes = proposedDuration;
        lastAssignedMinutesToday = assignedToday;
        lastTotalMinutesAfterAssign = totalToday;
        lastAssignedMinutesThisWeek = assignedThisWeek;
        lastTotalMinutesWeekAfterAssign = totalWeek;
      }

      let reason = "Có thể phân công";
      let hasConflict = false;
      let exceedsDailyLimit = false;
      let exceedsWeeklyLimit = false;

      const formatDateStrVN = (ds: string) => {
        const [yr, mo, dy] = ds.split("-");
        return `${dy}/${mo}/${yr}`;
      };

      if (firstConflictDate) {
        hasConflict = true;
        reason = `Trùng lịch ngày ${formatDateStrVN(firstConflictDate)}`;
      } else if (firstExceedsDailyDate) {
        exceedsDailyLimit = true;
        reason = `Vượt quá 8 giờ ngày ${formatDateStrVN(firstExceedsDailyDate)}`;
      } else if (firstExceedsWeeklyDate) {
        exceedsWeeklyLimit = true;
        const weekMon = getStartOfWeekKey(firstExceedsWeeklyDate);
        const weekSun = addDaysToDateKey(weekMon, 6);
        reason = `Vượt quá 48 giờ tuần ${formatDateStrVN(weekMon)} - ${formatDateStrVN(weekSun)}`;
      }

      availabilityMap[guardId] = {
        guardId,
        hasConflict,
        assignedMinutesToday: lastAssignedMinutesToday,
        proposedMinutes: lastProposedMinutes,
        totalMinutesAfterAssign: lastTotalMinutesAfterAssign,
        exceedsDailyLimit,
        assignedMinutesThisWeek: lastAssignedMinutesThisWeek,
        totalMinutesWeekAfterAssign: lastTotalMinutesWeekAfterAssign,
        exceedsWeeklyLimit,
        reason,
      };
    }

    return Response.json(
      {
        message: "Kiểm tra lịch bảo vệ thành công",
        data: availabilityMap,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Kiểm tra lịch bảo vệ thất bại";

    return Response.json({ message }, { status: 400 });
  }
};

export const handleGetLatestShiftDate = async (contractId: string) => {
  const user = await getUser();

  if (!user) {
    return Response.json(
      {
        message: "Người dùng chưa đăng nhập",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const date = await getLatestShiftDateService(contractId);
    return Response.json(
      {
        message: "Lấy ngày ca trực cuối cùng thành công",
        data: date,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lấy ngày ca trực cuối cùng thất bại",
      },
      {
        status: 500,
      },
    );
  }
};

export const handleGetScheduledShiftDates = async (contractId: string) => {
  const user = await getUser();

  if (!user) {
    return Response.json(
      {
        message: "Người dùng chưa đăng nhập",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const dates = await getScheduledShiftDatesService(contractId);
    return Response.json({
      message: "Lấy danh sách ngày đã phân công thành công",
      data: dates,
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Lấy danh sách ngày đã phân công thất bại",
      },
      {
        status: 500,
      },
    );
  }
};

export const handleGetReplacementGuards = async (
  request: Request,
  { params }: { params: { shiftId: string } }
) => {
  try {
    const { shiftId } = params;
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    // Match all UUIDs from the shiftId string (handles composite keys like shift1-shift2)
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
    const shiftIds: string[] = shiftId ? (shiftId.match(uuidRegex) || []) : [];

    if (shiftIds.length === 0) {
      return Response.json({ message: "Mã ca trực không hợp lệ" }, { status: 400 });
    }
    if (!assignmentId || !isValidUuid(assignmentId)) {
      return Response.json({ message: "Mã phân công không hợp lệ" }, { status: 400 });
    }

    const companyId = await resolveShiftCompanyId();

    const firstShift = await getShiftByIdService(shiftIds[0]);
    if (!firstShift) {
      return Response.json({ message: "Không tìm thấy ca trực" }, { status: 404 });
    }

    const lastShift = shiftIds.length > 1
      ? await getShiftByIdService(shiftIds[shiftIds.length - 1])
      : firstShift;

    if (!lastShift) {
      return Response.json({ message: "Không tìm thấy ca trực cuối" }, { status: 404 });
    }

    const contract = firstShift.contract_id
      ? await getContractByIdService(firstShift.contract_id)
      : null;
    if (!contract) {
      return Response.json({ message: "Không tìm thấy hợp đồng của ca trực" }, { status: 404 });
    }

    const booking = contract.booking_id
      ? await getBookingByIdService(contract.booking_id)
      : null;
    if (!booking || booking.company_id !== companyId) {
      return Response.json({ message: "Bạn không có quyền truy cập ca trực này" }, { status: 403 });
    }

    // Fetch original assignment from the first shift in the list
    const assignments = await getShiftAssignmentsByShiftIdService(shiftIds[0]);
    const assignment = assignments.find(a => a.assignment_id === assignmentId);
    if (!assignment) {
      return Response.json({ message: "Không tìm thấy thông tin phân công gốc" }, { status: 404 });
    }

    // Fetch all active guards of the company
    const supabase = await createClient();
    const { data: allCompanyGuards, error: guardsError } = await supabase
      .from("guards")
      .select(`
        guard_id,
        user_id,
        company_id,
        profiles!guards_user_id_fkey (
          user_id,
          full_name,
          phone_number,
          avatar_url,
          email,
          status
        )
      `)
      .eq("company_id", companyId);

    if (guardsError) {
      throw guardsError;
    }

    const activeGuards = (allCompanyGuards || [])
      .map((g: any) => {
        const profile = Array.isArray(g.profiles) ? g.profiles[0] : g.profiles;
        return {
          guard_id: g.guard_id,
          user_id: g.user_id,
          full_name: profile?.full_name ?? "Chưa cập nhật",
          phone_number: profile?.phone_number ?? "",
          avatar_url: profile?.avatar_url ?? null,
          email: profile?.email ?? "",
          status: profile?.status ?? "unactive"
        };
      })
      .filter(g => g.status === "active");

    // Filter out original guard of target assignment
    const originalGuardUserId = assignment.guard_id;

    // Fetch all assignments across all target shifts to determine main guards and other replacements
    const allShiftAssignments = await Promise.all(
      shiftIds.map(id => getShiftAssignmentsByShiftIdService(id))
    );
    const flatAssignments = allShiftAssignments.flat();
    const assignedUserIds = flatAssignments.map(a => a.guard_id);
    const otherReplacementGuardIds = flatAssignments
      .filter(a => a.guard_id !== originalGuardUserId)
      .flatMap(a => a.replacement_guard_ids || []);

    // Get list of guards with conflicts during this entire merged slot duration
    const userIdsToCheck = activeGuards.map(g => g.user_id);
    const overlaps = await getOverlappingGuardShiftsService({
      guardId: userIdsToCheck,
      startTime: firstShift.start_time,
      endTime: lastShift.end_time
    });

    // Find overlaps that are NOT on any of the target shifts
    const conflictedUserIds = new Set(
      overlaps
        .filter(o => !shiftIds.includes(o.shift_id))
        .map(o => o.guard_id)
    );

    // Get list of guards with any shifts scheduled on this entire day (for Outside Contract filters)
    const datePart = firstShift.start_time.split(/[T ]/)[0];
    const dayStart = `${datePart}T00:00:00Z`;
    const dayEnd = `${datePart}T23:59:59Z`;

    const dayOverlaps = await getOverlappingGuardShiftsService({
      guardId: userIdsToCheck,
      startTime: dayStart,
      endTime: dayEnd
    });

    const guardsWithShiftsOnDay = new Set(
      dayOverlaps
        .filter(o => !shiftIds.includes(o.shift_id))
        .map(o => o.guard_id)
    );

    // Group active guards
    const candidateGuards = activeGuards.filter(g => {
      // 1. Cannot be the original guard of this assignment
      if (g.user_id === originalGuardUserId) return false;
      // 2. Cannot be already assigned as a main guard on this shift
      if (assignedUserIds.includes(g.user_id)) return false;
      // 3. Cannot be a replacement guard on this shift for another assignment
      if (otherReplacementGuardIds.includes(g.guard_id)) return false;
      // 4. Cannot have a conflicting shift
      if (conflictedUserIds.has(g.user_id)) return false;
      return true;
    });

    const guardAssignedInContract = contract.guard_assigned || [];

    const contractGuards = candidateGuards.filter(g =>
      guardAssignedInContract.includes(g.guard_id)
    );

    const outsideContractGuards = candidateGuards.filter(g =>
      !guardAssignedInContract.includes(g.guard_id) &&
      !guardsWithShiftsOnDay.has(g.user_id)
    );

    const currentReplacementGuards = activeGuards.filter(g =>
      assignment.replacement_guard_ids && assignment.replacement_guard_ids.includes(g.guard_id)
    );

    return Response.json({
      success: true,
      data: {
        contractGuards,
        outsideContractGuards,
        currentReplacementGuards,
      }
    });

  } catch (error) {
    return Response.json(
      {
        message: error instanceof Error ? error.message : "Lấy danh sách bảo vệ thay thế thất bại",
      },
      { status: 500 }
    );
  }
};

export const handleUpdateReplacementGuards = async (
  request: Request,
  { params }: { params: { shiftId: string; assignmentId: string } }
) => {
  try {
    const { shiftId, assignmentId } = params;
    const body = (await request.json()) as { replacementGuardIds?: string[] };

    writeDebugLog("[handleUpdateReplacementGuards] Input parameters:", { shiftId, assignmentId, body });

    // Match all UUIDs from the shiftId string (handles composite keys like shift1-shift2)
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
    const shiftIds: string[] = shiftId ? (shiftId.match(uuidRegex) || []) : [];

    writeDebugLog("[handleUpdateReplacementGuards] Matched shiftIds:", shiftIds);

    if (shiftIds.length === 0) {
      return Response.json({ message: "Mã ca trực không hợp lệ" }, { status: 400 });
    }
    if (!assignmentId || !isValidUuid(assignmentId)) {
      return Response.json({ message: "Mã phân công không hợp lệ" }, { status: 400 });
    }
    if (!body.replacementGuardIds || !Array.isArray(body.replacementGuardIds)) {
      return Response.json({ message: "Danh sách bảo vệ thay thế không hợp lệ" }, { status: 400 });
    }

    const companyId = await resolveShiftCompanyId();

    const firstShift = await getShiftByIdService(shiftIds[0]);
    if (!firstShift) {
      return Response.json({ message: "Không tìm thấy ca trực" }, { status: 404 });
    }

    const lastShift = shiftIds.length > 1
      ? await getShiftByIdService(shiftIds[shiftIds.length - 1])
      : firstShift;

    if (!lastShift) {
      return Response.json({ message: "Không tìm thấy ca trực cuối" }, { status: 404 });
    }

    const contract = firstShift.contract_id
      ? await getContractByIdService(firstShift.contract_id)
      : null;
    if (!contract) {
      return Response.json({ message: "Không tìm thấy hợp đồng của ca trực" }, { status: 404 });
    }

    const booking = contract.booking_id
      ? await getBookingByIdService(contract.booking_id)
      : null;
    if (!booking || booking.company_id !== companyId) {
      return Response.json({ message: "Bạn không có quyền truy cập ca trực này" }, { status: 403 });
    }

    // Fetch original assignment from the first shift
    const assignments = await getShiftAssignmentsByShiftIdService(shiftIds[0]);
    const assignment = assignments.find(a => a.assignment_id === assignmentId);
    if (!assignment) {
      return Response.json({ message: "Không tìm thấy thông tin phân công gốc" }, { status: 404 });
    }

    // Find all assignments of this guard in all of these merged shifts
    const supabase = await createClient();
    const { data: dbAssignments } = await supabase
      .from("shift_assignments")
      .select("*")
      .in("shift_id", shiftIds)
      .eq("guard_id", assignment.guard_id);

    const targetAssignments = dbAssignments || [];
    if (targetAssignments.length === 0) {
      return Response.json({ message: "Không tìm thấy thông tin phân công gốc ở các ca trực" }, { status: 404 });
    }

    // Validate original assignments: the guard must not have checked in for any of these shifts
    const canDispatch = targetAssignments.every(a => a.check_in_time === null);

    if (!canDispatch) {
      return Response.json(
        {
          success: false,
          message: "Không thể điều phối thay thế vì bảo vệ đã điểm danh cho một trong các ca trực này."
        },
        { status: 409 }
      );
    }

    // Deduplicate input replacementGuardIds and filter out nulls/empties
    const newReplacementGuardIds = Array.from(
      new Set(body.replacementGuardIds.filter((id): id is string => Boolean(id) && isValidUuid(id)))
    );

    writeDebugLog("[handleUpdateReplacementGuards] parsed newReplacementGuardIds:", newReplacementGuardIds);

    if (newReplacementGuardIds.length > 0) {
      // Validate guards exist, belong to same company, are active
      const { data: dbGuards, error: guardsError } = await supabase
        .from("guards")
        .select(`
          guard_id,
          user_id,
          company_id,
          profiles!guards_user_id_fkey (
            status
          )
        `)
        .in("guard_id", newReplacementGuardIds);

      if (guardsError) {
        throw guardsError;
      }

      if (!dbGuards || dbGuards.length !== newReplacementGuardIds.length) {
        return Response.json({ message: "Một số bảo vệ không tồn tại trong hệ thống" }, { status: 400 });
      }

      for (const dg of dbGuards) {
        if (dg.company_id !== companyId) {
          return Response.json({ message: "Một số bảo vệ không thuộc công ty của bạn" }, { status: 403 });
        }
        const profile = Array.isArray(dg.profiles) ? dg.profiles[0] : dg.profiles;
        if (!profile || profile.status !== "active") {
          return Response.json({ message: `Bảo vệ với ID ${dg.guard_id} đang bị khóa hoặc không hoạt động` }, { status: 400 });
        }
        // Original guard user ID cannot be in replacement list
        if (dg.user_id === assignment.guard_id) {
          return Response.json({ message: "Bảo vệ thay thế không thể là bảo vệ gốc" }, { status: 400 });
        }
      }

      // Check overlapping conflicts across the entire merged duration
      const dbGuardUserIds = dbGuards.map(dg => dg.user_id);
      const overlaps = await getOverlappingGuardShiftsService({
        guardId: dbGuardUserIds,
        startTime: firstShift.start_time,
        endTime: lastShift.end_time
      });

      // Find overlaps that are NOT on any of the target shifts
      const otherOverlaps = overlaps.filter(o => !shiftIds.includes(o.shift_id));
      if (otherOverlaps.length > 0) {
        return Response.json({ message: "Một số bảo vệ được chọn có lịch trực trùng giờ ở ca khác" }, { status: 400 });
      }

      // Ensure no guard is assigned as a main guard or replacement guard on another assignment for any of these shifts
      const allShiftAssignments = await Promise.all(
        shiftIds.map(id => getShiftAssignmentsByShiftIdService(id))
      );
      const flatAssignments = allShiftAssignments.flat();
      const assignedUserIds = flatAssignments.filter(a => a.guard_id !== assignment.guard_id).map(a => a.guard_id);
      const otherReplacementGuardIds = flatAssignments
        .filter(a => a.guard_id !== assignment.guard_id)
        .flatMap(a => a.replacement_guard_ids || []);

      for (const dg of dbGuards) {
        if (assignedUserIds.includes(dg.user_id)) {
          return Response.json({ message: `Bảo vệ với ID ${dg.guard_id} đã được gán làm bảo vệ chính trong một trong các ca trực này` }, { status: 400 });
        }
        if (otherReplacementGuardIds.includes(dg.guard_id)) {
          return Response.json({ message: `Bảo vệ với ID ${dg.guard_id} đã được điều phối thay thế cho người khác trong các ca trực này` }, { status: 400 });
        }
      }
    }

    // Update replacement_guard_ids for ALL assignments in parallel
    writeDebugLog("[handleUpdateReplacementGuards] Updating target assignments:", { targetAssignments: targetAssignments.map(a => a.assignment_id), with: newReplacementGuardIds });
    const updatePromises = targetAssignments.map(a =>
      updateReplacementGuardsService(a.assignment_id, newReplacementGuardIds)
    );
    const updatedAssignments = await Promise.all(updatePromises);
    writeDebugLog("[handleUpdateReplacementGuards] Database update complete. Updated rows:", updatedAssignments.map(ua => ({ assignment_id: ua.assignment_id, replacement_guard_ids: ua.replacement_guard_ids })));

    return Response.json({
      success: true,
      message: "Cập nhật danh sách bảo vệ thay thế thành công",
      data: {
        updated_count: updatedAssignments.length,
        replacement_guard_ids: newReplacementGuardIds,
      }
    });

  } catch (error) {
    return Response.json(
      {
        message: error instanceof Error ? error.message : "Cập nhật danh sách bảo vệ thay thế thất bại",
      },
      { status: 500 }
    );
  }
};

