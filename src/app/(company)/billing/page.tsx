import React from "react";
import { Download } from "lucide-react";
import CurrentPlanCard from "@/features/subscription/components/CurrentPlanCard";
import ResourceUsage from "@/features/subscription/components/ResourceUsage";
import SubscriptionPlans from "@/features/subscription/components/SubscriptionPlans";
import TransactionHistory from "@/features/subscription/components/TransactionHistory";

export default function BillingPage() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Quản lý Gói dịch vụ &amp; Thanh toán
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Xem thông tin gói hiện tại, nâng cấp và quản lý lịch sử giao dịch.
          </p>
        </div>
        <button className="bg-secondary hover:bg-secondary-container text-on-secondary font-bold py-2 px-4 rounded text-sm transition-colors flex items-center gap-2 w-fit shadow-sm active:scale-95 duration-100">
          <Download className="w-4 h-4" />
          <span>Xuất hóa đơn</span>
        </button>
      </div>

  {/* Current Plan & Resource Usage Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <CurrentPlanCard />
    <ResourceUsage />
  </div>

      {/* Upgrade Plans List */}
      <div className="pt-4">
        <SubscriptionPlans />
      </div>

      {/* Transaction History Table */}
      <div className="pt-4">
        <TransactionHistory />
      </div>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}
