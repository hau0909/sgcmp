import React, { Suspense } from "react";
import { RegistrationTable } from "@/features/registration";


export default function RegistrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          Đang tải danh sách đăng ký...
        </div>
      }
    >
      <RegistrationTable />
    </Suspense>
  );
}