import React, { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CompareTable from "@/features/company/components/CompareTable";

export const metadata = {
  title: "So sánh công ty bảo vệ - SGCMP Marketplace",
  description: "Đối chiếu thông tin cơ bản và bảng giá của các công ty bảo vệ.",
};

export default function CompareCompaniesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <main className="flex-1 flex flex-col pt-20 pb-16">
        <div className="w-full mx-auto px-4 md:px-12 pt-6">
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto py-12 text-center text-xs text-on-surface-variant font-medium animate-pulse">
                Đang tải dữ liệu so sánh...
              </div>
            }
          >
            <CompareTable />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
