"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Plan } from "@/types/Plan";
import { BankAccount } from "@/types/BankAccount";
import { CurrentPlanWithSubscription } from "../types";
import { formatPrice } from "@/utils/formatPrice";
import {
  requestCreatePayment,
  requestGetActiveBankAccount,
} from "@/features/payment/api/payment.api";

export default function SubscriptionPlans({
  plans,
  currentPlan,
  companyId,
}: {
  plans: Plan[];
  currentPlan: CurrentPlanWithSubscription | null;
  companyId: string;
}) {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeBankAccount, setActiveBankAccount] = useState<
    BankAccount | null | undefined
  >(undefined); // undefined = loading

  // Fetch active bank account to check payment availability
  useEffect(() => {
    requestGetActiveBankAccount()
      .then((res) => {
        setActiveBankAccount(res.success ? res.data : null);
      })
      .catch(() => setActiveBankAccount(null));
  }, []);

  const paymentUnavailable = activeBankAccount === null; // null = loaded but no active account
  const paymentLoading = activeBankAccount === undefined; // undefined = still fetching

  const handleSubscribe = async (planId: number) => {
    if (paymentUnavailable) return;

    try {
      setLoadingPlanId(planId);
      setErrorMsg(null);
      const res = await requestCreatePayment(
        companyId,
        planId,
        "bank_transfer",
      );

      if (res.success && res.data) {
        router.push(
          `/billing/payment/${planId}?paymentId=${res.data.payment_id}`,
        );
      } else {
        throw new Error("Không thể khởi tạo giao dịch thanh toán");
      }
    } catch (error: unknown) {
      console.error("Lỗi đăng ký gói:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.";
      setErrorMsg(message);
      setLoadingPlanId(null);
    }
  };

  const currentPlanId = currentPlan?.plan?.plan_id;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-on-surface tracking-tight">
          {currentPlan ? "Các Gói Dịch Vụ Khác" : "Các Gói Dịch Vụ"}
        </h3>
        {errorMsg && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-md border border-red-200 animate-fade-in">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Payment unavailable banner */}
      {paymentUnavailable && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 font-medium">
            <span className="font-bold">
              Thanh toán gói hiện không khả dụng.
            </span>{" "}
            Hệ thống chưa có tài khoản ngân hàng nào được kích hoạt. Vui lòng
            liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan: Plan) => {
          const isCurrent = currentPlan
            ? plan?.plan_id === currentPlanId
            : false;
          const showRegister = currentPlan === null;

          return (
            <div
              key={plan.plan_id}
              className={`bg-surface-container-lowest border rounded-xl p-6 flex flex-col transition-all relative shadow-sm
                ${
                  isCurrent
                    ? "border-primary border-2 -translate-y-1 shadow-md"
                    : "border-outline-variant hover:border-outline"
                }`}
            >
              {isCurrent && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Gói Của Bạn
                </div>
              )}

              <h4
                className={`text-base font-bold mb-2 ${isCurrent ? "text-primary mt-1" : "text-on-surface"}`}
              >
                {plan?.plan_name}
              </h4>
              <p className="text-xs text-on-surface-variant mb-5 min-h-8 font-medium leading-relaxed">
                {plan?.description}
              </p>

              <div className="mb-6 flex items-baseline">
                <span
                  className={`text-2xl font-black ${isCurrent ? "text-primary" : "text-on-surface"}`}
                >
                  {formatPrice(plan?.price)}{" "}
                  <span className="text-sm text-muted-foreground font-medium">
                    VND/Tháng
                  </span>
                </span>
              </div>

              <ul className="space-y-3 mb-8 fle-1">
                {(() => {
                  let parsedFeatures: string[] = [];
                  if (plan?.features) {
                    if (Array.isArray(plan.features)) {
                      parsedFeatures = plan.features;
                    } else if (typeof plan.features === "object") {
                      // Handle jsonb object like {"features": ["..."]}
                      const obj = plan.features as any;
                      if (Array.isArray(obj.features)) {
                        parsedFeatures = obj.features;
                      } else {
                        parsedFeatures = [];
                      }
                    } else if (typeof plan.features === "string") {
                      const featuresStr = plan.features as unknown as string;
                      try {
                        const parsed = JSON.parse(featuresStr);
                        if (Array.isArray(parsed)) {
                          parsedFeatures = parsed;
                        } else if (
                          parsed &&
                          typeof parsed === "object" &&
                          Array.isArray(parsed.features)
                        ) {
                          parsedFeatures = parsed.features;
                        } else {
                          parsedFeatures = [featuresStr];
                        }
                      } catch {
                        parsedFeatures = featuresStr
                          .split(",")
                          .map((f) => f.trim())
                          .filter(Boolean);
                      }
                    }
                  }
                  return parsedFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold
                        ${isCurrent ? "text-on-surface/80" : ""}`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5
                          ${isCurrent ? "text-primary" : "text-secondary"}`}
                      />
                      <span>{feature}</span>
                    </li>
                  ));
                })()}

                {plan.max_coordinators !== null && (
                  <li
                    className={`flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold
                      ${isCurrent ? "text-on-surface/80" : ""}`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5
                        ${isCurrent ? "text-primary" : "text-secondary"}`}
                    />
                    <span>Tối đa {plan.max_coordinators} điều phối viên</span>
                  </li>
                )}
                {plan.max_guards !== null && (
                  <li
                    className={`flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold
                      ${isCurrent ? "text-on-surface/80" : ""}`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5
                        ${isCurrent ? "text-primary" : "text-secondary"}`}
                    />
                    <span>Tối đa {plan.max_guards} bảo vệ</span>
                  </li>
                )}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="w-full bg-surface-container-low text-on-surface-variant/70 font-bold py-2 rounded text-xs cursor-default select-none border border-outline-variant/30 text-center"
                >
                  Đang sử dụng
                </button>
              ) : showRegister ? (
                paymentLoading ? (
                  <button
                    disabled
                    className="w-full bg-primary/60 text-on-primary font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang tải...
                  </button>
                ) : paymentUnavailable ? (
                  <button
                    disabled
                    title="Thanh toán hiện không khả dụng. Liên hệ admin."
                    className="w-full bg-surface-container-low text-on-surface-variant/70 font-bold py-2 rounded text-xs cursor-not-allowed select-none border border-outline-variant/30 text-center"
                  >
                    Không khả dụng
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.plan_id)}
                    disabled={loadingPlanId !== null}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-2 rounded text-xs transition-colors shadow-sm active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingPlanId === plan.plan_id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <span>Đăng ký ngay</span>
                    )}
                  </button>
                )
              ) : (
                <button className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-2 rounded text-xs transition-colors shadow-sm active:scale-98 cursor-pointer">
                  Liên Hệ
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
