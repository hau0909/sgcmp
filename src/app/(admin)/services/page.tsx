import React, { Suspense } from "react";
import ServiceTable from "@/features/service/components/ServiceTable";

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          Đang tải danh sách dịch vụ...
        </div>
      }
    >
      <ServiceTable />
    </Suspense>
  );
}
