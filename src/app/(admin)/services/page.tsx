import React, { Suspense } from "react";
import ServiceTable from "@/features/service/components/ServiceTable";
import LoadingFallback from "@/components/ui/LoadingFallback";

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ServiceTable />
    </Suspense>
  );
}
