"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle,
  X,
  AlertTriangle,
  PenLine,
} from "lucide-react";
import { CustomerContractDetailHeader } from "./CustomerContractDetailHeader";
import { CustomerCompanyInfo } from "./CustomerCompanyInfo";
import { ContractServiceInfo } from "./ContractServiceInfo";
import { CustomerPaymentInfo } from "./CustomerPaymentInfo";
import { CustomerContractDocument } from "./CustomerContractDocument";
import { CustomerHistoryLog } from "./CustomerHistoryLog";
import { CustomerContractGuardsInfo } from "./CustomerContractGuardsInfo";
import { CustomerQualityReviewModal } from "../../review/components/CustomerQualityReviewModal";
import { ContractProgressBar } from "./ContractProgressBar";
import { requestCreateReview } from "../../review/api/review.api";
import {
  requestGetCustomerContractDetail,
  requestSignContractCustomer,
  requestCompleteContractCustomer,
} from "../api/contract.api";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { formatPrice } from "@/utils/formatPrice";

// ─── Component ────────────────────────────────────────────────────────────────
interface CustomerContractDetailContainerProps {
  contractId: string;
}

export function CustomerContractDetailContainer({
  contractId,
}: CustomerContractDetailContainerProps) {
  const customerId = useAuthStore((state) => state.user_id) || "";
  const { dict, locale } = useTranslation();
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contract, setContract] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const fetchDetail = useCallback(async (showLoading = true) => {
    try {
      await Promise.resolve();
      if (showLoading) setIsLoading(true);
      setError(null);
      const res = await requestGetCustomerContractDetail(contractId, customerId);
      if (res && res.contract) {
        setContract(res.contract);
      } else {
        setError(dict.contract.detail.error_not_found);
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error("Lỗi khi tải chi tiết hợp đồng:", errorObj);
      setError(errorObj?.message || dict.contract.detail.error_server);
    } finally {
      setIsLoading(false);
    }
  }, [contractId, customerId]);

  useEffect(() => {
    if (contractId && customerId) {
      const timer = setTimeout(() => {
        fetchDetail();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [contractId, customerId, fetchDetail]);

  const handleSignCustomer = async () => {
    try {
      setIsSignModalOpen(false);
      const res = await requestSignContractCustomer(contractId, customerId);
      if (res && res.success) {
        showToast(dict.contract.detail.sign_success);
        await fetchDetail(false);
      } else {
        showToast(dict.contract.detail.sign_error);
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error(errorObj);
      showToast(errorObj?.message || dict.contract.detail.sign_error_catch);
    }
  };

  const handleCompleteCustomer = async () => {
    try {
      setIsCompleteModalOpen(false);
      const res = await requestCompleteContractCustomer(contractId, customerId);
      if (res && res.success) {
        showToast(dict.contract.detail.complete_success);
        await fetchDetail(false);
      } else {
        showToast(dict.contract.detail.complete_error);
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error(errorObj);
      showToast(errorObj?.message || dict.contract.detail.complete_error_catch);
    }
  };

  const canComplete = React.useMemo(() => {
    if (!contract || contract.status !== "active" || !contract.end_date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(contract.end_date);
    endDate.setHours(0, 0, 0, 0);

    return endDate <= today;
  }, [contract]);

  if (isLoading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-secondary font-semibold animate-pulse">{dict.contract.detail.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4 bg-red-50 p-8 rounded-2xl border border-red-100 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
          <h3 className="font-bold text-red-800 text-lg">{dict.contract.detail.error_title}</h3>
          <p className="text-sm text-red-600 mb-4">{error || dict.contract.detail.error_desc}</p>
          <Link href="/my-contracts" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm transition-colors cursor-pointer">
            {dict.contract.detail.back_to_list}
          </Link>
        </div>
      </div>
    );
  }

  // Generate detailed parameters based on contract details from DB / booking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDetailedData = (currentContract: any) => {
    if (!currentContract) return null;
    const booking = currentContract.booking;
    const parties = currentContract.contract_parties;

    const notUpdatedText = dict.contract_detail?.not_updated || "Chưa cập nhật";
    const phone = parties?.customer_phone || notUpdatedText;
    const email = parties?.customer_email || notUpdatedText;
    const address =
      parties?.customer_address || booking?.address || notUpdatedText;
    const quantity = booking?.guards_per_slot || 1;

    // Format duration
    const formattedStartDate = currentContract.start_date
      ? new Date(currentContract.start_date).toLocaleDateString(dateLocale)
      : booking?.start_date
        ? new Date(booking.start_date).toLocaleDateString(dateLocale)
        : "";
    const formattedEndDate = currentContract.end_date
      ? new Date(currentContract.end_date).toLocaleDateString(dateLocale)
      : booking?.end_date
        ? new Date(booking.end_date).toLocaleDateString(dateLocale)
        : "";
    const duration =
      formattedStartDate && formattedEndDate
        ? `${formattedStartDate} - ${formattedEndDate}`
        : formattedStartDate || formattedEndDate || notUpdatedText;

    const location = booking?.address || notUpdatedText;
    const rawPrice =
      booking?.quoted_price ||
      booking?.total_price ||
      currentContract.total_price ||
      0;
    const quotationType =
      booking?.quotation_type || currentContract.quotation_type || "monthly";
    const totalHours = booking?.total_hours || null;

    const rawFormattedPrice =
      currentContract.formatted_price || booking?.formatted_price;
    let totalValue = "";
    if (rawFormattedPrice) {
      totalValue = rawFormattedPrice.replace(/\s*đ(\/|$)/, " VNĐ$1");
      if (quotationType === "hourly" && !totalValue.includes("nhân sự")) {
        totalValue = totalValue.replace(
          /VNĐ\/giờ|VNĐ \/ giờ/,
          "VNĐ / giờ / nhân sự",
        );
      }
    } else if (rawPrice) {
      if (quotationType === "hourly") {
        totalValue = `${formatPrice(rawPrice)} VNĐ / giờ / nhân sự`;
      } else if (quotationType === "monthly") {
        totalValue = `${formatPrice(rawPrice)} VNĐ/tháng`;
      } else {
        totalValue = `${formatPrice(rawPrice)} VNĐ`;
      }
    } else {
      totalValue = dict.contract_detail?.not_quoted || "Chưa báo giá";
    }

    const timeSlots = booking?.time_slots || [];
    const workingDays =
      booking?.day_per_week ||
      booking?.days_per_week ||
      booking?.working_days ||
      booking?.days_of_week ||
      booking?.days ||
      currentContract?.day_per_week ||
      [];
    const description = booking?.description || null;

    return {
      serviceName: currentContract.service_name || (booking as any)?.services?.name || "Dịch vụ bảo vệ",
      quantity,
      duration,
      location,
      timeSlots,
      workingDays,
      description,
      totalValue,
      quotationType,
      totalHours,
      phone,
      email,
      address,
    };
  };

  const detailedData = getDetailedData(contract);

  // --- Map history dynamically based on 4 standardized milestones ---
  const history = [];
  const parties = contract.contract_parties;

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // 4. Hợp đồng có hiệu lực / Hoàn thành
  if (contract.status === "completed") {
    history.push({
      time: formatTime(contract.updated_at),
      title: dict.contract?.detail?.history_completed_title || "Hợp đồng đã hoàn thành",
      description: dict.contract?.detail?.history_completed_desc || "Khách hàng đã xác nhận hoàn thành dịch vụ và hợp đồng được kết thúc thành công.",
      isLatest: true,
    });
  } else if (contract.status === "active") {
    history.push({
      time: formatTime(contract.updated_at),
      title: dict.contract?.detail?.history_active_title || "Hợp đồng có hiệu lực",
      description: dict.contract?.detail?.history_active_desc || "Cả hai bên đã hoàn tất ký kết, hợp đồng chính thức có hiệu lực.",
      isLatest: true,
    });
  }

  // 3. Khách hàng ký duyệt
  if (contract.customer_agreed || parties?.customer_signed_at) {
    history.push({
      time: parties?.customer_signed_at
        ? formatTime(parties.customer_signed_at)
        : formatTime(contract.updated_at),
      title: dict.contract?.detail?.history_customer_agreed_title || "Khách hàng đã ký duyệt",
      description: `${dict.contract?.detail?.history_performer_customer || "Người thực hiện: Khách hàng"} (${parties?.customer_name || dict.contract?.detail?.history_customer_default || "Khách hàng"})`,
      isLatest: history.length === 0,
    });
  }

  // 2. Công ty ký duyệt
  if (contract.company_agreed || parties?.company_signed_at) {
    history.push({
      time: parties?.company_signed_at
        ? formatTime(parties.company_signed_at)
        : formatTime(contract.updated_at),
      title: dict.contract?.detail?.history_company_agreed_title || "Công ty đã ký duyệt",
      description: `${dict.contract?.detail?.history_performer_company || "Người thực hiện: Đại diện doanh nghiệp"} (${parties?.representative_name || parties?.company_name || dict.contract?.detail?.history_performer_admin || "Quản lý doanh nghiệp"})`,
      isLatest: history.length === 0,
    });
  }

  // 1. Khởi tạo hợp đồng
  history.push({
    time: formatTime(contract.created_at || parties?.created_at),
    title: dict.contract?.detail?.history_draft_created_title || "Khởi tạo hợp đồng",
    description: dict.contract?.detail?.history_draft_created_desc || "Dự thảo hợp đồng được tạo tự động bởi hệ thống sau khi báo giá được chấp nhận.",
    isLatest: history.length === 0,
  });


  const isPendingAndCustomerNotSigned =
    contract.status === "pending_signatures" && !contract.customer_agreed;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="text-white/60 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <CustomerContractDetailHeader
        contractCode={contract.contract_code}
        status={contract.status}
        customerAgreed={contract.customer_agreed}
        companyAgreed={contract.company_agreed}
        contractFileUrl={contract.contract_file_url}
        hasGuards={!!contract.guard_assigned && contract.guard_assigned.length > 0}
        onSignCustomer={() => setIsSignModalOpen(true)}
        onReviewCustomer={() => setIsReviewModalOpen(true)}
        hasReviewed={contract.has_reviewed}
        canComplete={canComplete}
        onCompleteContract={() => setIsCompleteModalOpen(true)}
        contract={contract}
      />

      {contract.status === "active" && (
        <div className="mb-6">
          <ContractProgressBar
            startDate={contract.start_date}
            endDate={contract.end_date}
            variant="card"
          />
        </div>
      )}

      {/* Pending banner */}
      {isPendingAndCustomerNotSigned && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">{dict.contract.detail.pending_title}</p>
            <p className="text-xs leading-relaxed text-amber-700">
              {contract.contract_file_url
                ? dict.contract.detail.pending_desc_ready
                : dict.contract.detail.pending_desc_not_ready}
            </p>
          </div>
        </div>
      )}

      {/* Bento Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Company info */}
          <CustomerCompanyInfo
            contractParties={contract.contract_parties}
            companyName={contract.company_name || contract.booking?.company_name}
            phone={contract.booking?.company_phone}
            email={contract.booking?.company_email}
            address={contract.booking?.company_address}
          />

          {/* Service + Payment + Guards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ContractServiceInfo
                serviceName={contract.service_name || detailedData?.serviceName || "Dịch vụ bảo vệ"}
                quantity={detailedData?.quantity || 1}
                duration={detailedData?.duration || ""}
                location={detailedData?.location || ""}
                timeSlots={detailedData?.timeSlots || []}
                workingDays={detailedData?.workingDays || []}
                description={detailedData?.description}
              />
              <CustomerPaymentInfo
                totalValue={detailedData?.totalValue || contract.formatted_price || ""}
                quotationType={detailedData?.quotationType || contract.quotation_type}
                totalHours={detailedData?.totalHours}
              />
            </div>

            <CustomerContractGuardsInfo contractId={contractId} />
          </div>

          {/* Document (read-only) */}
          <CustomerContractDocument
            contractFileUrl={contract.contract_file_url}
            contractCode={contract.contract_code}
          />
        </div>

        {/* Right column */}
        <div className="xl:col-span-1">
          <CustomerHistoryLog history={history} />
        </div>
      </div>

      {/* Sign Confirmation Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <PenLine className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">
                  {dict.contract.detail.sign_confirm_title}
                </h3>
              </div>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-3 font-body">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {dict.contract.detail.sign_confirm_desc}{" "}
                <span className="font-bold text-[#0b1c30]">
                  #{contract.contract_code}
                </span>
                {dict.contract.detail.sign_confirm_desc_2}
              </p>
              <p className="text-xs text-[#b45309] bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                {dict.contract.detail.sign_confirm_note}
              </p>
            </div>

            {/* Modal footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer"
              >
                {dict.contract.detail.cancel}
              </button>
              <button
                onClick={handleSignCustomer}
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
              >
                {dict.contract.detail.sign_confirm_btn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <CustomerQualityReviewModal
          contractCode={contract.contract_code}
          companyName={contract.company?.name}
          startDate={contract.start_date}
          endDate={contract.end_date}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await requestCreateReview({
                contract_id: contractId,
                customer_id: contract.customer_id,
                company_id: contract.company_id,
                rating: data.rating,
                comment: data.feedback,
              });
              setIsReviewModalOpen(false);
              // Cập nhật state ngay lập tức, không cần reload
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setContract((prev: any) => ({
                ...prev,
                has_reviewed: true,
                review_rating: data.rating,
                review_comment: data.feedback,
              }));
              showToast(dict.contract.detail.review_success);
            } catch (error: unknown) {
              const err = error as Error;
              showToast(err.message || dict.contract.detail.review_error);
            }
          }}
          isReadOnly={contract.has_reviewed}
          initialRating={contract.review_rating}
          initialFeedback={contract.review_comment}
        />
      )}

      {/* Complete Confirmation Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">
                  {dict.contract.detail.complete_confirm_title}
                </h3>
              </div>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-3 font-body">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {dict.contract.detail.complete_confirm_desc}{" "}
                <span className="font-bold text-[#0b1c30]">
                  #{contract.contract_code}
                </span>
                {dict.contract.detail.complete_confirm_desc_2}
              </p>
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg leading-normal flex gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                {dict.contract.detail.complete_confirm_note}
              </p>
            </div>

            {/* Modal footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer"
              >
                {dict.contract.detail.cancel}
              </button>
              <button
                onClick={handleCompleteCustomer}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors rounded text-sm font-semibold cursor-pointer shadow-sm"
              >
                {dict.contract.detail.complete_confirm_btn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
