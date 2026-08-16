"use client";

import React, { useState, useEffect } from "react";
import CompanyDetailHeader from "./CompanyDetailHeader";
import CompanyDetailAbout from "./CompanyDetailAbout";
import CompanyDetailGuardSkills from "./CompanyDetailGuardSkills";
import CompanyDetailServices from "./CompanyDetailServices";
import CompanyDetailLegalInfo from "./CompanyDetailLegalInfo";
import CompanyDetailGallery from "./CompanyDetailGallery";
import CompanyDetailReviews from "@/features/review/components/CompanyDetailReviews";
import NewBookingModal from "./NewBookingModal";
import { CustomerChatWidget } from "@/features/chat/components/CustomerChatWidget";
import { requestGetCompanyById } from "../api/company.api";
import { CompanyDetailData } from "../types";
import { Star, MessageSquare, Calendar, LogIn } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

interface CompanyDetailProps {
  id: string;
}

function CompanyDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* 1. Header Hero Skeleton */}
      <div className="relative rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/40">
        <div className="h-48 sm:h-64 bg-surface-container-high" />
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-surface-container-highest border-4 border-surface shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-7 bg-surface-container-highest rounded-lg w-2/3" />
            <div className="h-4 bg-surface-container-highest rounded-md w-1/2" />
            <div className="h-4 bg-surface-container-highest rounded-md w-1/3" />
          </div>
        </div>
      </div>

      {/* 2. Stat Line Skeleton */}
      <div className="py-4 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="space-y-1.5 w-24">
            <div className="h-6 bg-surface-container-high rounded" />
            <div className="h-3 bg-surface-container-high rounded w-16" />
          </div>
          <div className="space-y-1.5 w-28">
            <div className="h-6 bg-surface-container-high rounded" />
            <div className="h-3 bg-surface-container-high rounded w-20" />
          </div>
          <div className="space-y-1.5 w-28">
            <div className="h-6 bg-surface-container-high rounded" />
            <div className="h-3 bg-surface-container-high rounded w-20" />
          </div>
        </div>
        <div className="flex gap-3 ml-auto">
          <div className="w-36 h-10 bg-surface-container-high rounded-lg" />
          <div className="w-32 h-10 bg-surface-container-high rounded-lg" />
        </div>
      </div>

      {/* 3. About Section Skeleton */}
      <div className="py-6 border-b border-outline-variant/60 space-y-3">
        <div className="h-3 bg-surface-container-high rounded w-24" />
        <div className="h-6 bg-surface-container-high rounded w-48" />
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-surface-container-high rounded w-full" />
          <div className="h-4 bg-surface-container-high rounded w-11/12" />
          <div className="h-4 bg-surface-container-high rounded w-4/5" />
        </div>
      </div>

      {/* 4. Gallery Skeleton */}
      <div className="py-6 border-b border-outline-variant/60 space-y-3">
        <div className="h-3 bg-surface-container-high rounded w-36" />
        <div className="h-6 bg-surface-container-high rounded w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="h-36 rounded-xl bg-surface-container-high" />
          <div className="h-36 rounded-xl bg-surface-container-high" />
          <div className="h-36 rounded-xl bg-surface-container-high" />
          <div className="h-36 rounded-xl bg-surface-container-high" />
        </div>
      </div>

      {/* 5. Services Skeleton */}
      <div className="py-6 border-b border-outline-variant/60 space-y-4">
        <div className="h-3 bg-surface-container-high rounded w-20" />
        <div className="h-6 bg-surface-container-high rounded w-40" />
        <div className="space-y-4 pt-2">
          <div className="h-16 rounded-xl bg-surface-container-high" />
          <div className="h-16 rounded-xl bg-surface-container-high" />
          <div className="h-16 rounded-xl bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}

export default function CompanyDetail({ id }: CompanyDetailProps) {
  const { dict } = useTranslation();
  const { user_id } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<CompanyDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleOpenBookingModal = () => {
    if (!user_id) {
      setShowLoginModal(true);
      return;
    }
    setIsBookingModalOpen(true);
  };

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
          setError(
            err.message ||
              "Không thể tải thông tin chi tiết công ty. Vui lòng thử lại sau.",
          );
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
    return <CompanyDetailSkeleton />;
  }

  if (error || !company) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <p className="text-red-500 font-medium mb-4">
          {error || "Không tìm thấy công ty"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const t = dict.customer?.company_detail || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* 1. Brand Hero Header */}
      <CompanyDetailHeader
        name={company.name}
        logoUrl={company.logoUrl}
        bannerUrl={company.bannerUrl}
        companyId={company.id}
        address={company.address}
        createdYear={company.createdYear}
        onOpenBookingModal={handleOpenBookingModal}
      />

      {/* 2. Minimal Editorial Stat Line (Real Data + Synchronized Action Buttons) */}
      <div className="py-4 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5 sm:gap-8 flex-wrap">
          <div className="pr-5 sm:pr-8 border-r border-outline-variant/40">
            <div className="text-xl sm:text-2xl font-bold text-on-surface flex items-baseline gap-1">
              <span>
                {company.rating && company.rating > 0
                  ? company.rating.toFixed(1)
                  : "0.0"}
              </span>
              <span className="text-amber-500 text-sm">★</span>
            </div>
            <div className="text-[11.5px] text-on-surface-variant mt-0.5">
              {company.totalReviews ?? 0} {t.reviews_count || "đánh giá"}
            </div>
          </div>

          <div className="pr-5 sm:pr-8 border-r border-outline-variant/40">
            <div className="text-xl sm:text-2xl font-bold text-on-surface">
              {company.completedContracts ?? 0}
            </div>
            <div className="text-[11.5px] text-on-surface-variant mt-0.5">
              {t.completed_contracts || "hợp đồng hoàn thành"}
            </div>
          </div>

          <div>
            <div className="text-xl sm:text-2xl font-bold text-on-surface">
              {company.activeGoals ?? 0}
            </div>
            <div className="text-[11.5px] text-on-surface-variant mt-0.5">
              {t.active_goals || "mục tiêu đang bảo vệ"}
            </div>
          </div>
        </div>

        {/* Action Buttons: Chat với công ty (Left) + Đặt dịch vụ (Right) */}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="border border-primary text-primary hover:bg-primary/10 font-semibold px-4.5 py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-98"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>{t.chat_btn || "Chat với công ty"}</span>
          </button>

          <button
            onClick={handleOpenBookingModal}
            className="bg-primary text-on-primary hover:bg-primary/90 font-semibold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-98"
          >
            {t.book_btn || "Đặt dịch vụ"}
          </button>
        </div>
      </div>

      {/* 3. About Company / Brand Story */}
      <CompanyDetailAbout description={company.description} />

      {/* 4. Guard Force Notable Skills */}
      <CompanyDetailGuardSkills
        guardSkillsSummary={company.guardSkillsSummary}
        totalApprovedGuards={company.totalApprovedGuards}
      />

      {/* 5. Company Activity Photos Gallery */}
      <CompanyDetailGallery
        images={company.activityImgs}
        companyName={company.name}
      />

      {/* 5. Legal & Representative Strip */}
      <CompanyDetailLegalInfo
        companyName={company.name}
        businessLicenseNo={company.businessLicenseNo}
        address={company.address}
        phone={company.phone}
        email={company.email}
        logoUrl={company.logoUrl}
        ownerName={company.ownerName}
        ownerPhone={company.ownerPhone}
        ownerEmail={company.ownerEmail}
        ownerAvatarUrl={company.ownerAvatarUrl}
      />

      {/* 6. Services Provided */}
      <CompanyDetailServices services={company.services} />

      {/* 7. Client Testimonials & Reviews */}
      <CompanyDetailReviews
        companyId={company.id}
        completedContracts={company.completedContracts}
      />

      {/* 8. Booking Modal */}
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        companyId={company.id}
        companyName={company.name}
        services={company.services}
      />

      {/* 9. Chat Widget */}
      {isChatOpen && (
        <CustomerChatWidget
          companyId={company.id}
          companyName={company.name}
          defaultOpen={true}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* 10. Require Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-on-surface">
                {t.login_required_title || "Yêu cầu đăng nhập"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {t.login_required_desc || "Bạn cần đăng nhập tài khoản để thực hiện gửi yêu cầu đặt dịch vụ bảo vệ."}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                {t.cancel || "Hủy"}
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {t.login_now || "Đăng nhập ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
