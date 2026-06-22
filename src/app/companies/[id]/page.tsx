import React, { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CompanyDetail from "@/features/company/components/CompanyDetail";

export const metadata = {
  title: "Hồ sơ công ty - Sentinel Prime | SGCMP Enterprise Core",
  description: "Chi tiết thông tin, dịch vụ và bảng giá của Sentinel Prime trên SGCMP Marketplace.",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CompanyDetailPage({ params }: PageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Suspense fallback={<div className="h-16 w-full bg-surface-container animate-pulse" />}>
        <Header />
      </Suspense>

      <main className="flex-1 flex flex-col pt-20 pb-16">
        <div className="w-full mx-auto px-4 md:px-20 pt-4">
          <Suspense fallback={<div className="h-96 w-full bg-surface-container animate-pulse rounded-xl" />}>
            <CompanyDetailWrapper params={params} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

async function CompanyDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ✅ Truyền id xuống CompanyDetail
  return <CompanyDetail id={id} />;
}