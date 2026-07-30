"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, AlertTriangle, Info } from "lucide-react";
import { Plan } from "@/types/Plan";
import { BankAccount } from "@/types/BankAccount";
import { CurrentPlanWithSubscription } from "../types";
import { formatPrice } from "@/utils/formatPrice";
import {
  requestCreatePayment,
  requestGetActiveBankAccount,
} from "@/features/payment/api/payment.api";

import { useTranslation } from "@/components/providers/LanguageProvider";
import { getDurationText } from "@/utils/formatDuration";

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
  const { dict } = useTranslation();
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<Plan | null>(null);
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
          {currentPlan ? (dict.billing?.other_plans || "Các Gói Dịch Vụ Khác") : (dict.billing?.all_plans || "Các Gói Dịch Vụ")}
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
              {dict.billing?.payment_unavailable_title || "Thanh toán gói hiện không khả dụng."}
            </span>{" "}
            {dict.billing?.payment_unavailable_desc || "Hệ thống chưa có tài khoản ngân hàng nào được kích hoạt. Vui lòng liên hệ quản trị viên để được hỗ trợ."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
        {/* Info box for features */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 z-20 bg-surface-container-lowest border-2 border-primary/20 rounded-xl p-6 shadow-md">
            <h4 className="text-base font-bold text-primary mb-4">
              {dict.billing?.features_included || "Các tính năng nổi bật"}
            </h4>
            <p className="text-xs text-on-surface-variant mb-4 font-medium leading-relaxed">
              {dict.billing?.features_desc || "Hệ thống cung cấp các tính năng nổi bật bao gồm:"}
            </p>
            <ul className="space-y-3">
              {[
                {
                  title: dict.billing?.feat_dashboard || "Tổng quan hệ thống (Dashboard)",
                  desc: dict.billing?.feat_dashboard_desc || "Bảng điều khiển trực quan thống kê toàn diện dữ liệu bảo vệ, sự cố và hợp đồng theo thời gian thực.",
                },
                {
                  title: dict.billing?.feat_quote || "Quản lý Yêu cầu & Báo giá",
                  desc: dict.billing?.feat_quote_desc || "Tiếp nhận yêu cầu dịch vụ, tổ chức khảo sát hiện trường và lập báo giá điện tử gửi đến khách hàng.",
                },
                {
                  title: dict.billing?.feat_contract || "Quản lý Hợp đồng & Dịch vụ",
                  desc: dict.billing?.feat_contract_desc || "Lưu trữ, theo dõi trạng thái các hợp đồng bảo vệ và thiết lập danh mục dịch vụ an ninh của công ty.",
                },
                {
                  title: dict.billing?.feat_staff || "Quản lý Điều phối viên & Bảo vệ",
                  desc: dict.billing?.feat_staff_desc || "Quản lý hồ sơ nhân sự, lịch sử làm việc của bảo vệ và cấp quyền cho 1 Điều phối viên giám sát.",
                },
                {
                  title: dict.billing?.feat_schedule || "Lên lịch trình & Ca trực",
                  desc: dict.billing?.feat_schedule_desc || "Công cụ thông minh giúp sắp xếp, phân bổ ca trực và điều phối nhân sự bảo vệ linh hoạt đến các mục tiêu.",
                },
                {
                  title: dict.billing?.feat_attendance || "Điểm danh & Báo cáo sự cố",
                  desc: dict.billing?.feat_attendance_desc || "Tiếp nhận dữ liệu điểm danh, báo cáo tuần tra và ghi nhận sự cố phát sinh từ ứng dụng.",
                },
                {
                  title: dict.billing?.feat_chat || "Kênh giao tiếp & Phản hồi",
                  desc: dict.billing?.feat_chat_desc || "Hệ thống nhắn tin trao đổi trực tiếp (Chat) và tiếp nhận đánh giá chất lượng dịch vụ từ khách hàng.",
                }
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold group/item cursor-default">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="flex-1 leading-snug">{feature.title}</span>
                  <div className="group relative shrink-0">
                    <Info className="w-4 h-4 text-on-surface-variant/40 hover:text-primary transition-colors cursor-help" />
                    <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 sm:w-56 p-2.5 bg-[#1e293b] text-white text-[11px] font-medium rounded-lg shadow-xl z-20 text-center leading-relaxed pointer-events-none">
                      {feature.desc}
                      <div className="absolute top-full right-1 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-[#1e293b]"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Plans */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  {dict.billing?.your_plan || "Gói Của Bạn"}
                </div>
              )}

              <h4
                className={`text-base font-bold mb-2 ${isCurrent ? "text-primary mt-1" : "text-on-surface"}`}
              >
                {plan?.plan_name}
              </h4>
              <p className="text-xs text-on-surface-variant mb-5 flex-1 font-medium leading-relaxed">
                {plan?.description}
              </p>

              <div className="mb-6 flex items-baseline">
                <span
                  className={`text-2xl font-black ${isCurrent ? "text-primary" : "text-on-surface"}`}
                >
                  {formatPrice(plan?.price)}{" "}
                  <span className="text-sm text-muted-foreground font-medium">
                    {dict.billing?.currency || "VNĐ"}/{getDurationText(plan.duration_days, dict)}
                  </span>
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                <li
                  className={`flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold
                    ${isCurrent ? "text-on-surface/80" : ""}`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5
                      ${isCurrent ? "text-primary" : "text-secondary"}`}
                  />
                  <span>{dict.billing?.all_features_included || "Bao gồm tất cả tính năng nổi bật"}</span>
                </li>

                {plan.max_guards !== null && (
                  <li
                    className={`flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold
                      ${isCurrent ? "text-on-surface/80" : ""}`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5
                        ${isCurrent ? "text-primary" : "text-secondary"}`}
                    />
                    <span>{dict.billing?.max_guards?.replace("{0}", plan.max_guards.toString()) || `Tối đa ${plan.max_guards} bảo vệ`}</span>
                  </li>
                )}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="w-full bg-surface-container-low text-on-surface-variant/70 font-bold py-2 rounded text-xs cursor-default select-none border border-outline-variant/30 text-center"
                >
                  {dict.billing?.current_using || "Đang sử dụng"}
                </button>
              ) : showRegister ? (
                paymentLoading ? (
                  <button
                    disabled
                    className="w-full bg-primary/60 text-on-primary font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {dict.billing?.processing || "Đang tải..."}
                  </button>
                ) : paymentUnavailable ? (
                  <button
                    disabled
                    title="Thanh toán hiện không khả dụng. Liên hệ admin."
                    className="w-full bg-surface-container-low text-on-surface-variant/70 font-bold py-2 rounded text-xs cursor-not-allowed select-none border border-outline-variant/30 text-center"
                  >
                    {dict.billing?.unavailable || "Không khả dụng"}
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
                        <span>{dict.billing?.processing || "Đang xử lý..."}</span>
                      </>
                    ) : (
                      <span>{dict.billing?.subscribe_now || "Đăng ký ngay"}</span>
                    )}
                  </button>
                )
              ) : (
                <button 
                  onClick={() => setConfirmPlan(plan)}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-2 rounded text-xs transition-colors shadow-sm active:scale-98 cursor-pointer"
                >
                  {dict.billing?.switch_plan || "Chuyển Đổi Gói"}
                </button>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in relative border border-outline-variant">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-1">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">{dict.billing?.confirm_switch_title || "Xác nhận chuyển đổi"}</h3>
              <p 
                className="text-sm text-on-surface-variant font-medium leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: (dict.billing?.confirm_switch_desc || "Bạn đang sử dụng <strong className=\"text-primary\">{0}</strong>.<br />Bạn có chắc chắn muốn đăng ký và chuyển sang <strong className=\"text-primary\">{1}</strong> không?")
                    .replace("{0}", currentPlan?.plan?.plan_name || "")
                    .replace("{1}", confirmPlan.plan_name)
                    .replace('className="text-primary"', 'class="text-primary"')
                }}
              />
              
              <div className="flex w-full gap-3 mt-4 text-sm">
                <button
                  onClick={() => setConfirmPlan(null)}
                  className="flex-1 py-2.5 rounded-lg border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  {dict.billing?.cancel || "Hủy bỏ"}
                </button>
                <button
                  onClick={() => {
                    handleSubscribe(confirmPlan.plan_id);
                    setConfirmPlan(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors shadow-sm"
                >
                  {dict.billing?.confirm_switch_btn || "Đồng ý chuyển"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
