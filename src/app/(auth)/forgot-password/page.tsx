"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestForgotPassword } from "@/features/auth/api/auth.api";
import { ArrowLeft, MailCheck, Loader2, AlertCircle } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { dict } = useTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError(
        dict.pages.auth?.login?.errors?.email_required || "Vui lòng nhập địa chỉ email.",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError(
        dict.pages.auth?.login?.errors?.email_invalid || "Địa chỉ email không hợp lệ.",
      );
      return;
    }

    setLoading(true);

    try {
      const res = await requestForgotPassword({ email: trimmedEmail });

      if (res?.success) {
        setIsSentSuccess(true);
      } else {
        setGeneralError(
          res?.message || "Gửi yêu cầu đặt lại mật khẩu thất bại. Vui lòng thử lại.",
        );
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative">
      {/* Back button */}
      <div className="absolute left-6 top-6">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-800 transition-all duration-200 group bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{dict.pages.auth?.forgot_password_page?.back_to_login || "Quay lại đăng nhập"}</span>
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center pt-24 pb-6 px-4">
        <div className="w-full max-w-[430px] rounded-2xl border border-slate-200 bg-white px-7 py-8 shadow-sm">
          {!isSentSuccess ? (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  {dict.pages.auth?.forgot_password_page?.title || "Quên mật khẩu?"}
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {dict.pages.auth?.forgot_password_page?.subtitle ||
                    "Nhập địa chỉ email của bạn để nhận hướng dẫn đặt lại mật khẩu."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
                {generalError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{generalError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    {dict.pages.auth?.forgot_password_page?.email_label || "Địa chỉ Email"}
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder={
                      dict.pages.auth?.forgot_password_page?.email_placeholder ||
                      "name@company.com"
                    }
                    value={email}
                    disabled={loading}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                      if (generalError) setGeneralError(null);
                    }}
                    className={`h-11 w-full rounded-xl border px-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-1 disabled:bg-slate-100 ${
                      emailError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/20"
                        : "border-slate-300 focus:border-blue-700 focus:ring-blue-700"
                    }`}
                  />
                  {emailError && (
                    <p className="text-xs font-medium text-red-600 mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {loading
                      ? dict.pages.auth?.forgot_password_page?.sending || "Đang gửi..."
                      : dict.pages.auth?.forgot_password_page?.submit_btn || "Gửi yêu cầu"}
                  </span>
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {dict.pages.auth?.forgot_password_page?.back_to_login || "Quay lại đăng nhập"}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <MailCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {dict.pages.auth?.forgot_password_page?.success_title || "Đã gửi email!"}
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {dict.pages.auth?.forgot_password_page?.success_desc ||
                  `Liên kết đặt lại mật khẩu đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư của bạn.`}
              </p>
              <Link
                href="/login"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center"
              >
                {dict.pages.auth?.forgot_password_page?.back_to_login || "Quay lại đăng nhập"}
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
