import { UserRole } from "@/types/Enum";

export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  fullName: string;
  // Optional fields for company registration flow
  registrationType?: "company" | "individual";
  companyName?: string;
  businessLicenseNo?: string;
  companyEmail?: string;
  companyPhone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * Payload từ frontend gửi lên API register.
 * Frontend đang dùng camelCase.
 */
export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  // Optional fields for company registration flow
  registrationType?: "company" | "individual";
  companyName?: string;
  businessLicenseNo?: string;
  companyEmail?: string;
  companyPhone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

/**
 * Input cho service.
 * Service cũng nhận camelCase từ controller.
 */
export type RegisterInputService = {
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  tempPass?: string;
  tempPasswordExpiresAt?: string;
  // Optional fields for company registration email template
  registrationType?: "company" | "individual";
  companyName?: string;
  businessLicenseNo?: string;
  companyEmail?: string;
  companyPhone?: string;
};

export type LoginInputService = {
  email: string;
  password: string;
};

/**
 * Params truyền xuống repository.
 * Repository dùng snake_case để map đúng với Supabase metadata/database.
 */
export type RegisterParams = {
  email: string;
  password: string;
  phone_number: string;
  full_name: string;
  role?: UserRole;
  tempPass?: string;
  tempPasswordExpiresAt?: string;
  // Optional fields for company registration email template
  registration_type?: "company" | "individual";
  company_name?: string;
  business_license_no?: string;
  company_email?: string;
  company_phone?: string;
};

export type LoginParams = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: UserRole;
  status: string;
  avatar_url: string | null;
  company_id: string | null;
  company: unknown | null;
};
