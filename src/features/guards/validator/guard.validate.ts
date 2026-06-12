import type {
  createGuardAccountFormInput,
  CreateGuardAccountInput,
} from "../type";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const IDENTITY_REGEX = /^(\d{9}|\d{12})$/;

export const validateCreateGuardInput = (
  input: createGuardAccountFormInput,
): string | null => {
  if (!input.full_name.trim()) {
    return "Vui lòng nhập họ và tên.";
  }

  if (!input.date_of_birth) {
    return "Vui lòng chọn ngày sinh.";
  }

  if (!input.gender) {
    return "Vui lòng chọn giới tính.";
  }

  if (!IDENTITY_REGEX.test(input.identity_id.trim())) {
    return "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
  }

  if (!input.identity_issue_date) {
    return "Vui lòng chọn ngày cấp CCCD/CMND.";
  }

  if (!input.identity_issue_place.trim()) {
    return "Vui lòng nhập nơi cấp CCCD/CMND.";
  }

  if (!input.address.trim()) {
    return "Vui lòng nhập địa chỉ thường trú.";
  }

  if (!PHONE_REGEX.test(input.phone_number.trim())) {
    return "Số điện thoại không hợp lệ.";
  }

  if (!EMAIL_REGEX.test(input.email.trim())) {
    return "Email không hợp lệ.";
  }

  if (input.avatar_file) {
    const acceptedTypes = ["image/jpeg", "image/png"];

    if (!acceptedTypes.includes(input.avatar_file.type)) {
      return "Ảnh chỉ hỗ trợ định dạng JPG hoặc PNG.";
    }

    const maximumSize = 2 * 1024 * 1024;

    if (input.avatar_file.size > maximumSize) {
      return "Kích thước ảnh tối đa là 2MB.";
    }
  }

  return null;
};

export const checkGuardExistsByUserId = async (user_id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guards")
    .select("guard_id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const checkIdentityExists = async (identity_id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("identities")
    .select("identity_id")
    .eq("identity_id", identity_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const validateCreateGuardAccount = (
  input: CreateGuardAccountInput,
): string | null => {
  if (!input.full_name.trim()) {
    return "Vui lòng nhập họ và tên.";
  }

  if (!input.phone_number.trim()) {
    return "Vui lòng nhập số điện thoại.";
  }

  if (!PHONE_REGEX.test(input.phone_number.trim())) {
    return "Số điện thoại không hợp lệ.";
  }

  if (!input.email.trim()) {
    return "Vui lòng nhập email.";
  }

  if (!EMAIL_REGEX.test(input.email.trim())) {
    return "Email không hợp lệ.";
  }

  return null;
};
