"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Payment } from "@/types/Payment";
import { Plan } from "@/types/Plan";
import { requestGetPaymentById } from "@/features/payment/api/payment.api";
import { requestGetAllPlans } from "@/features/subscription/api/subscription.api";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { formatPrice } from "@/utils/formatPrice";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { dict, locale } = useTranslation();
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";

  const planId = params.planId as string;
  const paymentIdParam = searchParams.get("paymentId");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentIdParam) {
      router.replace("/billing");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [paymentRes, plans] = await Promise.all([
          requestGetPaymentById(paymentIdParam),
          requestGetAllPlans(),
        ]);

        if (paymentRes.success && paymentRes.data) {
          if (paymentRes.data.payment_status !== "completed") {
            router.replace("/billing");
            return;
          }
          setPayment(paymentRes.data);

          // Find plan by payment's plan_id or route planId
          const matchedPlan =
            plans.find((p) => p.plan_id === paymentRes.data!.plan_id) ||
            plans.find((p) => p.plan_id.toString() === planId) ||
            null;
          setPlan(matchedPlan);
        } else {
          router.replace("/billing");
        }
      } catch (err) {
        console.error("Error loading payment success details:", err);
        router.replace("/billing");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paymentIdParam, planId, router]);

  if (loading) {
    return (
      <div className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg w-full min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-xs text-on-surface-variant font-medium font-body">
            {dict.payment?.loading_tx || "Đang tải thông tin giao dịch..."}
          </p>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  // Data derived purely from real API
  const displayTransactionCode = payment.transaction_code || payment.payment_id.slice(0, 12).toUpperCase();
  const displayAmount = payment.amount;
  const displayPaymentMethod =
    payment.payment_method === "bank_transfer"
      ? (dict.payment_success?.bank_transfer || "Chuyển khoản (Bank Transfer)")
      : payment.payment_method;

  const baseDate = payment.paid_at ? new Date(payment.paid_at) : new Date(payment.created_at);

  const createdAtFormatted = baseDate.toLocaleString(dateLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const endDate = new Date(baseDate);
  endDate.setDate(baseDate.getDate() + 30);
  const endDateFormatted = endDate.toLocaleDateString(dateLocale);

  return (
    <div className="flex-1 max-w-md w-full mx-auto px-4 py-6 md:py-10 flex flex-col items-center justify-center">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 flex flex-col items-center text-center shadow-xl w-full relative overflow-hidden">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center mb-4 text-primary">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline mb-1.5">
          {dict.payment_success?.title || "Thanh toán thành công!"}
        </h1>
        <p className="text-xs text-on-surface-variant font-medium font-body mb-6">
          {dict.payment_success?.subtitle || "Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi."}
        </p>

        {/* Transaction Details Box */}
        <div className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 md:p-5 text-left mb-6 font-body">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 border-b border-outline-variant/50 pb-2 mb-3">
            {dict.payment_success?.tx_details_title || "CHI TIẾT GIAO DỊCH"}
          </h2>

          <div className="flex flex-col gap-2.5 text-xs">
            {/* Transaction Code */}
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>{dict.payment_success?.col_tx_code || "Mã giao dịch"}</span>
              <span className="font-mono font-bold text-on-surface">{displayTransactionCode}</span>
            </div>

            {/* Service Package Name */}
            {plan && (
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>{dict.payment_success?.col_service || "Gói dịch vụ"}</span>
                <span className="font-semibold text-on-surface">{plan.plan_name}</span>
              </div>
            )}

            {/* Amount */}
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>{dict.payment_success?.col_amount || "Số tiền"}</span>
              <span className="font-black text-primary text-sm">{formatPrice(displayAmount)} VNĐ</span>
            </div>

            {/* Method */}
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>{dict.payment_success?.col_method || "Phương thức"}</span>
              <span className="font-medium text-on-surface">{displayPaymentMethod}</span>
            </div>

            {/* Time */}
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>{dict.payment_success?.col_time || "Thời gian"}</span>
              <span className="font-mono text-on-surface-variant">{createdAtFormatted}</span>
            </div>

            {/* Expiry */}
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>{dict.payment_success?.col_expiry || "Thời hạn sử dụng"}</span>
              <span className="font-semibold text-on-surface">
                {dict.payment_success?.expiry_until?.replace("{0}", endDateFormatted) || `Đến ${endDateFormatted}`}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => router.push("/billing")}
          className="w-full bg-primary hover:bg-primary/95 text-on-primary font-bold py-3 px-6 rounded-xl shadow-md transition-transform active:scale-98 text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{dict.payment_success?.start_experience || "Bắt đầu trải nghiệm"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
