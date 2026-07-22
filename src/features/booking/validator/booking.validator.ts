import { BookingStatus } from "../types";

export const validateBookingUpdateStatusData = (status: BookingStatus, quotedPrice?: number) => {
  if (status !== "quoted" && status !== "rejected" && status !== "accepted" && status !== "canceled") {
    throw new Error("Trạng thái cập nhật không hợp lệ.");
  }
  if (status === "quoted" && (quotedPrice === undefined || quotedPrice <= 0)) {
    throw new Error("Giá báo phải lớn hơn 0 VND.");
  }
};
