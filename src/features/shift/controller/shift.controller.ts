import {
  createWorkShiftService,
  getContractShiftRuleService,
  getShiftContractOptionsService,
  getOverlappingGuardShiftsService,
  getAllShiftsByDateRangeService,
  updateAssignedShiftAssignmentsToAbsentByShiftIdService,
  createShiftImageService,
} from "../service/shift.service";
import { handleGetUserProfile } from "@/features/auth/controller/auth.controller";
import {
  getCompanyByOwnerIdService,
  getCoordinatorByCompanyIdService,
} from "@/features/guards/service/guard.service";
import { getUser } from "@/features/auth/service/auth.service";
import type { CreateShiftInput, GuardShiftDetailItem } from "../type";
import {
  validateCreateShiftInput,
  validateShiftDateInContract,
} from "../validator/shift.validate";
import { getContractIdsByCompanyService } from "@/features/contract/service/contract.service";
import {
  getDayDateRange,
  getWeekDateRange,
  isValidDateKey,
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
    } else if (profile.role === "Coordinator") {
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

    if (profile.role !== "Coordinator" && profile.role !== "company-admin") {
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
    };

    validateCreateShiftInput(input);

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
      return Response.json(
        {
          message: "Một hoặc nhiều bảo vệ đã có ca trực trong khung giờ này",
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

  if (profile.role === "Coordinator") {
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
  const profiles = await getProfilesByUserIdsService(userIds);

  const guardList = shiftAssignments.map((shiftAssignment) => {
    const profile = profiles.find(
      (item) => item.user_id === shiftAssignment.guard_id,
    );

    return {
      guard_id: shiftAssignment.guard_id,
      user_id: shiftAssignment.guard_id,
      full_name: profile?.full_name || "Chưa có tên",
      phone_number: profile?.phone_number || null,
      avatar_url: profile?.avatar_url || null,
      status: shiftAssignment.status,
    };
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
    company: company
      ? {
          company_id: company.company_id,
          company_name: company.company_name || "Chưa cập nhật công ty",
          address: typeof company.address === "string" ? company.address : null,
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
  imageUrl,
  imagePath,
}: {
  shiftId: string;
  imageUrl?: string;
  imagePath?: string;
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

  /**
   * DB hiện tại của bạn:
   * shift_assignments.guard_id = profiles.user_id
   * nên chỗ này dùng user.id, không dùng guard.guard_id.
   */
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

  if (assignment.status === "completed") {
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

  const canCheckinFrom = new Date(
    shiftStartTime.getTime() - CHECKIN_BEFORE_MINUTES * 60 * 1000,
  );

  const absentAfter = new Date(
    shiftStartTime.getTime() + CHECKIN_AFTER_MINUTES * 60 * 1000,
  );

  if (now < canCheckinFrom) {
    throw new ShiftApiError(
      `Chưa đến thời gian điểm danh. Bạn có thể điểm danh từ ${formatTimes(
        canCheckinFrom.toISOString(),
      )}.`,
      400,
    );
  }

  /**
   * Từ start_time + 5 phút trở đi:
   * assigned -> absent
   */
  if (now >= absentAfter) {
    const updatedAssignments =
      await updateAssignedShiftAssignmentsToAbsentByShiftIdService(shiftId);

    const currentAssignment = updatedAssignments.find(
      (item) => item.guard_id === user.id,
    );

    if (!currentAssignment) {
      throw new ShiftApiError("Ca trực đã quá thời gian điểm danh.", 409);
    }

    return {
      assignment: currentAssignment,
      checkin_window: {
        server_time: now.toISOString(),
        can_checkin_from: canCheckinFrom.toISOString(),
        absent_after: absentAfter.toISOString(),
      },
    };
  }

  /**
   * Trong khoảng hợp lệ:
   * assigned -> completed
   */
  const updatedAssignment =
    await updateShiftAssignmentStatusByShiftAndGuardService({
      shiftId,
      guardId: user.id,
      status: "completed",
    });

  if (!updatedAssignment) {
    throw new ShiftApiError("Không thể điểm danh ca trực.", 500);
  }

  if (imageUrl) {
    try {
      await createShiftImageService({
        assignmentId: updatedAssignment.assignment_id,
        imageUrl,
        imagePath: imagePath || null,
        imageType: "checkin",
      });
    } catch (imgError) {
      console.error("Lỗi khi lưu thông tin ảnh check-in vào DB:", imgError);
    }
  }

  return {
    assignment: updatedAssignment,
    checkin_window: {
      server_time: now.toISOString(),
      can_checkin_from: canCheckinFrom.toISOString(),
      absent_after: absentAfter.toISOString(),
    },
  };
};
