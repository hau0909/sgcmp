import React, { Suspense } from "react";
import { AdminCompanyList } from "@/features/company";
import LoadingFallback from "@/components/ui/LoadingFallback";

export const metadata = {
  title: "Quản lý doanh nghiệp - SGCMP Admin",
  description: "Danh sách và quản lý tất cả các doanh nghiệp dịch vụ bảo vệ.",
};

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminCompanyList />
    </Suspense>
  );
}
