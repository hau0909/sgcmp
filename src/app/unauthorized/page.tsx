"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ShieldAlert, ArrowLeft, LogOut, Mail, Unlock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/components/providers/LanguageProvider";

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { dict } = useTranslation();

  const isInactive = reason === "inactive";
  const isBanned = reason === "banned";

  const handleGoBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } finally {
      clearAuth();
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md">
        {/* Icon Header */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <ShieldAlert className="h-10 w-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {isBanned
            ? (dict.pages.unauthorized.banned_title || "Tài khoản đã bị khóa")
            : isInactive
              ? dict.pages.unauthorized.inactive_title
              : dict.pages.unauthorized.access_denied_title}
        </h1>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {isBanned
            ? (dict.pages.unauthorized.banned_desc || "Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.")
            : isInactive
              ? dict.pages.unauthorized.inactive_desc
              : dict.pages.unauthorized.no_access_desc}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isBanned ? (
            <button
              type="button"
              className="whitespace-nowrap flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Unlock className="h-4 w-4" />
              <span>{dict.pages.unauthorized.unlock_account || "Gỡ khóa tài khoản"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoBack}
              className="whitespace-nowrap flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{dict.pages.unauthorized.go_back}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{dict.pages.unauthorized.logout_login}</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Đang tải...</div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
