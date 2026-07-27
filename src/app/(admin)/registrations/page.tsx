import React, { Suspense } from "react";
import { RegistrationTable } from "@/features/registration";
import LoadingFallback from "@/components/ui/LoadingFallback";


export default function RegistrationsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegistrationTable />
    </Suspense>
  );
}