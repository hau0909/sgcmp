import type { CreateShiftInput } from "../type";
import { localTimeToUtc } from "@/utils/dateTime";

export const validateCreateShiftInput = (input: CreateShiftInput) => {
  if (!input.contract_id) {
    throw new Error("Vui lòng chọn hợp đồng");
  }

  if (!input.shift_name?.trim()) {
    throw new Error("Vui lòng nhập tên ca trực");
  }

  if (input.splits && input.splits.length > 0) {
    if (!input.original_slot) {
      throw new Error("Thiếu thông tin khung giờ gốc");
    }

    for (const split of input.splits) {
      if (!split.start_time) {
        throw new Error("Vui lòng chọn thời gian bắt đầu");
      }

      if (!split.end_time) {
        throw new Error("Vui lòng chọn thời gian kết thúc");
      }

      const startTime = new Date(split.start_time);
      const endTime = new Date(split.end_time);

      if (Number.isNaN(startTime.getTime())) {
        throw new Error("Thời gian bắt đầu không hợp lệ");
      }

      if (Number.isNaN(endTime.getTime())) {
        throw new Error("Thời gian kết thúc không hợp lệ");
      }

      if (endTime <= startTime) {
        throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
      }
    }
  } else {
    if (!input.start_time) {
      throw new Error("Vui lòng chọn thời gian bắt đầu");
    }

    if (!input.end_time) {
      throw new Error("Vui lòng chọn thời gian kết thúc");
    }

    const startTime = new Date(input.start_time);
    const endTime = new Date(input.end_time);

    if (Number.isNaN(startTime.getTime())) {
      throw new Error("Thời gian bắt đầu không hợp lệ");
    }

    if (Number.isNaN(endTime.getTime())) {
      throw new Error("Thời gian kết thúc không hợp lệ");
    }

    if (endTime <= startTime) {
      throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
    }
  }

  if (!Number.isInteger(input.required_guards) || input.required_guards <= 0) {
    throw new Error("Số lượng bảo vệ phải lớn hơn 0");
  }

  if (!input.location?.trim()) {
    throw new Error("Vui lòng nhập vị trí trực cụ thể");
  }

  if (input.splits && input.splits.length > 0) {
    for (let i = 0; i < input.splits.length; i++) {
      const split = input.splits[i];
      if (!Array.isArray(split.guard_id)) {
        throw new Error(`Danh sách bảo vệ cho ca tách thứ ${i + 1} không hợp lệ`);
      }
      if (split.guard_id.length !== input.required_guards) {
        throw new Error(`Mỗi ca tách cần chọn đúng ${input.required_guards} bảo vệ`);
      }
      const uniqueGuards = new Set(split.guard_id);
      if (uniqueGuards.size !== split.guard_id.length) {
        throw new Error(`Danh sách bảo vệ cho ca tách thứ ${i + 1} không được trùng lặp`);
      }
    }
  } else {
    if (!Array.isArray(input.guard_id)) {
      throw new Error("Danh sách bảo vệ không hợp lệ");
    }

    if (input.guard_id.length !== input.required_guards) {
      throw new Error(`Số bảo vệ được chọn phải bằng số lượng bảo vệ cần (${input.required_guards} bảo vệ)`);
    }

    const uniqueGuardIds = new Set(input.guard_id);

    if (uniqueGuardIds.size !== input.guard_id.length) {
      throw new Error("Danh sách bảo vệ không được trùng lặp");
    }
  }
};

export const validateShiftDateInContract = ({
  startTime,
  endTime,
  contractStartDate,
  contractEndDate,
  timeZone,
}: {
  startTime: string;
  endTime: string;
  contractStartDate: string;
  contractEndDate: string;
  timeZone?: string;
}) => {
  const shiftStartTime = new Date(startTime);
  const shiftEndTime = new Date(endTime);

  const contractStartTime = new Date(localTimeToUtc(contractStartDate, "00:00:00", timeZone));
  const contractEndTime = new Date(localTimeToUtc(contractEndDate, "23:59:59", timeZone));

  if (shiftStartTime < contractStartTime) {
    throw new Error(
      `Ngày bắt đầu ca trực phải nằm trong thời hạn hợp đồng từ ${contractStartDate} đến ${contractEndDate}`,
    );
  }

  if (shiftEndTime > contractEndTime) {
    throw new Error(
      `Thời gian kết thúc ca trực không được vượt quá ngày kết thúc hợp đồng ${contractEndDate}`,
    );
  }
};
