import React, { Suspense } from "react";
import PaymentScreen from "@/features/payment/component/PaymentScreen";

interface PageProps {
  params: Promise<{
    planId: string;
  }>;
}

async function PaymentPageContent({ params }: PageProps) {
  const { planId } = await params;
  return <PaymentScreen planId={planId} />;
}

export default function PaymentPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-on-surface-variant font-medium">
          Đang tải thông tin thanh toán...
        </div>
      }
    >
      <PaymentPageContent params={params} />
    </Suspense>
  );
}
