import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    planId: string;
  }>;
}

export default async function PaymentSuccessPage({ params }: PageProps) {
  const { planId } = await params;

  return (
    <div className="flex-1 max-w-[600px] w-full mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 md:p-10 flex flex-col items-center text-center shadow-lg w-full relative overflow-hidden">
        {/* Decorative subtle background pattern */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-accent" />
        
        {/* Glow Success Icon */}
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-green-600 animate-bounce" />
        </div>

        <h1 className="text-xl font-bold text-on-surface tracking-tight font-headline mb-3">
          Đã hoàn tất gửi yêu cầu thanh toán!
        </h1>
        
        <p className="text-xs text-on-surface-variant font-medium font-body max-w-sm mb-8 leading-relaxed">
          Giao dịch cho gói dịch vụ đang được hệ thống đối soát tự động. Gói của bạn sẽ được kích hoạt trong vòng <strong>5-15 phút</strong>.
        </p>

        <div className="w-full bg-surface-container-low rounded-xl p-4 border border-outline-variant/40 mb-8 text-left font-semibold text-xs flex flex-col gap-2.5">
          <div className="flex justify-between text-on-surface-variant">
            <span>Trạng thái giao dịch</span>
            <span className="text-secondary font-bold">Chờ xử lý (Pending)</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Mã đơn hàng</span>
            <span className="font-mono text-on-surface">SGCMP ORD789{planId}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant border-t border-outline-variant/40 pt-2.5 mt-1">
            <span>Phương thức</span>
            <span>Chuyển khoản VietQR</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/billing"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full font-bold text-xs flex items-center justify-center"
            )}
          >
            Quay lại Quản lý gói
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
