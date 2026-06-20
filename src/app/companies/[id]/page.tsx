import React from "react";
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

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Synchronized Application Header */}
      <Header />

      {/* Main Content Layout with mx-20 styled padding on desktop */}
      <main className="flex-1 flex flex-col pt-20 pb-16">
        <div className="w-full mx-auto px-4 md:px-20 pt-8">
          <CompanyDetail id={id} />
        </div>
      </main>

      {/* Synchronized Application Footer */}
      <Footer />
    </div>
  );
}
