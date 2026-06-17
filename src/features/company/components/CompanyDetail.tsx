"use client";

import React, { useState, useEffect } from "react";

// Import our sub-components
import CompanyDetailHeader from "./CompanyDetailHeader";
import CompanyDetailAbout from "./CompanyDetailAbout";
import CompanyDetailDirector from "./CompanyDetailDirector";
import CompanyDetailLegal from "./CompanyDetailLegal";
import CompanyDetailReviews from "./CompanyDetailReviews";
import CompanyDetailSidebar from "./CompanyDetailSidebar";

// Exact Mock Data matching the UI mockup (Sentinel Prime)
const mockCompany = {
  name: "Sentinel Prime",
  logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi-fWj3V8vDHHkdVZgJ5h2XiIQsXj8oH2DDV0pztynXpzPdJSMWTvLAS1yRRl2sCq2xY47DOjJGTwAdaXS6A_nqw-CqBLMWSI9A-S7tjq-2ba_60jI_YnnJp5VPyxff3ID3J866d6gZn4Bt_o4ejIXkHdjDOebBguHo5tfGVd-11OW2R26RpWELpf-Bosf3cORimCl_Bx--s0K6XtzFAcc1zRhP6iIYnzkEBNTNUufXLBYu52zTnFlABd6iueLPoStYDtAqFJKNt6t",
  description: "Sentinel Prime là nhà cung cấp dịch vụ bảo vệ tài sản giá trị cao hàng đầu tại Việt Nam với hơn 15 năm kinh nghiệm. Chúng tôi chuyên cung cấp các giải pháp an ninh toàn diện cho các tập đoàn đa quốc gia, sự kiện quy mô lớn và các cơ sở trọng yếu. Đội ngũ của chúng tôi bao gồm các cựu quân nhân và chuyên gia an ninh được đào tạo bài bản theo tiêu chuẩn quốc tế, đảm bảo sự an toàn tuyệt đối cho khách hàng trong mọi tình huống.",
  businessLicenseNo: "0312456789",
  securityLicenseNo: "AN-88/2010",
  insuranceLevel: "50 Tỷ VND",
  location: "Tầng 45, Tòa nhà Landmark 81, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh, Việt Nam",
  phone: "+84 28 3888 9999",
  email: "contact@sentinelprime.vn",
  website: "www.sentinelprime.vn",
  guardCount: 1000,
  provinceCount: 50,
};

interface CompanyDetailProps {
  id: string;
}

export default function CompanyDetail({ id }: CompanyDetailProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Premium loading transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full">
            <div className="w-18 h-18 bg-surface-container rounded-xl border border-outline-variant" />
            <div className="space-y-2.5 flex-1">
              <div className="h-6 bg-surface-container rounded w-1/3" />
              <div className="h-3.5 bg-surface-container rounded w-1/4" />
            </div>
          </div>
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="h-8.5 bg-surface-container rounded w-24" />
            <div className="h-8.5 bg-surface-container rounded w-24" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-2/3 space-y-5">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 h-36" />
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 h-40" />
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 h-44" />
          </div>
          <div className="w-full lg:w-1/3 space-y-5">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 h-48" />
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 h-44" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Section with cover banner */}
      <CompanyDetailHeader
        name={mockCompany.name}
        logoUrl={mockCompany.logoUrl}
      />

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column (2/3) */}
        <div className="w-full lg:w-2/3 space-y-5">
          {/* About us */}
          <CompanyDetailAbout description={mockCompany.description} />

          {/* Leadership & CEO Profile */}
          <CompanyDetailDirector />

          {/* Legal credentials */}
          <CompanyDetailLegal
            businessLicenseNo={mockCompany.businessLicenseNo}
            securityLicenseNo={mockCompany.securityLicenseNo}
            insuranceLevel={mockCompany.insuranceLevel}
          />

          {/* Customer Reviews & Testimonials */}
          <CompanyDetailReviews />
        </div>

        {/* Right Column (1/3) */}
        <CompanyDetailSidebar
          location={mockCompany.location}
          phone={mockCompany.phone}
          email={mockCompany.email}
          website={mockCompany.website}
          guardCount={mockCompany.guardCount}
          provinceCount={mockCompany.provinceCount}
        />
      </div>
    </div>
  );
}
