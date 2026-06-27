"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  X,
  AlertTriangle,
  PenLine,
} from "lucide-react";
import { CustomerContractDetailHeader } from "./CustomerContractDetailHeader";
import { CustomerCompanyInfo } from "./CustomerCompanyInfo";
import { CustomerServiceInfo } from "./CustomerServiceInfo";
import { CustomerPaymentInfo } from "./CustomerPaymentInfo";
import { CustomerContractDocument } from "./CustomerContractDocument";
import { CustomerHistoryLog } from "./CustomerHistoryLog";
import { CustomerQualityReviewModal } from "../../review/components/CustomerQualityReviewModal";
import { requestCreateReview } from "../../review/api/review.api";
import {
  requestGetCustomerContractDetail,
  requestSignContractCustomer,
  requestCompleteContractCustomer,
} from "../api/contract.api";
import { useAuthStore } from "@/store/auth.store";

// ─── Component ────────────────────────────────────────────────────────────────
interface CustomerContractDetailContainerProps {
  contractId: string;
}

export function CustomerContractDetailContainer({
  contractId,
}: CustomerContractDetailContainerProps) {
  const customerId = useAuthStore((state) => state.user_id) || "";

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
        setError("Không tìm thấy thông tin hợp đồng.");
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error("Lỗi khi tải chi tiết hợp đồng:", errorObj);
      setError(errorObj?.message || "Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchDetail();
    }
  }, [contractId, fetchDetail]);

  const handleSignCustomer = async () => {
    try {
      setIsSignModalOpen(false);
      const res = await requestSignContractCustomer(contractId, customerId);
      if (res && res.success) {
        showToast("Ký xác nhận hợp đồng thành công!");
        await fetchDetail(false);
      } else {
        showToast("Ký xác nhận hợp đồng thất bại.");
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error(errorObj);
      showToast(errorObj?.message || "Có lỗi xảy ra khi ký hợp đồng.");
    }
  };

  const handleCompleteCustomer = async () => {
    try {
      setIsCompleteModalOpen(false);
      const res = await requestCompleteContractCustomer(contractId, customerId);
      if (res && res.success) {
        showToast("Hợp đồng đã được hoàn thành thành công!");
        await fetchDetail(false);
      } else {
        showToast("Hoàn thành hợp đồng thất bại.");
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error(errorObj);
      showToast(errorObj?.message || "Có lỗi xảy ra khi hoàn thành hợp đồng.");
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
          <p className="text-secondary font-semibold animate-pulse">Đang tải chi tiết hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4 bg-red-50 p-8 rounded-2xl border border-red-100 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
          <h3 className="font-bold text-red-800 text-lg">Không thể tải dữ liệu</h3>
          <p className="text-sm text-red-600 mb-4">{error || "Hợp đồng không tồn tại hoặc bạn không có quyền truy cập."}</p>
          <Link href="/my-contracts" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm transition-colors cursor-pointer">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // --- Map history dynamically based on state ---
  const history = [];
  
  // Note: time formatting assumes we have proper ISO strings or similar
  const formatTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (contract.status === "active") {
    history.push({
      time: formatTime(contract.updated_at),
      title: "Hợp đồng chính thức có hiệu lực",
      description: "Tất cả các bên đã hoàn tất ký kết. Hợp đồng chuyển sang trạng thái đang hoạt động.",
      isLatest: true,
    });
  }

  if (contract.customer_agreed) {
    history.push({
      time: formatTime(contract.updated_at), // rough estimation
      title: "Bạn đã ký xác nhận",
      description: "Người thực hiện: Khách hàng (bạn)",
      isLatest: history.length === 0,
    });
  }

  if (contract.company_agreed) {
    history.push({
      time: formatTime(contract.updated_at), // rough estimation
      title: "Công ty đã ký duyệt",
      description: "Người thực hiện: Đại diện công ty cung cấp dịch vụ",
      isLatest: history.length === 0,
    });
  }

  if (contract.contract_file_url) {
    history.push({
      time: formatTime(contract.updated_at),
      title: "Tệp hợp đồng đã được tải lên",
      description: "Tài liệu hợp đồng PDF đã sẵn sàng để kiểm tra và ký kết",
      isLatest: history.length === 0,
    });
  }

  history.push({
    time: formatTime(contract.created_at),
    title: "Dự thảo hợp đồng được tạo",
    description: "Hệ thống ghi nhận phiên bản dự thảo đầu tiên",
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
        onSignCustomer={() => setIsSignModalOpen(true)}
        onReviewCustomer={() => setIsReviewModalOpen(true)}
        hasReviewed={contract.has_reviewed}
        canComplete={canComplete}
        onCompleteContract={() => setIsCompleteModalOpen(true)}
      />

      {/* Pending banner */}
      {isPendingAndCustomerNotSigned && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Hợp đồng đang chờ xác nhận của bạn</p>
            <p className="text-xs leading-relaxed text-amber-700">
              {contract.contract_file_url
                ? 'Vui lòng xem tài liệu hợp đồng và nhấn "Ký xác nhận" khi bạn đã đồng ý với các điều khoản.'
                : "Tài liệu hợp đồng PDF đang được chuẩn bị. Bạn sẽ có thể ký sau khi tệp được tải lên."}
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
            companyName={contract.company?.name || "Chưa cập nhật"}
            phone={contract.company?.phone || "Chưa cập nhật"}
            email={contract.company?.email || "Chưa cập nhật"}
            address={contract.company?.address || "Chưa cập nhật"}
          />

          {/* Service + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerServiceInfo
              serviceName={contract.service_name}
              quantity={contract.guards_per_slot}
              duration={contract.duration}
              location={contract.location}
              timeSlots={contract.time_slots}
              description={contract.description}
            />
            <CustomerPaymentInfo totalValue={contract.formatted_price} />
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
                  Xác nhận ký hợp đồng
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
                Bạn có chắc chắn muốn ký xác nhận hợp đồng{" "}
                <span className="font-bold text-[#0b1c30]">
                  #{contract.contract_code}
                </span>{" "}
                không?
              </p>
              <p className="text-xs text-[#b45309] bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                Lưu ý: Hành động này xác nhận bạn đồng ý với toàn bộ các điều
                khoản và điều kiện trong hợp đồng dịch vụ bảo vệ này. Hành
                động không thể hoàn tác.
              </p>
            </div>

            {/* Modal footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSignCustomer}
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
              >
                Đồng ý ký kết
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
              setContract((prev: any) => ({
                ...prev,
                has_reviewed: true,
                review_rating: data.rating,
                review_comment: data.feedback,
              }));
              showToast("Đánh giá của bạn đã được ghi nhận. Cảm ơn sự phản hồi của bạn!");
            } catch (error: any) {
              showToast(error.message || "Đã có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
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
                  Xác nhận hoàn thành hợp đồng
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
                Bạn có chắc chắn muốn xác nhận hoàn thành hợp đồng{" "}
                <span className="font-bold text-[#0b1c30]">
                  #{contract.contract_code}
                </span>{" "}
                không?
              </p>
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg leading-normal flex gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                Lưu ý: Hành động này sẽ chuyển trạng thái của hợp đồng này sang "Đã hoàn thành". Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Modal footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCompleteCustomer}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors rounded text-sm font-semibold cursor-pointer shadow-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
