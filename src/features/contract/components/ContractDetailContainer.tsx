"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileQuestion,
  CheckCircle,
  X,
  AlertTriangle,
  PenTool,
  Building2,
} from "lucide-react";
import { ContractDetailHeader } from "./ContractDetailHeader";
import { ContractPartnerInfo } from "./ContractPartnerInfo";
import { ContractServiceInfo } from "./ContractServiceInfo";
import { ContractPaymentInfo } from "./ContractPaymentInfo";
import { ContractDocuments } from "./ContractDocuments";
import { ContractHistoryLog } from "./ContractHistoryLog";
import { ContractGuardsInfo } from "./ContractGuardsInfo";
import { ContractProgressBar } from "./ContractProgressBar";
import { useTranslation } from "@/components/providers/LanguageProvider";

import {
  requestGetContractDetail,
  requestSignContractCompany,
  requestUploadContractFile,
  requestDeleteContractFile,
} from "../api/contract.api";
import { formatPrice } from "@/utils/formatPrice";
import { useAuthStore } from "@/store/auth.store";

interface ContractDetailContainerProps {
  contractId: string;
}

export function ContractDetailContainer({
  contractId,
}: ContractDetailContainerProps) {
  const { dict, locale } = useTranslation();
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contract, setContract] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const companyId = useAuthStore((state) => state.company_id);

  const fetchDetail = React.useCallback(
    async (showLoading = true) => {
      try {
        await Promise.resolve(); // Yield control to the microtask queue to avoid synchronous state updates inside useEffect
        if (showLoading) {
          setIsLoading(true);
        }
        setError(null);
        const res = await requestGetContractDetail(contractId, companyId || undefined);
        if (res && res.contract) {
          setContract(res.contract);
        } else {
          setError(
            dict.contract_detail?.error_fetch ||
              "Không tìm thấy thông tin hợp đồng.",
          );
        }
      } catch (err) {
        const errorObj = err as Error & { message?: string };
        console.error("Lỗi khi tải chi tiết hợp đồng:", errorObj);
        setError(
          errorObj?.message ||
            dict.contract_detail?.error_fetch ||
            "Lỗi kết nối máy chủ",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [contractId, companyId, dict],
  );

  useEffect(() => {
    if (contractId) {
      const timer = setTimeout(() => {
        fetchDetail(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [contractId, fetchDetail]);

  // Handle company admin signing on behalf of company
  const handleSignCompany = async () => {
    try {
      setIsSignModalOpen(false);
      const res = await requestSignContractCompany(contractId);
      if (res && res.success) {
        setToastMessage(
          dict.contract_detail?.success_update ||
            "Ký duyệt hợp đồng với tư cách Công ty thành công!",
        );
        await fetchDetail();
      } else {
        setToastMessage(
          dict.contract_detail?.error_update || "Ký duyệt hợp đồng thất bại.",
        );
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error(errorObj);
      setToastMessage(
        errorObj?.message ||
          dict.contract_detail?.error_sign ||
          "Có lỗi xảy ra khi ký hợp đồng.",
      );
    } finally {
      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    }
  };

  // Generate detailed parameters based on contract details from DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDetailedData = (currentContract: any) => {
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
    const duration = `${formattedStartDate} - ${formattedEndDate}`;

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
    const paymentMethod =
      dict.contract_detail?.bank_transfer || "Chuyển khoản ngân hàng";
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
    const contractFileUrl = currentContract.contract_file_url;

    // Chuẩn hóa timeline lịch sử hợp đồng theo 4 mốc rõ ràng:
    // 4. Hợp đồng có hiệu lực / Hoàn thành
    // 3. Khách hàng ký duyệt
    // 2. Công ty ký duyệt
    // 1. Khởi tạo hợp đồng
    const historyList = [];

    // Mốc 4: Có hiệu lực hoặc Hoàn thành
    if (currentContract.status === "completed") {
      historyList.push({
        time: currentContract.updated_at
          ? new Date(currentContract.updated_at).toLocaleString(dateLocale)
          : dict.contract_detail?.just_now || "Vừa xong",
        title: dict.contract_detail?.history_completed_title || "Hợp đồng đã hoàn thành",
        description:
          dict.contract_detail?.history_completed_desc ||
          "Khách hàng đã xác nhận hoàn thành dịch vụ và hợp đồng được kết thúc thành công.",
        isLatest: true,
      });
    } else if (currentContract.status === "active") {
      historyList.push({
        time: currentContract.updated_at
          ? new Date(currentContract.updated_at).toLocaleString(dateLocale)
          : dict.contract_detail?.just_now || "Vừa xong",
        title:
          dict.contract_detail?.history_active_title || "Hợp đồng có hiệu lực",
        description:
          dict.contract_detail?.history_active_desc ||
          "Cả hai bên đã hoàn tất ký kết, hợp đồng chính thức có hiệu lực.",
        isLatest: true,
      });
    }

    // Mốc 3: Khách hàng ký
    if (currentContract.customer_agreed || parties?.customer_signed_at) {
      historyList.push({
        time: parties?.customer_signed_at
          ? new Date(parties.customer_signed_at).toLocaleString(dateLocale)
          : dict.contract_detail?.history_earlier || "Đã ký duyệt",
        title:
          dict.contract_detail?.history_customer_signed_title ||
          "Khách hàng đã ký duyệt",
        description: `${dict.contract_detail?.history_performer_customer || "Người thực hiện: Khách hàng"} (${parties?.customer_name || dict.contract_detail?.history_customer_default || "Khách hàng"})`,
      });
    }

    // Mốc 2: Công ty ký
    if (currentContract.company_agreed || parties?.company_signed_at) {
      historyList.push({
        time: parties?.company_signed_at
          ? new Date(parties.company_signed_at).toLocaleString(dateLocale)
          : currentContract.updated_at
            ? new Date(currentContract.updated_at).toLocaleString(dateLocale)
            : dict.contract_detail?.just_now || "Vừa xong",
        title:
          dict.contract_detail?.history_company_signed_title ||
          "Công ty đã ký duyệt",
        description: `${dict.contract_detail?.history_performer_company || "Người thực hiện: Đại diện doanh nghiệp"} (${parties?.representative_name || parties?.company_name || dict.contract_detail?.history_performer_admin || "Quản lý doanh nghiệp"})`,
      });
    }

    // Mốc 1: Khởi tạo hợp đồng
    historyList.push({
      time: currentContract.created_at
        ? new Date(currentContract.created_at).toLocaleString(dateLocale)
        : parties?.created_at
          ? new Date(parties.created_at).toLocaleString(dateLocale)
          : "",
      title: dict.contract_detail?.history_created_title || "Khởi tạo hợp đồng",
      description:
        dict.contract_detail?.history_created_desc ||
        "Dự thảo hợp đồng được tạo tự động bởi hệ thống sau khi báo giá được chấp nhận.",
    });

    return {
      phone,
      email,
      address,
      quantity,
      duration,
      location,
      totalValue,
      quotationType,
      totalHours,
      paymentMethod,
      timeSlots,
      workingDays,
      description,
      contractFileUrl,
      historyList,
      clientCompanyName:
        parties?.customer_company_name || booking?.company_name || null,
      companyScope:
        parties?.customer_company_scope || booking?.company_scope || null,
      companyPosition:
        parties?.customer_position || booking?.company_position || null,
    };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-sm text-on-surface-variant font-medium">
          {dict.contract_detail?.loading || "Đang tải chi tiết hợp đồng..."}
        </p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/40">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
          {dict.contract_detail?.error_load_title || "Lỗi tải hợp đồng"}
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xs mb-6 font-body">
          {error ||
            dict.contract_detail?.error_load_desc ||
            "Rất tiếc, chúng tôi không tìm thấy thông tin hợp đồng được yêu cầu."}
        </p>
        <Link
          href="/contracts"
          className="bg-primary hover:bg-primary/95 text-on-primary font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 duration-100 flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {dict.contract_detail?.back_to_list || "Quay lại danh sách"}
          </span>
        </Link>
      </div>
    );
  }

  const detailedData = getDetailedData(contract);

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contract Page Header */}
      <ContractDetailHeader
        contractCode={contract.contract_code || ""}
        status={contract.status}
        customerAgreed={contract.customer_agreed}
        companyAgreed={contract.company_agreed}
        hasContractFile={!!detailedData.contractFileUrl}
        hasGuards={
          !!contract.guard_assigned && contract.guard_assigned.length > 0
        }
        onSignCompany={() => setIsSignModalOpen(true)}
        contract={contract}
        onContractUpdated={() => fetchDetail(false)}
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

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Details & Documents) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Partner Info (Bên A & Bên B) */}
          <ContractPartnerInfo
            customerName={contract.contract_parties?.customer_name || ""}
            phone={detailedData.phone}
            email={detailedData.email}
            address={detailedData.address}
            deploymentAddress={detailedData.location}
            companyName={detailedData.clientCompanyName}
            companyScope={detailedData.companyScope}
            companyPosition={detailedData.companyPosition}
            contractParties={contract.contract_parties}
          />

          {/* Service & Payment & Guards Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ContractServiceInfo
                serviceName={contract.service_name || ""}
                quantity={detailedData.quantity}
                duration={detailedData.duration}
                location={detailedData.location}
                timeSlots={detailedData.timeSlots}
                workingDays={detailedData.workingDays}
                description={detailedData.description}
              />

              <ContractPaymentInfo
                totalValue={detailedData.totalValue}
                quotationType={detailedData.quotationType}
                totalHours={detailedData.totalHours}
              />
            </div>

            <ContractGuardsInfo
              contractId={contractId}
              customerAgreed={contract.customer_agreed}
              onGuardsUpdated={(newGuardIds) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setContract((prev: any) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    guard_assigned: newGuardIds,
                  };
                });
              }}
            />
          </div>

          {/* Contract Documents */}
          <ContractDocuments
            contractFileUrl={detailedData.contractFileUrl}
            contractCode={contract.contract_code || ""}
            isReadOnly={contract.customer_agreed}
            onUpload={async (file) => {
              try {
                const res = await requestUploadContractFile(contractId, file);
                if (res && res.success) {
                  setToastMessage(
                    dict.contract_detail?.upload_success ||
                      "Tải lên tệp hợp đồng thành công!",
                  );
                  await fetchDetail();
                } else {
                  setToastMessage(
                    dict.contract_detail?.upload_fail ||
                      "Tải lên tệp hợp đồng thất bại.",
                  );
                }
              } catch (err) {
                const errorObj = err as Error & { message?: string };
                console.error(errorObj);
                setToastMessage(
                  errorObj?.message ||
                    dict.contract_detail?.error_upload ||
                    "Có lỗi xảy ra khi tải lên.",
                );
              } finally {
                setTimeout(() => {
                  setToastMessage(null);
                }, 4000);
              }
            }}
            onDeleteFile={async () => {
              try {
                const res = await requestDeleteContractFile(contractId);
                if (res && res.success) {
                  setToastMessage(
                    dict.contract_detail?.delete_success ||
                      "Đã xóa tệp hợp đồng đính kèm!",
                  );
                  await fetchDetail();
                } else {
                  setToastMessage(
                    dict.contract_detail?.delete_fail ||
                      "Xóa tệp hợp đồng thất bại.",
                  );
                }
              } catch (err) {
                const errorObj = err as Error & { message?: string };
                console.error(errorObj);
                setToastMessage(
                  errorObj?.message ||
                    dict.contract_detail?.error_delete ||
                    "Có lỗi xảy ra khi xóa tệp.",
                );
              } finally {
                setTimeout(() => {
                  setToastMessage(null);
                }, 4000);
              }
            }}
          />
        </div>

        {/* Right Column (Change History Log) */}
        <div className="xl:col-span-1">
          <ContractHistoryLog history={detailedData.historyList} />
        </div>
      </div>

      {/* SIGN CONFIRMATION MODAL */}
      {isSignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <PenTool className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">
                  {dict.contract_detail?.confirm_sign_title ||
                    "Ký duyệt Hợp đồng"}
                </h3>
              </div>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 font-body">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {dict.contract_detail?.confirm_sign_desc ||
                  "Bạn có chắc chắn muốn đại diện Công ty ký duyệt hợp đồng này?"}
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer"
              >
                {dict.contract_detail?.cancel || "Hủy bỏ"}
              </button>
              <button
                onClick={handleSignCompany}
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
              >
                {dict.contract_detail?.confirm_sign || "Đồng ý ký kết"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
