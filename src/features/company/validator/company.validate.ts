import { UpdateCompanyProfileInput } from "../types";
import { ImageType } from "@/types/Enum";

const allowedImageTypes: ImageType[] = ["logo", "banner", "other"];

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string) => {
  return /^(0|\+84)[0-9]{9,10}$/.test(phone);
};

const validateRequiredString = (value: unknown, message: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }
};

export const validateUpdateCompanyProfileInput = (
  input: UpdateCompanyProfileInput,
) => {
  validateRequiredString(input.company_name, "Tên công ty không hợp lệ.");

  if (typeof input.description !== "string") {
    throw new Error("Giới thiệu doanh nghiệp không hợp lệ.");
  }

  validateRequiredString(input.email, "Email không hợp lệ.");

  if (!isValidEmail(input.email.trim())) {
    throw new Error("Email không hợp lệ.");
  }

  validateRequiredString(input.phone, "Số điện thoại không hợp lệ.");

  if (!isValidPhone(input.phone.trim())) {
    throw new Error("Số điện thoại không hợp lệ.");
  }

  validateRequiredString(input.address, "Địa chỉ không hợp lệ.");
};

export const validateUploadCompanyImageInput = ({
  file,
  image_type,
}: {
  file: File | null;
  image_type: FormDataEntryValue | null;
}) => {
  if (!file) {
    throw new Error("Vui lòng chọn ảnh.");
  }

  if (!(file instanceof File)) {
    throw new Error("File ảnh không hợp lệ.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File tải lên phải là hình ảnh.");
  }

  const maxFileSize = 5 * 1024 * 1024;

  if (file.size > maxFileSize) {
    throw new Error("Ảnh không được vượt quá 5MB.");
  }

  if (typeof image_type !== "string") {
    throw new Error("Loại ảnh không hợp lệ.");
  }

  if (!allowedImageTypes.includes(image_type as ImageType)) {
    throw new Error("Loại ảnh chỉ được là logo, banner hoặc other.");
  }
};
