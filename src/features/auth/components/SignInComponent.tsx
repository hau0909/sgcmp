"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestLoginAccount } from "../api/auth.api";
import { getRedirectPathByRole } from "../utils/redirectByRole";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/components/providers/LanguageProvider";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getErrorMessage = (error: unknown, dict: any) => {
  if (typeof error === "string") {
    if (error === "Invalid login credentials") {
      return dict.pages.auth.login.errors.invalid_credentials;
    }

    if (error.includes("Invalid login credentials")) {
      return dict.pages.auth.login.errors.invalid_credentials;
    }

    if (error.includes("Email not confirmed") || error.includes("Email chưa được xác thực")) {
      return dict.pages.auth.login.errors.email_not_confirmed;
    }

    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    const message = (error as { message: string }).message;

    if (message === "Invalid login credentials") {
      return dict.pages.auth.login.errors.invalid_credentials;
    }

    if (message.includes("Invalid login credentials")) {
      return dict.pages.auth.login.errors.invalid_credentials;
    }

    if (message.includes("Email not confirmed") || message.includes("Email chưa được xác thực")) {
      return dict.pages.auth.login.errors.email_not_confirmed;
    }

    return message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: unknown }).error === "string"
  ) {
    return (error as { error: string }).error;
  }

  return dict.pages.auth.login.errors.login_failed;
};

export default function SignInComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const { dict } = useTranslation();

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = dict.pages.auth.login.errors.email_required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = dict.pages.auth.login.errors.email_invalid;
    }

    if (!password) {
      newErrors.password = dict.pages.auth.login.errors.password_required;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    try {
      setLoading(true);
      setErrors({});
      setSuccessMessage("");

      const trimmedEmail = email.trim();

      const result = await requestLoginAccount({
        email: trimmedEmail,
        password,
      });

      if (!result?.success) {
        setErrors({
          general: getErrorMessage(result?.message, dict),
        });
        return;
      }

      if (!result.data?.role) {
        setErrors({
          general: "Không tìm thấy vai trò của tài khoản",
        });
        return;
      }

      setAuth({
        user_id: result.data.user_id,
        role: result.data.role,
        company_id: result.data.company_id,
      });

      setSuccessMessage(dict.pages.auth.login.success_redirect);

      const redirectPath = getRedirectPathByRole(result.data.role);

      router.replace(redirectPath);
      // router.refresh();
    } catch (error: unknown) {
      setErrors({
        general: getErrorMessage(error, dict),
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `h-10 w-full rounded border px-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-slate-300 focus:border-blue-700 focus:ring-blue-700"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative">
      {/* Back button container (absolute on the far top-left) */}
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
          <span>Quay lại</span>
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center pt-24 pb-6">
        <div className="w-full max-w-[430px] rounded-md border border-slate-300 bg-white px-7 py-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary tracking-wider mb-2">
              {dict.pages.auth.login.title}
            </h1>
            <p className="text-on-surface-variant text-sm max-w-[280px] mx-auto leading-relaxed">
              {dict.pages.auth.login.subtitle}
            </p>
          </div>

          <form onSubmit={handleSignIn} className="mt-7 space-y-4" noValidate>
            {errors.general && (
              <p className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errors.general}
              </p>
            )}

            {successMessage && (
              <p className="rounded border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                {successMessage}
              </p>
            )}

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-on-surface"
              >
                {dict.pages.auth.login.email}
              </label>
              <input
                id="email"
                type="email"
                placeholder={dict.pages.auth.login.email_placeholder}
                value={email}
                disabled={loading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSuccessMessage("");
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                    general: undefined,
                  }));
                }}
                className={inputClass(!!errors.email)}
              />

              {errors.email && (
                <p className="mt-1 text-sm font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-on-surface"
                >
                  {dict.pages.auth.login.password}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {dict.pages.auth.login.forgot_password}
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={dict.pages.auth.login.password_placeholder}
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSuccessMessage("");
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                      general: undefined,
                    }));
                  }}
                  className={`${inputClass(!!errors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-semibold text-sm transition-all duration-200 shadow hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                  <span>{dict.pages.auth.login.loading}</span>
                </>
              ) : (
                <span>{dict.pages.auth.login.submit_btn}</span>
              )}
            </button>

            <Link
              href="/register"
              className="block w-full text-center py-2.5 px-4 rounded-lg border border-outline-variant hover:bg-surface-container-low text-on-surface font-semibold text-sm transition-colors duration-200"
            >
              {dict.pages.auth.login.register_btn}
            </Link>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
