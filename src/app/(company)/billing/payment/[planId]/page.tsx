import React, { Suspense } from "react";
import PaymentScreen from "@/features/payment/component/PaymentScreen";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-on-surface-variant font-medium font-body min-h-[400px]">
          Đang tải thông tin thanh toán...
        </div>
      }
    >
      <PaymentScreen />
    </Suspense>
  );
}

