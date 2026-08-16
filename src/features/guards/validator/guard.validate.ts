import type {
  createGuardAccountFormInput,
  CreateGuardAccountInput,
} from "../type";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const IDENTITY_REGEX = /^(\d{9}|\d{12})$/;
const NAME_REGEX = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;

export const validateCreateGuardInput = (
  input: createGuardAccountFormInput,
): string | null => {
  if (!input.full_name) {
    return "Vui lòng nhập họ và tên.";
  }

  const nameInput = input.full_name;
  if (nameInput.startsWith(" ") || nameInput.endsWith(" ")) {
    return "Họ và tên không được chứa khoảng trắng ở đầu hoặc cuối.";
  }

  if (/\s{2,}/.test(nameInput)) {
    return "Họ và tên không được chứa nhiều khoảng trắng liên tiếp.";
  }

  if (!NAME_REGEX.test(nameInput)) {
    return "Họ và tên chỉ được chứa chữ cái và khoảng trắng giữa các từ.";
  }

  if (!input.date_of_birth) {
    return "Vui lòng chọn ngày sinh.";
  }

  const dobDate = new Date(input.date_of_birth);
  const today = new Date();

  // Reset hours to compare dates only
  today.setHours(0, 0, 0, 0);
  dobDate.setHours(0, 0, 0, 0);

  if (dobDate > today) {
    return "Ngày sinh không được ở tương lai.";
  }

  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return "Nhân viên bảo vệ phải từ 18 tuổi trở lên.";
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

  const issueDate = new Date(input.identity_issue_date);
  issueDate.setHours(0, 0, 0, 0);

  if (issueDate > today) {
    return "Ngày cấp CCCD/CMND không được ở tương lai.";
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

export const checkEmailExists = async (email: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const checkPhoneNumberExists = async (phone_number: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("phone_number", phone_number)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const validateCreateGuardAccount = (
  input: CreateGuardAccountInput,
): string | null => {
  if (!input.full_name) {
    return "Vui lòng nhập họ và tên.";
  }

  const nameInput = input.full_name;
  if (nameInput.startsWith(" ") || nameInput.endsWith(" ")) {
    return "Họ và tên không được chứa khoảng trắng ở đầu hoặc cuối.";
  }

  if (/\s{2,}/.test(nameInput)) {
    return "Họ và tên không được chứa nhiều khoảng trắng liên tiếp.";
  }

  if (!NAME_REGEX.test(nameInput)) {
    return "Họ và tên chỉ được chứa chữ cái và khoảng trắng giữa các từ.";
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

  if (input.identity_id && input.identity_id.trim()) {
    if (!IDENTITY_REGEX.test(input.identity_id.trim())) {
      return "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
    }
  }

  return null;
};

export const validateCompleteGuardProfileInput = (
  input: {
    phone_number?: string;
    date_of_birth: string;
    gender: string;
    address: string;
    identity_id: string;
    identity_issue_date: string;
    identity_issue_place: string;
    avatar_url?: string | null;
    front_url?: string | null;
    back_url?: string | null;
    height_cm?: number | null;
    weight_kg?: number | null;
    notable_skills?: string[] | null;
    health_certificate_path?: string | null;
    skill_certificate_paths?: string[] | null;
  }
): string | null => {
  if (input.phone_number !== undefined) {
    if (!input.phone_number.trim()) {
      return "Vui lòng nhập số điện thoại.";
    }
    if (!PHONE_REGEX.test(input.phone_number.trim())) {
      return "Số điện thoại không hợp lệ.";
    }
  }
  if (!input.date_of_birth) {
    return "Vui lòng chọn ngày sinh.";
  }

  const dobDate = new Date(input.date_of_birth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dobDate.setHours(0, 0, 0, 0);

  if (dobDate > today) {
    return "Ngày sinh không được ở tương lai.";
  }

  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return "Nhân viên bảo vệ phải từ 18 tuổi trở lên.";
  }

  if (!input.gender) {
    return "Vui lòng chọn giới tính.";
  }

  if (!input.identity_id?.trim()) {
    return "Vui lòng nhập số CCCD/CMND.";
  }

  if (!IDENTITY_REGEX.test(input.identity_id.trim())) {
    return "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
  }

  if (!input.identity_issue_date) {
    return "Vui lòng chọn ngày cấp CCCD/CMND.";
  }

  const issueDate = new Date(input.identity_issue_date);
  issueDate.setHours(0, 0, 0, 0);

  if (issueDate > today) {
    return "Ngày cấp CCCD/CMND không được ở tương lai.";
  }

  if (!input.identity_issue_place?.trim()) {
    return "Vui lòng nhập nơi cấp CCCD/CMND.";
  }

  if (!input.address?.trim()) {
    return "Vui lòng nhập địa chỉ thường trú.";
  }

  if (!input.height_cm || input.height_cm < 100 || input.height_cm > 250) {
    return "Vui lòng nhập chiều cao hợp lệ (100 - 250 cm).";
  }

  if (!input.weight_kg || input.weight_kg < 30 || input.weight_kg > 200) {
    return "Vui lòng nhập cân nặng hợp lệ (30 - 200 kg).";
  }

  if (!Array.isArray(input.notable_skills) || input.notable_skills.length === 0) {
    return "Vui lòng chọn hoặc nhập ít nhất một kỹ năng nổi bật.";
  }

  if (!input.health_certificate_path?.trim()) {
    return "Vui lòng tải lên giấy khám sức khỏe.";
  }

  if (!Array.isArray(input.skill_certificate_paths) || input.skill_certificate_paths.length === 0) {
    return "Vui lòng tải lên ít nhất một chứng chỉ kỹ năng.";
  }

  return null;
};

export const validateUpdateGuardInput = (
  input: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    identity_id: string;
    identity_issue_date: string;
    identity_issue_place: string;
    address: string;
    phone_number: string;
    email: string;
  }
): string | null => {
  if (!input.full_name) {
    return "Vui lòng nhập họ và tên.";
  }

  const nameInput = input.full_name;
  if (nameInput.startsWith(" ") || nameInput.endsWith(" ")) {
    return "Họ và tên không được chứa khoảng trắng ở đầu hoặc cuối.";
  }

  if (/\s{2,}/.test(nameInput)) {
    return "Họ và tên không được chứa nhiều khoảng trắng liên tiếp.";
  }

  if (!NAME_REGEX.test(nameInput)) {
    return "Họ và tên chỉ được chứa chữ cái và khoảng trắng giữa các từ.";
  }

  if (!input.date_of_birth) {
    return "Vui lòng chọn ngày sinh.";
  }

  const dobDate = new Date(input.date_of_birth);
  const today = new Date();

  // Reset hours to compare dates only
  today.setHours(0, 0, 0, 0);
  dobDate.setHours(0, 0, 0, 0);

  if (dobDate > today) {
    return "Ngày sinh không được ở tương lai.";
  }

  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return "Nhân viên bảo vệ phải từ 18 tuổi trở lên.";
  }

  if (!input.gender) {
    return "Vui lòng chọn giới tính.";
  }

  if (!input.identity_id.trim()) {
    return "Vui lòng nhập số CCCD/CMND.";
  }

  if (!IDENTITY_REGEX.test(input.identity_id.trim())) {
    return "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
  }

  if (!input.identity_issue_date) {
    return "Vui lòng chọn ngày cấp CCCD/CMND.";
  }

  const issueDate = new Date(input.identity_issue_date);
  issueDate.setHours(0, 0, 0, 0);

  if (issueDate > today) {
    return "Ngày cấp CCCD/CMND không được ở tương lai.";
  }

  if (!input.identity_issue_place.trim()) {
    return "Vui lòng nhập nơi cấp CCCD/CMND.";
  }

  const ISSUE_PLACE_REGEX = /^[\p{L}\p{M}0-9\s]+$/u;
  if (!ISSUE_PLACE_REGEX.test(input.identity_issue_place.trim())) {
    return "Nơi cấp không được chứa ký tự đặc biệt.";
  }

  if (!input.address.trim()) {
    return "Vui lòng nhập địa chỉ thường trú.";
  }

  const ADDRESS_REGEX = /^[\p{L}\p{M}0-9\s,\/.-]+$/u;
  if (!ADDRESS_REGEX.test(input.address.trim())) {
    return "Địa chỉ không được chứa ký tự đặc biệt.";
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

export const checkEmailExistsForOtherUser = async (email: string, user_id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .neq("user_id", user_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const checkPhoneNumberExistsForOtherUser = async (phone_number: string, user_id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("phone_number", phone_number)
    .neq("user_id", user_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

export const checkIdentityExistsForOtherUser = async (identity_id: string, user_id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("identities")
    .select("identity_id")
    .eq("identity_id", identity_id)
    .neq("user_id", user_id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
};

