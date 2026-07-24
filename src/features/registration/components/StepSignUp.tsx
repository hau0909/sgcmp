"use client";

import { useState } from "react";

import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { isDisposableEmail, checkEmailExists, checkPhoneNumberExists } from "@/features/auth/validator/auth.validator";
import { RegisterPayload } from "@/features/auth/types";
import { useTranslation } from "@/components/providers/LanguageProvider";

type FormErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

interface StepSignUpProps {
  onSuccess: (data: RegisterPayload) => void;
}

export default function StepSignUp({ onSuccess }: StepSignUpProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { dict } = useTranslation();

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const normalizedPhoneNumber = phoneNumber.replace(/\s/g, "");

    if (!trimmedFullName) {
      newErrors.fullName = dict.pages.registration.err_name_required;
    } else if (trimmedFullName.length < 2) {
      newErrors.fullName = dict.pages.registration.err_name_short;
    }

    if (!trimmedEmail) {
      newErrors.email = dict.pages.registration.err_email_required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = dict.pages.registration.err_email_invalid;
    } else if (isDisposableEmail(trimmedEmail)) {
      newErrors.email = dict.pages.registration.err_email_disposable;
    }

    if (!normalizedPhoneNumber) {
      newErrors.phone = dict.pages.registration.err_phone_required;
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(normalizedPhoneNumber)) {
      newErrors.phone = dict.pages.registration.err_phone_invalid;
    }

    if (!password) {
      newErrors.password = dict.pages.registration.err_password_required;
    } else if (password.length < 8) {
      newErrors.password = (dict.pages.registration as any).err_password_short || "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      newErrors.password = (dict.pages.registration as any).err_password_invalid || "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = dict.pages.registration.err_confirm_required;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = dict.pages.registration.err_confirm_mismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});

    const isValid = validateForm();
    if (!isValid) return;

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const normalizedPhoneNumber = phoneNumber.replace(/\s/g, "");

    try {
      setLoading(true);

      const emailExists = await checkEmailExists(trimmedEmail);
      if (emailExists) {
        setErrors((prev) => ({ ...prev, email: dict.pages.registration.err_email_exists }));
        return;
      }

      const phoneExists = await checkPhoneNumberExists(normalizedPhoneNumber);
      if (phoneExists) {
        setErrors((prev) => ({ ...prev, phone: dict.pages.registration.err_phone_exists }));
        return;
      }

      // Pass validated data to parent — actual API call happens at final submit
      onSuccess({
        email: trimmedEmail,
        password,
        confirmPassword,
        fullName: trimmedFullName,
        phoneNumber: normalizedPhoneNumber,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi kiểm tra thông tin. Vui lòng thử lại.";
      setErrors({
        general: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `h-12 w-full rounded-lg border px-4 text-sm outline-none transition-all duration-200 bg-surface placeholder:text-on-surface-variant/50 focus:ring-2 ${hasError
      ? "border-error focus:border-error focus:ring-error/20"
      : "border-outline-variant focus:border-primary focus:ring-primary/20"
    }`;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">{dict.pages.registration.signup_title}</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {dict.pages.registration.signup_desc}
          </p>
        </div>
      </div>



      {/* General Error */}
      {errors.general && (
        <div className="mb-5 rounded-lg border border-error/40 bg-error/5 px-4 py-3 text-sm font-medium text-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSignUp} noValidate className="space-y-5">
        {/* Two-column layout for name + phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-on-surface">
              {dict.pages.registration.full_name} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder={dict.pages.registration.full_name_placeholder}
              value={fullName}
              disabled={loading}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              className={inputClass(!!errors.fullName)}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs font-medium text-error">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-on-surface">
              {dict.pages.registration.phone} <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              placeholder="+84 000 000 000"
              value={phoneNumber}
              disabled={loading}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              className={inputClass(!!errors.phone)}
            />
            {errors.phone && (
              <p className="mt-1 text-xs font-medium text-error">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-on-surface">
            {dict.pages.registration.email_label} <span className="text-error">*</span>
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            disabled={loading}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p className="mt-1 text-xs font-medium text-error">{errors.email}</p>
          )}
        </div>

        {/* Password row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-on-surface">
              {dict.pages.registration.password} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`${inputClass(!!errors.password)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant hover:text-on-surface focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs font-medium text-error">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-on-surface">
              {dict.pages.registration.password_confirm} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className={`${inputClass(!!errors.confirmPassword)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant hover:text-on-surface focus:outline-none transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-error">{errors.confirmPassword}</p>
            )}
          </div>
        </div>


        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 cursor-pointer rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{dict.pages.registration.checking}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>{dict.pages.registration.submit_btn}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
