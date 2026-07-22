import { calculateHoursFromSlot } from "@/utils/calcTime";

export const validateContractExpiration = (endDateString?: string | null) => {
  if (!endDateString) {
    throw new Error("Hợp đồng không có ngày kết thúc");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateString);
  endDate.setHours(0, 0, 0, 0);

  if (endDate > today) {
    throw new Error("Chưa đến ngày kết thúc hợp đồng");
  }
};

export const validateAssignGuardsRules = (timeSlots: string[], requiredGuards: number, assignedGuardCount: number) => {
  const hasShiftOver8Hours = timeSlots.some((slot) => {
    const hours = calculateHoursFromSlot(slot);
    return hours > 8;
  });

  if (hasShiftOver8Hours && assignedGuardCount < 2) {
    throw new Error("Hợp đồng này có ca trực kéo dài hơn 8 tiếng, yêu cầu phân công ít nhất 2 nhân sự bảo vệ.");
  }

  if (assignedGuardCount < requiredGuards) {
    throw new Error(`Hợp đồng yêu cầu tối thiểu ${requiredGuards} nhân sự bảo vệ, hiện tại mới phân công ${assignedGuardCount} bảo vệ.`);
  }
};

export const validateCustomerSignatureEligibility = (customerAgreed?: boolean, guardAssigned?: string[] | null) => {
  if (customerAgreed) {
    throw new Error("Bạn đã ký xác nhận hợp đồng này rồi");
  }
  if (!guardAssigned || guardAssigned.length === 0) {
    throw new Error("Hợp đồng này chưa được phân công nhân sự bảo vệ. Vui lòng liên hệ công ty để được phân công trước khi ký.");
  }
};
