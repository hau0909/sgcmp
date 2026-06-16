"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestLoginAccount } from "../api/auth.api";
import { getRedirectPathByRole } from "../utils/redirectByRole";
import { useAuthStore } from "@/store/auth.store";

type FormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") {
    if (error === "Invalid login credentials") {
      return "Email hoặc mật khẩu không đúng";
    }

    if (error.includes("Invalid login credentials")) {
      return "Email hoặc mật khẩu không đúng";
    }

    if (error.includes("Email not confirmed")) {
      return "Email chưa được xác thực. Vui lòng kiểm tra email.";
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
      return "Email hoặc mật khẩu không đúng";
    }

    if (message.includes("Invalid login credentials")) {
      return "Email hoặc mật khẩu không đúng";
    }

    if (message.includes("Email not confirmed")) {
      return "Email chưa được xác thực. Vui lòng kiểm tra email.";
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

  return "Đăng nhập thất bại. Vui lòng thử lại.";
};

export default function SignInComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
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
          general: getErrorMessage(result?.message),
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

      setSuccessMessage("Đăng nhập thành công. Đang chuyển hướng...");

      const redirectPath = getRedirectPathByRole(result.data.role);

      router.replace(redirectPath);
      // router.refresh();
    } catch (error: unknown) {
      setErrors({
        general: getErrorMessage(error),
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
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-6">
      <div className="w-full max-w-[430px] rounded-md border border-slate-300 bg-white px-7 py-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-800">SGCMP</h1>
          <p className="mt-3 text-sm text-slate-700">
            Điền thông tin của bạn để truy cập hệ thống
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Địa chỉ Email
            </label>

            <input
              type="email"
              placeholder="name@company.com"
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
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-900">
                Mật khẩu
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-800 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <input
              type="password"
              placeholder="••••••••"
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
              className={inputClass(!!errors.password)}
            />

            {errors.password && (
              <p className="mt-1 text-sm font-medium text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 w-full rounded bg-blue-800 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <Link
            href="/register"
            className="flex h-10 w-full items-center justify-center rounded border border-blue-800 bg-white text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
          >
            Đăng ký
          </Link>
        </form>
      </div>
    </div>
  );
}
