"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Lock, ArrowLeft, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { requestLogout } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/components/providers/LanguageProvider";

function UpdatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useTranslation();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [hasConfirmedStep, setHasConfirmedStep] = useState(false);

  // Field errors
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Success modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const errorParam = searchParams.get("error");
        if (errorParam) {
          if (isMounted) {
            setHasSession(false);
          }
          return;
        }

        const supabase = createClient();
        const code = searchParams.get("code");

        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (codeErr) {
            console.warn("PKCE code exchange error:", codeErr);
          }
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (isMounted) {
          if (user) {
            setHasSession(true);
          } else {
            setHasSession(false);
          }
        }
      } catch (err) {
        console.error("Error checking reset session:", err);
      } finally {
        if (isMounted) {
          setCheckingSession(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setConfirmPasswordError(null);
    setGeneralError(null);

    let hasErr = false;

    if (!password) {
      setPasswordError(
        dict.pages.registration?.err_password_required || "Vui lòng nhập mật khẩu mới.",
      );
      hasErr = true;
    } else if (password.length < 8) {
      setPasswordError(
        dict.pages.registration?.err_password_short || "Mật khẩu phải có ít nhất 8 ký tự.",
      );
      hasErr = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        dict.pages.registration?.err_confirm_required || "Vui lòng xác nhận mật khẩu mới.",
      );
      hasErr = true;
    } else if (password && confirmPassword !== password) {
      setConfirmPasswordError(
        dict.pages.registration?.err_confirm_mismatch || "Mật khẩu xác nhận không khớp.",
      );
      hasErr = true;
    }

    if (hasErr) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setGeneralError(
          error.message || "Cập nhật mật khẩu thất bại. Phiên đặt lại mật khẩu có thể đã hết hạn.",
        );
      } else {
        // Sign out session so user MUST log in again with new password
        try {
          await requestLogout();
        } catch {
          await supabase.auth.signOut();
        }
        clearAuth();

        setIsSuccessModalOpen(true);
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Đã xảy ra lỗi khi cập nhật mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setIsSuccessModalOpen(false);
    router.replace("/login");
    router.refresh();
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
          <span>{dict.pages.auth?.update_password_page?.back_to_login || "Về trang đăng nhập"}</span>
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center pt-24 pb-6 px-4">
        <div className="w-full max-w-[430px] rounded-2xl border border-slate-200 bg-white px-7 py-8 shadow-sm">
          {checkingSession ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500 font-medium">Đang kiểm tra liên kết đặt lại mật khẩu...</p>
            </div>
          ) : !hasSession ? (
            <div className="text-center py-4 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Liên kết không hợp lệ hoặc đã hết hạn
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Liên kết đặt lại mật khẩu của bạn có thể đã được sử dụng hoặc quá thời hạn cho phép. Vui lòng gửi lại yêu cầu mới.
              </p>
              <div className="w-full flex flex-col gap-2.5">
                <Link
                  href="/forgot-password"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center"
                >
                  Gửi lại yêu cầu đặt lại mật khẩu
                </Link>
                <Link
                  href="/login"
                  className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          ) : !hasConfirmedStep ? (
            /* Bước thông báo xác thực email thành công */
            <div className="text-center py-4 flex flex-col items-center animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <MailCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {dict.pages.auth?.update_password_page?.email_verify_success_title || "Xác thực email thành công!"}
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                {dict.pages.auth?.update_password_page?.email_verify_success_desc ||
                  "Liên kết của bạn đã được xác thực thành công. Vui lòng bấm Tiếp tục để tiến hành đặt lại mật khẩu mới."}
              </p>
              <button
                type="button"
                onClick={() => setHasConfirmedStep(true)}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                {dict.pages.auth?.update_password_page?.continue_btn || "Tiếp tục đặt lại mật khẩu"}
              </button>
            </div>
          ) : (
            /* Bước đổi mật khẩu mới */
            <div className="animate-in fade-in duration-200">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  {dict.pages.auth?.update_password_page?.title || "Đặt lại mật khẩu mới"}
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {dict.pages.auth?.update_password_page?.subtitle ||
                    "Vui lòng nhập mật khẩu mới cho tài khoản của bạn."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
                {generalError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{generalError}</span>
                  </div>
                )}

                {/* New Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    {dict.pages.auth?.update_password_page?.new_password || "Mật khẩu mới"}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        dict.pages.auth?.update_password_page?.new_password_placeholder ||
                        "Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                      }
                      value={password}
                      disabled={loading}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                        if (generalError) setGeneralError(null);
                      }}
                      className={`h-11 w-full rounded-xl border pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:ring-1 disabled:bg-slate-100 ${
                        passwordError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/20"
                          : "border-slate-300 focus:border-blue-700 focus:ring-blue-700"
                      }`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs font-medium text-red-600 mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    {dict.pages.auth?.update_password_page?.confirm_password || "Xác nhận mật khẩu mới"}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={
                        dict.pages.auth?.update_password_page?.confirm_password_placeholder ||
                        "Nhập lại mật khẩu mới"
                      }
                      value={confirmPassword}
                      disabled={loading}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError(null);
                        if (generalError) setGeneralError(null);
                      }}
                      className={`h-11 w-full rounded-xl border pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:ring-1 disabled:bg-slate-100 ${
                        confirmPasswordError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/20"
                          : "border-slate-300 focus:border-blue-700 focus:ring-blue-700"
                      }`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-xs font-medium text-red-600 mt-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-4"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {loading
                      ? dict.pages.auth?.update_password_page?.updating || "Đang cập nhật..."
                      : dict.pages.auth?.update_password_page?.submit_btn || "Cập nhật mật khẩu"}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {dict.pages.auth?.update_password_page?.success_title || "Cập nhật thành công!"}
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {dict.pages.auth?.update_password_page?.success_desc ||
                "Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại với mật khẩu mới."}
            </p>
            <button
              type="button"
              onClick={handleGoToLogin}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold w-full hover:bg-primary/90 transition-all cursor-pointer"
            >
              {dict.pages.auth?.update_password_page?.back_to_login || "Đăng nhập ngay"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <UpdatePasswordContent />
    </Suspense>
  );
}
