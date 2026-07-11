"use client";

import { useState } from "react";
import Link from "next/link";
import { requestRegisterAccount } from "../api/auth.api";
import { isDisposableEmail } from "../validator/auth.validator";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Footer from "@/components/layout/Footer";

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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const normalizedPhoneNumber = phoneNumber.replace(/\s/g, "");

    if (!trimmedFullName) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (trimmedFullName.length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!trimmedEmail) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Email không hợp lệ";
    } else if (isDisposableEmail(trimmedEmail)) {
      newErrors.email = "Không cho phép sử dụng email tạm thời";
    }

    if (!normalizedPhoneNumber) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(normalizedPhoneNumber)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
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

      if (!result.success) {
        const msg = result.message || "Đăng ký thất bại. Vui lòng thử lại.";
        if (msg.toLowerCase().includes("email")) {
          setErrors({
            email: msg,
          });
        } else if (
          msg.toLowerCase().includes("số điện thoại") ||
          msg.toLowerCase().includes("sđt") ||
          msg.toLowerCase().includes("phone")
        ) {
          setErrors({
            phone: msg,
          });
        } else {
          setErrors({
            general: msg,
          });
        }
        return;
      }

      setSuccessMessage(result.message);

      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setErrors({
        general: error?.message || "Đăng ký thất bại. Vui lòng thử lại.",
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

      <div className="flex-1 flex items-start justify-center pt-24 pb-10">
        <div className="w-full max-w-[500px] rounded-md border border-slate-300 bg-white px-12 py-12 shadow-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-800">SGCMP</h1>

          <h2 className="mt-5 text-3xl font-bold text-slate-950">
            Tạo tài khoản mới
          </h2>

          <p className="mt-3 text-lg text-slate-700">
            Điền thông tin của bạn để truy cập hệ thống
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

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nhập họ và tên"
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

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
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

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Số điện thoại
            </label>
            <input
              type="tel"
              placeholder="+84 000 000 000"
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

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Mật khẩu
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

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-950">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
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
            className="mt-8 h-12 w-full rounded bg-blue-800 text-base font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>

          <div className="pt-4">
            <div className="border-t border-slate-300" />
          </div>

          <div className="text-center text-base text-slate-700">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-800 hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
     </div>
     <Footer />
    </div>
  );
}
