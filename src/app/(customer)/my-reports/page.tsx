"use client";

import React, { Suspense } from "react";
import { CustomerReportContainer } from "@/features/report/components/CustomerReportContainer";

export default function CustomerReportsPage() {
  return (
    <Suspense fallback={null}>
      <CustomerReportContainer />
    </Suspense>
  );
}
