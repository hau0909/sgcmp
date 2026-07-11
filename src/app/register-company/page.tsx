"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RegisterCompanyStepper from "@/features/registration/components/RegisterCompanyStepper";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function RegisterCompanyPage() {
  const router = useRouter();

  return (
    <>
      <Header />
      <main className="flex-1 mt-20 py-12 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mb-8 min-h-0 sm:min-h-[80px] py-4 sm:py-0 flex items-center justify-center">
            {/* Back button on the top-left (Desktop only) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/");
                  }
                }}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-all duration-200 group bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Quay lại</span>
              </button>
            </div>

            {/* Title & subtitle */}
            <div className="text-center max-w-lg mx-auto">
              <h1 className="text-3xl font-bold text-on-surface tracking-tight font-headline">
                Đăng Ký Doanh Nghiệp Bảo Vệ
              </h1>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Trở thành đối tác cung cấp dịch vụ bảo vệ trên nền tảng SGCMP để tiếp cận hàng ngàn khách hàng.
              </p>
            </div>
          </div>

          {/* Back button for mobile */}
          <div className="md:hidden mb-6 flex justify-start">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-all duration-200 group bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Quay lại</span>
            </button>
          </div>

          <RegisterCompanyStepper />
        </div>
      </main>
      <Footer />
    </>
  );
}
