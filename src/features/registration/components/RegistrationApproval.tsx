"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Download,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  ChevronLeft,
  X,
  FileWarning
} from "lucide-react";

export default function RegistrationApproval() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params?.id as string || "REG-2023-001";

  // State for Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // State for Approval Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  // Status of the registration (simulated state)
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApprove = () => {
    setStatus("approved");
    setApproveModalOpen(false);
    showToast("Phê duyệt hồ sơ đăng ký doanh nghiệp thành công!");
  };

  const handleReject = () => {
    setStatus("rejected");
    setRejectModalOpen(false);
    showToast("Đã từ chối hồ sơ đăng ký doanh nghiệp thành công!");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 relative">
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

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
        <Link href="/registrations" className="hover:text-primary transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Doanh nghiệp
        </Link>
        <ChevronRight className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
        <span className="text-on-surface-variant/70 font-normal">Đang chờ duyệt</span>
        <ChevronRight className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
        <span className="text-primary font-bold">Chi tiết phê duyệt</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-headline">
              Phê duyệt Đăng ký Doanh nghiệp
            </h2>
            {status === "approved" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                ĐÃ PHÊ DUYỆT
              </span>
            )}
            {status === "rejected" && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                <X className="w-3.5 h-3.5" />
                ĐÃ TỪ CHỐI
              </span>
            )}
            {status === "pending" && (
              <span className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#b45309] text-xs font-bold px-2.5 py-1 rounded-full border border-[#fde68a]">
                <Clock className="w-3.5 h-3.5" />
                ĐANG CHỜ DUYỆT
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Hồ sơ mã số: <span className="font-mono font-semibold">{registrationId}</span>
          </p>
        </div>

        {status === "pending" && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setRejectModalOpen(true)}
              className="flex-1 md:flex-initial px-5 py-2.5 border-2 border-[#ff0c3b] text-[#ff0c3b] hover:bg-red-50 active:scale-95 transition-all rounded text-sm font-bold tracking-wide cursor-pointer"
            >
              TỪ CHỐI HỒ SƠ
            </button>
            <button
              onClick={() => setApproveModalOpen(true)}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-[#024594] text-white hover:bg-[#023b7e] active:scale-95 transition-all rounded text-sm font-bold tracking-wide shadow-md cursor-pointer"
            >
              PHÊ DUYỆT ĐĂNG KÝ
            </button>
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl border border-[#c3c6d3] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-[#f0f4f8] border-b border-[#c3c6d3] px-5 py-3.5">
            <h3 className="text-xs font-bold text-[#0b1c30] tracking-wider uppercase">
              THÔNG TIN CHI TIẾT ĐĂNG KÝ
            </h3>
          </div>
          <div className="p-6 space-y-6 font-body">
            
            {/* Section 1: Thông tin doanh nghiệp */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#024594] uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-[#024594] rounded-full inline-block"></span>
                Thông tin doanh nghiệp
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Tên doanh nghiệp
                  </label>
                  <p className="text-sm font-bold text-[#0b1c30] mt-1">
                    Công ty TNHH Giải pháp An ninh Thăng Long
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Mô tả về công ty
                  </label>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-[#f8fafc] p-3 rounded-lg border border-slate-100 italic">
                    "Chuyên cung cấp các giải pháp an ninh tích hợp hệ thống, giám sát camera thông minh và thiết bị báo cháy tự động cho doanh nghiệp."
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Mã số thuế
                  </label>
                  <p className="text-sm font-mono font-semibold text-[#0b1c30] mt-1">
                    0102938475-001
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Địa chỉ trụ sở
                  </label>
                  <p className="text-sm text-[#0b1c30] mt-1 leading-relaxed">
                    Toà nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. HCM
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Thông tin người đại diện */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-[#024594] uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-[#024594] rounded-full inline-block"></span>
                Thông tin người đại diện
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Họ và tên
                  </label>
                  <p className="text-sm font-bold text-[#0b1c30] mt-1">
                    Nguyễn Văn An
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Giới tính
                  </label>
                  <p className="text-sm font-semibold text-[#0b1c30] mt-1">
                    Nam
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Ngày sinh
                  </label>
                  <p className="text-sm font-mono font-semibold text-[#0b1c30] mt-1">
                    18/09/1985
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <p className="text-sm font-semibold text-[#0b1c30] mt-1 font-mono">
                    0903 123 456
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Email liên hệ
                  </label>
                  <p className="text-sm font-semibold text-[#0b1c30] mt-1">
                    an.nguyen@thanglongsecurity.com.vn
                  </p>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
                    Địa chỉ liên hệ
                  </label>
                  <p className="text-sm text-[#0b1c30] mt-1 leading-relaxed">
                    123 Đường số 4, Phường Tân Hưng, Quận 7, TP. HCM
                  </p>
                </div>
              </div>
            </div>

            {/* Footer action and submission date */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-on-surface-variant self-start">
                <Calendar className="w-4 h-4 text-[#024594]" />
                <span className="text-xs">Ngày gửi hồ sơ:</span>
                <span className="text-xs font-mono font-semibold text-[#0b1c30]">14/10/2023 09:45</span>
              </div>

              <button className="self-start sm:self-auto text-xs font-bold text-[#024594] hover:text-[#023b7e] flex items-center gap-1.5 transition-colors border border-[#024594]/30 hover:border-[#024594] bg-white px-3 py-1.5 rounded shadow-sm">
                <Download className="w-3.5 h-3.5" />
                TẢI TOÀN BỘ (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REJECT MODAL (DIALOG) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ff0c3b]">
                <FileWarning className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">Từ chối hồ sơ đăng ký</h3>
              </div>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Bạn có chắc chắn muốn từ chối hồ sơ đăng ký doanh nghiệp của <span className="font-bold text-[#0b1c30]">Công ty TNHH Giải pháp An ninh Thăng Long</span> không?
              </p>
              <p className="text-xs text-[#b91c1c] bg-[#fef2f2] border border-[#fca5a5] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#ef4444] mt-0.5" />
                Lưu ý: Hành động này sẽ từ chối hồ sơ đăng ký và gửi thông báo trực tiếp đến đại diện doanh nghiệp.
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-[#ff0c3b] hover:bg-[#d80a32] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md"
              >
                Từ chối hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL (DIALOG) */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <FileCheck className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">Phê duyệt Đăng ký</h3>
              </div>
              <button onClick={() => setApproveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Bạn có chắc chắn muốn phê duyệt hồ sơ đăng ký doanh nghiệp của <span className="font-bold text-[#0b1c30]">Công ty TNHH Giải pháp An ninh Thăng Long</span> không?
              </p>
              <p className="text-xs text-[#b45309] bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                Lưu ý: Hành động này sẽ cấp quyền hoạt động chính thức cho doanh nghiệp trên hệ thống.
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md"
              >
                Đồng ý phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
