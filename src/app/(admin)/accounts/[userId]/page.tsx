import React, { Suspense } from "react";
import { AccountDetail } from "@/features/account";
import LoadingFallback from "@/components/ui/LoadingFallback";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AccountDetail userId={userId} />
    </Suspense>
  );
}
