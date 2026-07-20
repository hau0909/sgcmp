import React, { Suspense } from "react";
import { AccountTable } from "@/features/account";

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          Đang tải danh sách tài khoản...
        </div>
      }
    >
      <AccountTable />
    </Suspense>
  );
}
