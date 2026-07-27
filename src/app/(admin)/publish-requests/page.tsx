import React, { Suspense } from "react";
import { PublishRequestTable } from "@/features/company";
import LoadingFallback from "@/components/ui/LoadingFallback";

export default function PublishRequestsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PublishRequestTable />
    </Suspense>
  );
}
