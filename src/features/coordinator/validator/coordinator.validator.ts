import { CoordinatorFormData } from "../components/AddCoordinatorForm";

// ─── Individual validators (return null = ok, string = error message) ──────

export const validateCoordinatorFullName = (name: string): string | null => {
  if (!name.trim()) return "Họ và tên không được để trống";
  return null;
};

export const validateCoordinatorAge = (dob: string): string | null => {
  if (!dob) return "Ngày sinh không được để trống";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age < 18) return "Điều phối viên phải đủ 18 tuổi";
  return null;
};

export const validateCoordinatorGender = (gender: string): string | null => {
  if (!gender) return "Vui lòng chọn giới tính";
  return null;
};

export const validateCoordinatorPhone = (phone: string): string | null => {
  if (!phone.trim()) return "Số điện thoại không được để trống";
  if (!/^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, "")))
    return "Số điện thoại không hợp lệ";
  return null;
};

export const validateCoordinatorEmail = (email: string): string | null => {
  if (!email.trim()) return "Email không được để trống";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ";
  return null;
};

export const validateCoordinatorStreet = (street: string): string | null => {
  if (!street.trim()) return "Địa chỉ chi tiết không được để trống";
  return null;
};

export const validateCoordinatorCity = (cityId: number | ""): string | null => {
  if (cityId === "") return "Vui lòng chọn Tỉnh/Thành phố";
  return null;
};

export const validateCoordinatorWard = (wardId: number | ""): string | null => {
  if (wardId === "") return "Vui lòng chọn Phường/Xã";
  return null;
};

export const validateIdentityNumber = (idNumber: string): string | null => {
  if (!idNumber.trim()) return "Số CCCD/CMND không được để trống";
  if (!/^[0-9]{9}$|^[0-9]{12}$/.test(idNumber.trim()))
    return "Số CCCD/CMND phải gồm 9 hoặc 12 chữ số";
  return null;
};

export const validateIdentityIssueDate = (
  issueDate: string,
  dateOfBirth: string
): string | null => {
  if (!issueDate) return "Ngày cấp không được để trống";
  const issue = new Date(issueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (issue > today) return "Ngày cấp không thể là ngày trong tương lai";
  if (dateOfBirth && issue <= new Date(dateOfBirth))
    return "Ngày cấp phải sau ngày sinh";
  return null;
};

export const validateIdentityIssuePlace = (place: string): string | null => {
  if (!place.trim()) return "Nơi cấp không được để trống";
  return null;
};

// ─── Composite form validator ─────────────────────────────────────────────────

export const validateCoordinatorForm = (
  form: CoordinatorFormData
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const fullNameErr = validateCoordinatorFullName(form.full_name);
  if (fullNameErr) errors.full_name = fullNameErr;

  const ageErr = validateCoordinatorAge(form.date_of_birth);
  if (ageErr) errors.date_of_birth = ageErr;

  const genderErr = validateCoordinatorGender(form.gender);
  if (genderErr) errors.gender = genderErr;

  const phoneErr = validateCoordinatorPhone(form.phone_number);
  if (phoneErr) errors.phone_number = phoneErr;

  const emailErr = validateCoordinatorEmail(form.email);
  if (emailErr) errors.email = emailErr;

  const streetErr = validateCoordinatorStreet(form.street);
  if (streetErr) errors.street = streetErr;

  const cityErr = validateCoordinatorCity(form.city_id);
  if (cityErr) errors.city_id = cityErr;

  const wardErr = validateCoordinatorWard(form.ward_id);
  if (wardErr) errors.ward_id = wardErr;

  const idErr = validateIdentityNumber(form.id_number);
  if (idErr) errors.id_number = idErr;

  const issueDateErr = validateIdentityIssueDate(form.issue_date, form.date_of_birth);
  if (issueDateErr) errors.issue_date = issueDateErr;

  const issuePlaceErr = validateIdentityIssuePlace(form.issue_place);
  if (issuePlaceErr) errors.issue_place = issuePlaceErr;

  if (!form.avatarFile) errors.avatarFile = "Vui lòng tải lên ảnh đại diện";
  if (!form.cccdFrontFile) errors.cccdFrontFile = "Vui lòng tải lên mặt trước CCCD";
  if (!form.cccdBackFile) errors.cccdBackFile = "Vui lòng tải lên mặt sau CCCD";

  return errors;
};
