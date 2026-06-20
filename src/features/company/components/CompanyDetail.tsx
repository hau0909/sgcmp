"use client";

import React, { useState, useEffect } from "react";

import CompanyDetailHeader from "./CompanyDetailHeader";
import CompanyDetailAbout from "./CompanyDetailAbout";
import CompanyDetailServices from "./CompanyDetailServices";
import CompanyDetailReviews from "@/features/review/components/CompanyDetailReviews";
import CompanyDetailSidebar from "./CompanyDetailSidebar";
import { requestGetCompanyById } from "../api/company.api";
import { CompanyDetailData } from "../types";

interface CompanyDetailProps {
  id: string;
}

export default function CompanyDetail({ id }: CompanyDetailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const data = await requestGetCompanyById(id);
        if (isMounted) {
          setCompany(data);
          setError(null);
        }
      } catch (err: any) {
        console.error("Lỗi khi tải thông tin công ty:", err);
        if (isMounted) {
          setError(err.message || "Không thể tải thông tin chi tiết công ty. Vui lòng thử lại sau.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchCompany();
    return () => {
      isMounted = false;
    };
  }, [id]);

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer active:scale-98"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center space-y-4">
        <p className="text-on-surface-variant font-medium">Không tìm thấy thông tin công ty này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header Section with cover banner */}
      <CompanyDetailHeader
        name={company.name}
        logoUrl={company.logoUrl}
        bannerUrl={company.bannerUrl}
      />

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column (2/3) */}
        <div className="w-full lg:w-2/3 space-y-5">
          {/* About us */}
          <CompanyDetailAbout description={company.description} />
        </div>

        {/* Right Column (1/3) */}
        <CompanyDetailSidebar
          location={company.address}
          phone={company.phone}
          email={company.email}
        />
      </div>

      {/* Main Services Table */}
      <CompanyDetailServices services={company.services} />

      {/* Customer Reviews Full Width */}
      <CompanyDetailReviews />
    </div>
  );
}
