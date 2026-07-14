import { VerificationStatus } from "./Enum";

export interface RequestVerification {
  verification_id: string;
  booking_id: string;

  // Mô tả hiện trường từ người khảo sát
  description: string | null;

  // Hình ảnh hiện trường (mảng URL)
  images: string[];

  // Trạng thái xác thực: pending | approved | rejected
  status: VerificationStatus;

  // Ghi chú nội bộ của Company Admin khi duyệt hoặc từ chối
  notes: string | null;

  created_at: string;
  updated_at: string;
}
