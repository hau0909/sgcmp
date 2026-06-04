"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const hasVerified = useRef(false);
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Đang xác thực email của bạn...");

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );

        const errorCode = hashParams.get("error_code");
        const errorDescription = hashParams.get("error_description");

        if (errorCode === "otp_expired") {
          setStatus("error");
          setMessage("Liên kết xác thực đã hết hạn. Vui lòng đăng ký lại.");
          return;
        }

        if (errorCode) {
          setStatus("error");
          setMessage(errorDescription || "Xác thực email thất bại.");
          return;
        }

        const code = searchParams.get("code");
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          console.log("exchangeCodeForSession data:", data);
          console.log("exchangeCodeForSession error:", error);

          if (error) {
            setStatus("error");
            setMessage(error.message || "Xác thực thất bại. Vui lòng thử lại.");
            return;
          }

          setStatus("success");
          setMessage("Xác thực email thành công!");

          setTimeout(() => {
            router.refresh();
            router.replace("/");
          }, 3000);

          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setStatus("error");
            setMessage(
              "Không thể tạo phiên đăng nhập. Vui lòng đăng nhập lại.",
            );
            return;
          }

          setStatus("success");
          setMessage("Xác thực email thành công!");

          setTimeout(() => {
            router.refresh();
            router.replace("/");
          }, 3000);

          return;
        }

        if (!token_hash) {
          setStatus("error");
          setMessage("Liên kết xác thực không hợp lệ.");
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type:
            (type as "email" | "signup" | "magiclink" | "recovery") || "email",
        });

        if (error) {
          setStatus("error");
          setMessage("Xác thực thất bại. Liên kết có thể đã hết hạn.");
          return;
        }

        setStatus("success");
        setMessage("Xác thực email thành công!");

        setTimeout(() => {
          router.refresh();
          router.replace("/");
        }, 3000);
      } catch (error) {
        console.error("Verify email error:", error);
        setStatus("error");
        setMessage("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    };

    verifyEmail();
  }, [router, searchParams, supabase]);

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
                <span>Đang chuyển bạn đến trang chủ...</span>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-red-500">
                Xác thực thất bại
              </h1>

              <p className="mt-3 text-sm text-on-surface-variant">{message}</p>

              <div className="mt-8 space-y-3">
                <Link
                  href="/sign-up"
                  className="block w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-on-primary transition hover:bg-primary-container hover:shadow-md"
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
