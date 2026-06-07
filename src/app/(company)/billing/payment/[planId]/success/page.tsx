import React, { Suspense } from "react";
import PaymentSuccessScreen from "@/features/payment/component/PaymentSuccessScreen";

interface PageProps {
  params: Promise<{
    planId: string;
  }>;
}

async function PaymentSuccessContent({ params }: PageProps) {
  const { planId } = await params;
  return <PaymentSuccessScreen planId={planId} />;
}

export default function PaymentSuccessPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-on-surface-variant font-medium">
          Đang tải thông tin giao dịch...
        </div>
      }
    >
      <PaymentSuccessContent params={params} />
    </Suspense>
  );
}
