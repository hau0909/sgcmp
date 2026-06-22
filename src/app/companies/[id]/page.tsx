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

// 1. Make the main Page component synchronous (remove `async`)
export default function CompanyDetailPage({ params }: PageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Suspense fallback={<div className="h-16 w-full bg-surface-container animate-pulse" />}>
        <Header />
      </Suspense>

      <main className="flex-1 flex flex-col pt-20 pb-16">
        <div className="w-full mx-auto px-4 md:px-20 pt-4">
          {/* 2. Wrap the asynchronous content inside Suspense */}
          <Suspense fallback={<div className="h-96 w-full bg-surface-container animate-pulse rounded-xl" />}>
            {/* 3. Pass the raw Promise down to a child component */}
            <CompanyDetailWrapper params={params} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// 4. Create an async wrapper component to unwrap the params
async function CompanyDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  // Await the params inside this wrapper, which is safely inside the Suspense boundary above
  const { id } = await params;

  return <CompanyDetail />;
}