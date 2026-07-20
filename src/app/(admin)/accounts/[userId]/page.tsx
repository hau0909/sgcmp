import React, { Suspense } from "react";
import { AccountDetail } from "@/features/account";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          Đang tải chi tiết tài khoản...
        </div>
      }
    >
      <AccountDetail userId={userId} />
    </Suspense>
  );
}
