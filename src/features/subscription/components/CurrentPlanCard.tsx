import { formatPrice } from "@/utils/formatPrice";
import { CurrentPlanWithSubscription } from "../types";

export default function CurrentPlanCard({
  currentPlan,
}: {
  currentPlan: CurrentPlanWithSubscription;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-55 shadow-sm hover:border-outline transition-all">
      {/* Decorative bg pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Gói Hiện Tại
            </h3>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Đang hoạt động
            </span>
          </div>
          <h4 className="text-3xl font-bold text-primary mt-2 tracking-tight">
            {currentPlan.plan.plan_name}
          </h4>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
            Chu kỳ thanh toán
          </p>
          <p className="text-sm font-semibold text-on-surface mt-1">
            Hàng tháng
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t border-outline-variant/60 flex justify-between items-end">
        <div>
          <p className="text-xs text-on-surface-variant font-medium">
            Ngày hết hạn tiếp theo
          </p>
          <p className="text-sm font-bold text-on-surface font-mono mt-1">
            {currentPlan.subscription.end_date}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-on-surface">
            {formatPrice(currentPlan.plan.price)}{" "}
            <span className="text-xs font-medium text-on-surface-variant">
              VNĐ/tháng
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
