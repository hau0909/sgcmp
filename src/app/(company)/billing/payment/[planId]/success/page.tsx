import React, { Suspense } from "react";
import PaymentSuccessScreen from "@/features/payment/component/PaymentSuccessScreen";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-on-surface-variant font-medium font-body min-h-[400px]">
          Đang tải thông tin giao dịch...
        </div>
      }
    >
      <PaymentSuccessScreen />
    </Suspense>
  );
}
