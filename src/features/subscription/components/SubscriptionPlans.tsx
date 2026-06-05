import { CheckCircle2 } from "lucide-react";
import { Plan } from "@/types/Plan";
import { CurrentPlanWithSubscription } from "../types";
import { formatPrice } from "@/utils/formatPrice";

export default function SubscriptionPlans({
  plans,
  currentPlan,
}: {
  plans: Plan[];
  currentPlan: CurrentPlanWithSubscription;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-on-surface tracking-tight">
        Các Gói Dịch Vụ Khác
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan: Plan) => {
          return (
            <div
              key={plan.plan_id}
              className={`bg-surface-container-lowest border rounded-xl p-6 flex flex-col transition-all relative shadow-sm
                ${
                  plan?.plan_id === currentPlan.plan?.plan_id
                    ? "border-primary border-2 -translate-y-1 shadow-md"
                    : "border-outline-variant hover:border-outline"
                }`}
            >
              {plan?.plan_id === currentPlan.plan.plan_id && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Gói Của Bạn
                </div>
              )}

              <h4
                className={`text-base font-bold mb-2 ${plan?.plan_id === currentPlan.plan.plan_id ? "text-primary mt-1" : "text-on-surface"}`}
              >
                {plan?.plan_name}
              </h4>
              <p className="text-xs text-on-surface-variant mb-5 min-h-8 font-medium leading-relaxed">
                {plan?.description}
              </p>

              <div className="mb-6 flex items-baseline">
                <span
                  className={`text-2xl font-black ${plan?.plan_id === currentPlan.plan.plan_id ? "text-primary" : "text-on-surface"}`}
                >
                  {formatPrice(plan?.price)}{" "}
                  <span className="text-sm text-muted-foreground font-medium">
                    VND/Tháng
                  </span>
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan?.features?.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold
                      ${plan?.plan_id === currentPlan.plan.plan_id ? "text-on-surface/80" : ""}`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5
                        ${plan?.plan_id === currentPlan.plan.plan_id ? "text-primary" : "text-secondary"}`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan?.plan_id === currentPlan.plan.plan_id ? (
                <button
                  disabled
                  className="w-full bg-surface-container-low text-on-surface-variant/70 font-bold py-2 rounded text-xs cursor-default select-none border border-outline-variant/30 text-center"
                >
                  Đang sử dụng
                </button>
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
