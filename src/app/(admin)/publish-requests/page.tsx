import React, { Suspense } from "react";
import { PublishRequestTable } from "@/features/company";

export default function PublishRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          Đang tải danh sách yêu cầu công khai...
        </div>
      }
    >
      <PublishRequestTable />
    </Suspense>
  );
}
