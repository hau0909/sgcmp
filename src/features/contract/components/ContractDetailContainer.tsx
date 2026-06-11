"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion, CheckCircle, X, AlertTriangle, PenTool } from "lucide-react";
import { ContractDetailHeader } from "./ContractDetailHeader";
import { ContractPartnerInfo } from "./ContractPartnerInfo";
import { ContractServiceInfo } from "./ContractServiceInfo";
import { ContractPaymentInfo } from "./ContractPaymentInfo";
import { ContractDocuments } from "./ContractDocuments";
import { ContractHistoryLog } from "./ContractHistoryLog";

import {
  requestGetContractDetail,
  requestSignContractCompany,
  requestUploadContractFile,
  requestDeleteContractFile,
} from "../api/contract.api";

interface ContractDetailContainerProps {
  contractId: string;
}

export function ContractDetailContainer({ contractId }: ContractDetailContainerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contract, setContract] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDetail = React.useCallback(async (showLoading = true) => {
    try {
      await Promise.resolve(); // Yield control to the microtask queue to avoid synchronous state updates inside useEffect
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      const res = await requestGetContractDetail(contractId);
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
      const timer = setTimeout(() => {
        fetchDetail(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [contractId, fetchDetail]);

  // Handle coordinator signing on behalf of company
  const handleSignCompany = async () => {
    try {
      setIsSignModalOpen(false);
      const res = await requestSignContractCompany(contractId);
      if (res && res.success) {
        setToastMessage("Ký duyệt hợp đồng với tư cách Công ty thành công!");
        await fetchDetail();
      } else {
        setToastMessage("Ký duyệt hợp đồng thất bại.");
      }
    } catch (err) {
      const errorObj = err as Error & { message?: string };
      console.error(errorObj);
      setToastMessage(errorObj?.message || "Có lỗi xảy ra khi ký hợp đồng.");
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
    const customerProfile = booking?.profiles;

    const phone = customerProfile?.phone_number || "Chưa cập nhật";
    const email = customerProfile?.email || "Chưa cập nhật";
    const address = customerProfile?.address || "Chưa cập nhật";
    const quantity = booking?.guards_per_slot || 1;
    
    // Format duration
    const formattedStartDate = currentContract.start_date
      ? new Date(currentContract.start_date).toLocaleDateString("vi-VN")
      : (booking?.start_date ? new Date(booking.start_date).toLocaleDateString("vi-VN") : "");
    const formattedEndDate = currentContract.end_date
      ? new Date(currentContract.end_date).toLocaleDateString("vi-VN")
      : (booking?.end_date ? new Date(booking.end_date).toLocaleDateString("vi-VN") : "");
    const duration = `${formattedStartDate} - ${formattedEndDate}`;
    
    const location = booking?.address || "Chưa cập nhật";
    const totalValue = booking?.formatted_price || "Chưa báo giá";
    const paymentMethod = "Chuyển khoản ngân hàng";
    const timeSlots = booking?.time_slots || [];
    const description = booking?.description || null;
    const contractFileUrl = currentContract.contract_file_url;

    // Generate dynamic history log based on signatures
    const historyList = [];
    
    if (currentContract.status === "active") {
      historyList.push({
        time: currentContract.updated_at ? new Date(currentContract.updated_at).toLocaleString("vi-VN") : "Vừa xong",
        title: "Hợp đồng kích hoạt",
        description: "Hợp đồng chuyển sang trạng thái Đang hoạt động sau khi hoàn tất ký kết.",
        isLatest: true,
      });
    }

    if (currentContract.company_agreed) {
      historyList.push({
        time: currentContract.updated_at ? new Date(currentContract.updated_at).toLocaleString("vi-VN") : "Vừa xong",
        title: "Công ty đã ký duyệt",
        description: "Người thực hiện: Điều phối viên (Coordinator)",
        isLatest: currentContract.status !== "active",
      });
    }

    if (currentContract.customer_agreed) {
      historyList.push({
        time: "Trước đó",
        title: "Khách hàng đã ký duyệt",
        description: `Người thực hiện: Khách hàng (${currentContract.customer_name})`,
      });
    }

    historyList.push(
      {
        time: new Date(currentContract.created_at).toLocaleString("vi-VN"),
        title: "Chờ chữ ký",
        description: "Báo giá được chấp nhận, hệ thống chuyển sang trạng thái chờ ký kết",
      },
      {
        time: new Date(currentContract.created_at).toLocaleString("vi-VN"),
        title: "Dự thảo hợp đồng được tạo",
        description: "Tài liệu hợp đồng nháp được tạo tự động bởi hệ thống",
      }
    );

    return {
      phone,
      email,
      address,
      quantity,
      duration,
      location,
      totalValue,
      paymentMethod,
      timeSlots,
      description,
      contractFileUrl,
      historyList,
    };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-sm text-on-surface-variant font-medium">Đang tải chi tiết hợp đồng...</p>
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
          Lỗi tải hợp đồng
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xs mb-6 font-body">
          {error || "Rất tiếc, chúng tôi không tìm thấy thông tin hợp đồng được yêu cầu."}
        </p>
        <Link
          href="/contracts"
          className="bg-primary hover:bg-primary/95 text-on-primary font-semibold px-4 py-2 rounded-lg text-sm transition-transform active:scale-95 duration-100 flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>
    );
  }

  const detailedData = getDetailedData(contract);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2">
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
        onSignCompany={() => setIsSignModalOpen(true)}
      />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Main Details & Documents) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Partner Info */}
          <ContractPartnerInfo
            customerName={contract.customer_name || ""}
            phone={detailedData.phone}
            email={detailedData.email}
            address={detailedData.address}
          />

          {/* Service & Payment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContractServiceInfo
              serviceName={contract.service_name || ""}
              quantity={detailedData.quantity}
              duration={detailedData.duration}
              location={detailedData.location}
              timeSlots={detailedData.timeSlots}
              description={detailedData.description}
            />

            <ContractPaymentInfo
              totalValue={detailedData.totalValue}
              paymentMethod={detailedData.paymentMethod}
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
                  setToastMessage("Tải lên tệp hợp đồng thành công!");
                  await fetchDetail();
                } else {
                  setToastMessage("Tải lên tệp hợp đồng thất bại.");
                }
              } catch (err) {
                const errorObj = err as Error & { message?: string };
                console.error(errorObj);
                setToastMessage(errorObj?.message || "Có lỗi xảy ra khi tải lên.");
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
                  setToastMessage("Đã xóa tệp hợp đồng đính kèm!");
                  await fetchDetail();
                } else {
                  setToastMessage("Xóa tệp hợp đồng thất bại.");
                }
              } catch (err) {
                const errorObj = err as Error & { message?: string };
                console.error(errorObj);
                setToastMessage(errorObj?.message || "Có lỗi xảy ra khi xóa tệp.");
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
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">Ký duyệt Hợp đồng</h3>
              </div>
              <button onClick={() => setIsSignModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 font-body">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Bạn có chắc chắn muốn đại diện Công ty ký duyệt hợp đồng <span className="font-bold text-[#0b1c30]">#{contract.contract_code}</span> không?
              </p>
              <p className="text-xs text-[#b45309] bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                Lưu ý: Hành động này thể hiện sự đồng ý ký kết chính thức của công ty đối với các điều khoản trong hợp đồng P2P này.
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSignCompany}
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
              >
                Đồng ý ký kết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

