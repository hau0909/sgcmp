"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types/Enum";
import { getRedirectPathByRole } from "@/features/auth/utils/redirectByRole";

type VerifyStatus = "loading" | "success" | "error";

type AuthProfile = {
  user_id: string;
  role: UserRole;
  company_id: string | null;
};



const extractAuthProfile = (payload: any): AuthProfile | null => {
  const data = payload?.data;

  const profile =
    data?.profile ?? data?.user ?? data ?? payload?.profile ?? payload?.user;

  const userId = profile?.user_id ?? profile?.id;
  const role = profile?.role;

  if (!userId || !role) {
    return null;
  }

  return {
    user_id: userId,
    role: role as UserRole,
    company_id: profile?.company_id ?? null,
  };
};

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const hasVerified = useRef(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Đang xác thực email của bạn...");

  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendMessage("Vui lòng nhập email.");
      return;
    }
    try {
      setResending(true);
      setResendMessage("");

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });

      if (error) {
        throw error;
      }

      setResendMessage(
        "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn."
      );
    } catch (err: any) {
      console.error("[Resend Verify] Error:", err);
      setResendMessage(
        err.message || "Gửi lại email thất bại. Vui lòng thử lại."
      );
    } finally {
      setResending(false);
    }
  };

  const handleVerifyError = useCallback(
    async (logMessage: string, userMessage: string, error?: unknown) => {
      console.error(`[Verify Email] ${logMessage}`, error);

      clearAuth();

      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error(
          "[Verify Email] Sign out after verify error failed",
          signOutError,
        );
      }

      setStatus("error");
      setMessage(userMessage);
    },
    [clearAuth, supabase],
  );

  const redirectAfterVerify = useCallback(async () => {
    const response = await fetch("/api/auth/user", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin người dùng sau xác thực.");
    }

    const payload = await response.json();
    const profile = extractAuthProfile(payload);

    if (!profile) {
      throw new Error("Không tìm thấy vai trò người dùng.");
    }

    setAuth({
      user_id: profile.user_id,
      role: profile.role,
      company_id: profile.company_id,
    });

    const redirectPath = getRedirectPathByRole(profile.role);

    setTimeout(() => {
      router.refresh();
      router.replace(redirectPath);
    }, 2000);
  }, [router, setAuth]);

  useEffect(() => {
    if (hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );

        const errorCode = hashParams.get("error_code");
        const errorDescription = hashParams.get("error_description");

        if (errorCode === "otp_expired") {
          await handleVerifyError(
            "OTP expired",
            "Liên kết xác thực đã hết hạn. Vui lòng đăng ký lại.",
            {
              errorCode,
              errorDescription,
            },
          );
          return;
        }

        if (errorCode) {
          await handleVerifyError(
            "Verify email returned error code",
            errorDescription || "Xác thực email thất bại.",
            {
              errorCode,
              errorDescription,
            },
          );
          return;
        }

        const code = searchParams.get("code");
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            await handleVerifyError(
              "exchangeCodeForSession failed",
              error.message || "Xác thực thất bại. Vui lòng thử lại.",
              error,
            );
            return;
          }

          setStatus("success");
          setMessage("Xác thực email thành công!");

          await redirectAfterVerify();
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            await handleVerifyError(
              "setSession failed",
              "Không thể tạo phiên đăng nhập. Vui lòng đăng nhập lại.",
              error,
            );
            return;
          }

          setStatus("success");
          setMessage("Xác thực email thành công!");

          await redirectAfterVerify();
          return;
        }

        if (!token_hash) {
          await handleVerifyError(
            "Missing token_hash",
            "Liên kết xác thực không hợp lệ.",
            {
              code,
              token_hash,
              type,
              accessToken,
              refreshToken,
            },
          );
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type:
            (type as "email" | "signup" | "magiclink" | "recovery") || "email",
        });

        if (error) {
          await handleVerifyError(
            "verifyOtp failed",
            "Xác thực thất bại. Liên kết có thể đã hết hạn.",
            error,
          );
          return;
        }

        setStatus("success");
        setMessage("Xác thực email thành công!");

        await redirectAfterVerify();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra. Vui lòng thử lại.";

        await handleVerifyError(
          "Unexpected verify email error",
          errorMessage,
          error,
        );
      }
    };

    verifyEmail();
  }, [handleVerifyError, redirectAfterVerify, searchParams, supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary/5 px-4">
      <section className="w-full max-w-md rounded-3xl border border-outline-variant/30 bg-surface-container-lowest px-8 py-10 shadow-xl">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {status === "loading" && (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            )}

            {status === "success" && (
              <CheckCircle className="h-11 w-11 text-primary" />
            )}

            {status === "error" && (
              <XCircle className="h-11 w-11 text-red-500" />
            )}
          </div>
        </div>

        <div className="text-center">
          {status === "loading" && (
            <>
              <h1 className="text-2xl font-bold text-primary">Đang xác thực</h1>
              <p className="mt-3 text-sm text-on-surface-variant">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-primary">
                Xác thực thành công
              </h1>

              <p className="mt-3 text-sm text-on-surface-variant">{message}</p>

              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                <MailCheck className="h-4 w-4 text-primary" />
                <span>Đang chuyển bạn đến trang phù hợp...</span>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-red-500">
                Xác thực thất bại
              </h1>

              <p className="mt-3 text-sm text-on-surface-variant">{message}</p>

              <form onSubmit={handleResendVerifyEmail} className="mt-8 text-left space-y-3">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Gửi lại email xác thực
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    disabled={resending}
                    className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                    required
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                  >
                    {resending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-on-primary" />
                    ) : (
                      "Gửi"
                    )}
                  </button>
                </div>
                {resendMessage && (
                  <p
                    className={`text-xs font-semibold mt-1 ${resendMessage.includes("thành công") ||
                      resendMessage.includes("Đã gửi")
                      ? "text-green-600"
                      : "text-red-500"
                      }`}
                  >
                    {resendMessage}
                  </p>
                )}
              </form>

              <div className="mt-8 space-y-3">
                <Link
                  href="/register"
                  className="block w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-on-primary transition hover:opacity-90 hover:shadow-md"
                >
                  Đăng ký lại
                </Link>

                <Link
                  href="/login"
                  className="block w-full rounded-xl border border-primary px-5 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-primary/5 px-4">
          <section className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl border border-outline-variant/30 bg-surface-container-lowest px-8 py-10 shadow-xl">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-on-surface-variant">Đang tải...</p>
          </section>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
