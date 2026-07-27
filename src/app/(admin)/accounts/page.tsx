import React, { Suspense } from "react";
import { AccountTable } from "@/features/account";
import LoadingFallback from "@/components/ui/LoadingFallback";

export default function AccountsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AccountTable />
    </Suspense>
  );
}
