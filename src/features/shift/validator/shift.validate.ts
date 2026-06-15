import type { CreateShiftInput } from "../type";

export const validateCreateShiftInput = (input: CreateShiftInput) => {
  if (!input.contract_id) {
    throw new Error("Vui lòng chọn hợp đồng");
  }

  if (!input.shift_name?.trim()) {
    throw new Error("Vui lòng nhập tên ca trực");
  }

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

  if (!Number.isInteger(input.required_guards) || input.required_guards <= 0) {
    throw new Error("Số lượng bảo vệ phải lớn hơn 0");
  }

  if (!input.location?.trim()) {
    throw new Error("Vui lòng nhập vị trí trực cụ thể");
  }

  if (!Array.isArray(input.guard_id)) {
    throw new Error("Danh sách bảo vệ không hợp lệ");
  }

  if (input.guard_id.length !== input.required_guards) {
    throw new Error("Số bảo vệ được chọn phải bằng số lượng bảo vệ cần");
  }

  const uniqueGuardIds = new Set(input.guard_id);

  if (uniqueGuardIds.size !== input.guard_id.length) {
    throw new Error("Danh sách bảo vệ không được trùng lặp");
  }
};

export const validateShiftDateInContract = ({
  startTime,
  endTime,
  contractStartDate,
  contractEndDate,
}: {
  startTime: string;
  endTime: string;
  contractStartDate: string;
  contractEndDate: string;
}) => {
  const shiftStartTime = new Date(startTime);
  const shiftEndTime = new Date(endTime);

  const contractStartTime = new Date(`${contractStartDate}T00:00:00+07:00`);
  const contractEndTime = new Date(`${contractEndDate}T23:59:59+07:00`);

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
