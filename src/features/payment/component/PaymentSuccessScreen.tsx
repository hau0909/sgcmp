import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LANDING_PLANS } from "./plans-data";

interface PaymentSuccessScreenProps {
  planId: string;
}

const getSelectedPlan = (id: string) => {
  const normId = String(id).toLowerCase();
  const found =
    LANDING_PLANS.find(
      (p) =>
        p.id === normId ||
        normId.includes(p.id) ||
        p.id.includes(normId) ||
        (normId === "1" && p.id === "co-ban") ||
        (normId === "2" && p.id === "chuyen-nghiep") ||
        (normId === "3" && p.id === "doanh-nghiep"),
    ) || LANDING_PLANS[2]; // Default to Doanh nghiệp

  return found;
};

const getPlanNumericId = (id: string): number => {
  const norm = String(id).toLowerCase();
  if (norm.includes("co-ban") || norm === "1") return 1;
  if (norm.includes("chuyen-nghiep") || norm === "2") return 2;
  if (norm.includes("doanh-nghiep") || norm === "3") return 3;
  return 3;
};

export default function PaymentSuccessScreen({ planId }: PaymentSuccessScreenProps) {
  const plan = getSelectedPlan(planId);
  const planNumericId = getPlanNumericId(planId);

  // Format amount
  const amountFormatted = new Intl.NumberFormat("vi-VN").format(plan.priceVal);

  // Mock data matching the public.payments table structure
  const paymentId = "8f3b9c7a-d21e-4f3a-96c8-10b2a3d4e5f6";
  const subscriptionId = "7e12f45a-c98b-4d7e-961d-8472bf62c301";
  const companyId = "3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8g";
  const transactionCode = `SGCMP ORD789${plan.id.toUpperCase()}`;
  const paymentMethod = "Chuyen Khoan";
  const paymentStatus = "PENDING";

  // Render stable transaction time
  const createdAtFormatted = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Calculate subscription dates (1 month duration)
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const startDateFormatted = formatDate(today);
  const endDateFormatted = formatDate(nextMonth);
  const subscriptionStatus = "PENDING";
  const autoRenew = "true";
  const updatedAtFormatted = "null";

  return (
    <div className="flex-1 max-w-[950px] w-full mx-auto px-4 py-4 md:py-8 flex flex-col items-center justify-center">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-7 flex flex-col items-center text-center shadow-lg w-full relative overflow-hidden">
        {/* Decorative subtle background pattern */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-secondary via-primary to-accent" />

        {/* Success Icon (Static, premium design without animation) */}
        <div className="w-14 h-14 rounded-full bg-green-500/10 border-4 border-green-500/20 flex items-center justify-center mb-3 relative">
          <div className="absolute inset-0 rounded-full bg-green-500/5 blur-sm" />
          <ShieldCheck className="w-7 h-7 text-green-600 relative z-10" />
        </div>

        <h1 className="text-xl font-extrabold text-on-surface tracking-tight font-headline mb-1">
          Thanh toán thành công!
        </h1>

        <p className="text-xs text-on-surface-variant font-medium font-body max-w-lg mb-5 leading-relaxed">
          Giao dịch chuyển khoản đang được hệ thống đối soát tự động. Gói dịch
          vụ của bạn sẽ được kích hoạt trong vòng <strong>5-10 phút</strong>.
        </p>

        {/* Side-by-side Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
          {/* Box 1: Subscription Plan Details */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 text-left text-xs flex flex-col gap-2.5 shadow-sm h-full">
            <h3 className="font-bold text-on-surface border-b border-outline-variant/40 pb-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant">
              Thông tin gói dịch vụ
            </h3>

            <div className="flex justify-between items-center mt-0.5">
              <span className="font-medium text-on-surface-variant/80">Tên gói</span>
              <span className="font-bold text-on-surface">{plan.name}</span>
            </div>

            <div className="flex justify-between items-center border-t border-outline-variant/20 pt-2.5">
              <span className="font-medium text-on-surface-variant/80">Thời hạn sử dụng</span>
              <span className="font-semibold text-on-surface">1 tháng</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-medium text-on-surface-variant/80">Ngày bắt đầu</span>
              <span className="font-semibold text-on-surface">{startDateFormatted}</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-medium text-on-surface-variant/80">Ngày kết thúc</span>
              <span className="font-semibold text-on-surface">{endDateFormatted}</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-medium text-on-surface-variant/80">Trạng thái đăng ký</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                {subscriptionStatus}
              </span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-medium text-on-surface-variant/80">Tự động gia hạn</span>
              <span className="font-semibold text-on-surface bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant/30 text-[10px]">
                {autoRenew}
              </span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="font-medium text-on-surface-variant/80">Ngày cập nhật</span>
              <span className="text-on-surface-variant/60 italic font-medium">{updatedAtFormatted}</span>
            </div>

            <div className="flex flex-col gap-2 border-t border-outline-variant/20 pt-2.5 flex-1">
              <span className="font-medium text-on-surface-variant/80">Tính năng chính bao gồm:</span>
              <ul className="flex flex-col gap-1.5 pl-1 text-[11px] text-on-surface-variant font-medium">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="break-words">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Box 2: Payment Details */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/50 text-left text-xs flex flex-col gap-2.5 shadow-sm h-full">
            <h3 className="font-bold text-on-surface border-b border-outline-variant/40 pb-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant">
              Thông tin chi tiết giao dịch
            </h3>

            <div className="flex flex-col gap-2.5 mt-0.5">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Mã thanh toán</span>
                <span className="font-mono text-[10px] font-bold text-on-surface bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant/30">
                  {paymentId.slice(0, 8)}...{paymentId.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Mã đăng ký</span>
                <span className="font-mono text-[10px] font-bold text-on-surface bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant/30">
                  {subscriptionId.slice(0, 8)}...{subscriptionId.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Mã doanh nghiệp</span>
                <span className="font-mono text-[10px] font-bold text-on-surface bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant/30">
                  {companyId.slice(0, 8)}...{companyId.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Mã gói</span>
                <span className="font-bold text-on-surface bg-surface-container-high w-5 h-5 flex items-center justify-center rounded-full border border-outline-variant/30 text-[10px]">
                  {planNumericId}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Phương thức</span>
                <span className="font-semibold text-on-surface uppercase bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant/30">
                  {paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant border-t border-outline-variant/20 pt-2.5">
                <span className="font-medium text-on-surface-variant/80">Số tiền</span>
                <span className="font-bold text-primary">{amountFormatted} VNĐ</span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Trạng thái</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                  {paymentStatus}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Mã đối soát</span>
                <span className="font-mono font-bold text-on-surface bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded">
                  {transactionCode}
                </span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Ngày tạo</span>
                <span className="font-semibold text-on-surface">{createdAtFormatted}</span>
              </div>

              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-medium text-on-surface-variant/80">Thanh toán lúc</span>
                <span className="text-on-surface-variant/60 italic font-medium">null (Đang chờ)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/billing"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full font-bold text-xs flex items-center justify-center hover:opacity-95 transition-opacity bg-primary text-white",
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
