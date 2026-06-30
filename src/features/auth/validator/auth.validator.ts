import type { AuthError } from "@supabase/supabase-js";
import type { RegisterInput, LoginInput } from "../types";
import { supabase } from "@/lib/supabase";

export const validateFullName = (fullName: string) => {
  const trimmedFullName = fullName.trim();

  if (!trimmedFullName) {
    return "Vui lòng nhập họ và tên";
  }

  if (trimmedFullName.length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự";
  }

  return null;
};

export const validateEmail = (email: string) => {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Vui lòng nhập email";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return "Email không đúng định dạng";
  }

  return null;
};

export const validatePhoneNumber = (phoneNumber: string) => {
  const trimmedPhoneNumber = phoneNumber.replace(/\s/g, "");

  if (!trimmedPhoneNumber) {
    return "Vui lòng nhập số điện thoại";
  }

  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

  if (!phoneRegex.test(trimmedPhoneNumber)) {
    return "Số điện thoại không hợp lệ";
  }

  return null;
};

export const checkPhoneNumberExists = async (phoneNumber: string) => {
  const cleanedPhoneNumber = phoneNumber.replace(/\s/g, "");

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("phone_number", cleanedPhoneNumber)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
};

export const checkEmailExists = async (email: string) => {
  const trimmedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", trimmedEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
};

export const validatePassword = (password: string) => {
  if (!password) {
    return "Vui lòng nhập mật khẩu";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    return "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số";
  }

  return null;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (!confirmPassword) {
    return "Vui lòng xác nhận mật khẩu";
  }

  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không khớp";
  }

  return null;
};

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.trim().split("@")[1]?.toLowerCase();
  if (!domain) return false;

  const disposableDomains = new Set([
    "yopmail.com",
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "temp-mail.org",
    "temp-mail.com",
    "guerrillamail.com",
    "sharklasers.com",
    "dispostable.com",
    "getairmail.com",
    "maildrop.cc",
    "mintemail.com",
    "trashmail.com",
    "mailnesia.com",
    "mailcatch.com",
    "emailondeck.com",
    "generator.email",
    "throwawaymail.com",
    "guerrillamailblock.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "guerrillamail.biz",
  ]);

  return disposableDomains.has(domain);
};

export const validateRegisterInput = ({
  email,
  password,
  confirmPassword,
  fullName,
  phoneNumber,
}: RegisterInput) => {
  const fullNameError = validateFullName(fullName);
  if (fullNameError) return fullNameError;

  const emailError = validateEmail(email);
  if (emailError) return emailError;

  if (isDisposableEmail(email)) {
    return "Không cho phép sử dụng email tạm thời";
  }

  const phoneNumberError = validatePhoneNumber(phoneNumber);
  if (phoneNumberError) return phoneNumberError;

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  const confirmPasswordError = validateConfirmPassword(
    password,
    confirmPassword,
  );

  if (confirmPasswordError) return confirmPasswordError;

  return null;
};

export const validateLoginInput = ({ email, password }: LoginInput) => {
  const emailError = validateEmail(email);
  if (emailError) return emailError;

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  return null;
};

export const emailExistError = (error: AuthError) => {
  const errorMessage = error.message.toLowerCase();

  const isEmailAlreadyRegistered =
    errorMessage.includes("already registered") ||
    errorMessage.includes("already exists") ||
    errorMessage.includes("user already");

  if (isEmailAlreadyRegistered) {
    return "Email này đã được đăng ký";
  }

  return error.message;
};
