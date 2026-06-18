import {
  createWorkShiftService,
  getContractShiftRuleService,
  getShiftContractOptionsService,
  getOverlappingGuardShiftsService,
  getAllShiftsByDateRangeService,
} from "../service/shift.service";
import { handleGetUserProfile } from "@/features/auth/controller/auth.controller";
import {
  getCompanyByOwnerIdService,
  getCoordinatorByCompanyIdService,
} from "@/features/guards/service/guard.service";
import { getUser } from "@/features/auth/service/auth.service";
import type { CreateShiftInput } from "../type";
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
import { getGuardShiftsService } from "../service/shift.service";
import { startOfWeekMondayDateKey } from "../utils/shift.utils";

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
