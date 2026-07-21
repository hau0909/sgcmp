"use client";

import { useState } from "react";
import Link from "next/link";
import { requestRegisterAccount } from "../api/auth.api";
import { isDisposableEmail } from "../validator/auth.validator";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/components/providers/LanguageProvider";

type FormErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const { dict } = useTranslation();

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const normalizedPhoneNumber = phoneNumber.replace(/\s/g, "");

    if (!trimmedFullName) {
      newErrors.fullName = dict.pages.auth.register.errors.name_required;
    } else if (trimmedFullName.length < 2) {
      newErrors.fullName = dict.pages.auth.register.errors.name_short;
    }

    if (!trimmedEmail) {
      newErrors.email = dict.pages.auth.register.errors.email_required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = dict.pages.auth.register.errors.email_invalid;
    } else if (isDisposableEmail(trimmedEmail)) {
      newErrors.email = dict.pages.auth.register.errors.email_disposable;
    }

    if (!normalizedPhoneNumber) {
      newErrors.phone = dict.pages.auth.register.errors.phone_required;
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(normalizedPhoneNumber)) {
      newErrors.phone = dict.pages.auth.register.errors.phone_invalid;
    }

    if (!password) {
      newErrors.password = dict.pages.auth.register.errors.password_required;
    } else if (password.length < 8) {
      newErrors.password = dict.pages.auth.register.errors.password_short;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = dict.pages.auth.register.errors.confirm_required;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = dict.pages.auth.register.errors.confirm_mismatch;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrors({});

    const isValid = validateForm();

    if (!isValid) return;

    try {
      setLoading(true);

      const trimmedFullName = fullName.trim();
      const trimmedEmail = email.trim();
      const normalizedPhoneNumber = phoneNumber.replace(/\s/g, "");

      const result = await requestRegisterAccount({
        email: trimmedEmail,
        password,
        confirmPassword,
        fullName: trimmedFullName,
        phoneNumber: normalizedPhoneNumber,
      });

      if (result.success) {
        setSuccessMessage(dict.pages.auth.register.success);
        setFullName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const errorMsg = (result.message || "").toLowerCase();
        if (errorMsg.includes("phone number")) {
          setErrors({ phone: dict.pages.auth.register.errors.phone_exists });
        } else if (errorMsg.includes("email")) {
          setErrors({ email: dict.pages.auth.register.errors.email_exists });
        } else {
          setErrors({ general: result.message || dict.pages.auth.register.errors.register_failed });
        }
      }
    } catch (error: any) {
      setErrors({
        general: error?.message || dict.pages.auth.register.errors.register_failed,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `h-12 w-full rounded border px-4 text-lg outline-none transition placeholder:text-slate-500 focus:ring-1 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-slate-300 focus:border-blue-700 focus:ring-blue-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative">
      <div className="absolute left-6 top-6">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-800 transition-all duration-200 group bg-white border border-slate-300 rounded px-3 py-1.5 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{dict.pages.auth.register.back}</span>
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center pt-24 pb-10">
        <div className="w-full max-w-[500px] rounded-md border border-slate-300 bg-white px-12 py-12 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary tracking-wider mb-2">
            {dict.pages.auth.register.title}
          </h1>
          <p className="text-xl font-semibold text-on-surface mb-1">
            {dict.pages.auth.register.subtitle}
          </p>
          <p className="text-sm text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
            {dict.pages.auth.register.desc}
          </p>
        </div>

        <form onSubmit={handleSignUp} className="mt-10 space-y-5" noValidate>
          {successMessage && (
            <p className="rounded border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {successMessage}
            </p>
          )}

          {errors.general && (
            <p className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {errors.general}
            </p>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              {dict.pages.auth.register.full_name}
            </label>
            <input
              type="text"
              placeholder={dict.pages.auth.register.full_name_placeholder}
              value={fullName}
              disabled={loading}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, fullName: undefined }));
                setSuccessMessage("");
              }}
              className={inputClass(!!errors.fullName)}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm font-medium text-red-600">
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              {dict.pages.auth.register.email}
            </label>
            <input
              type="email"
              placeholder={dict.pages.auth.register.email_placeholder}
              value={email}
              disabled={loading}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
                setSuccessMessage("");
              }}
              className={inputClass(!!errors.email)}
            />
            {errors.email && (
              <p className="mt-1 text-sm font-medium text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              {dict.pages.auth.register.phone}
            </label>
            <input
              type="tel"
              placeholder={dict.pages.auth.register.phone_placeholder}
              value={phoneNumber}
              disabled={loading}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setErrors((prev) => ({ ...prev, phone: undefined }));
                setSuccessMessage("");
              }}
              className={inputClass(!!errors.phone)}
            />
            {errors.phone && (
              <p className="mt-1 text-sm font-medium text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              {dict.pages.auth.register.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={dict.pages.auth.register.password_placeholder}
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                  setSuccessMessage("");
                }}
                className={`${inputClass(!!errors.password)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm font-medium text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-on-surface">
              {dict.pages.auth.register.confirm_password}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={dict.pages.auth.register.confirm_password_placeholder}
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                  setSuccessMessage("");
                }}
                className={`${inputClass(!!errors.confirmPassword)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm font-medium text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm transition-all duration-200 shadow hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>{dict.pages.auth.register.loading}</span>
              </>
            ) : (
              <span>{dict.pages.auth.register.submit_btn}</span>
            )}
          </button>

          <Link
            href="/login"
            className="block w-full text-center py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors duration-200"
          >
            {dict.pages.auth.register.login_btn}
          </Link>
        </form>
      </div>
     </div>
     <Footer />
    </div>
  );
}
