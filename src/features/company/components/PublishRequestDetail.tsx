"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  requestGetCompanyPublishRequestById,
  requestUpdateCompanyPublishRequestStatus,
} from "../api/company.api";
import { PublishRequestDetailData } from "../types";
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Download,
  ExternalLink,
  Phone,
  Mail,
  X,
  Eye,
  User,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function PublishRequestDetail() {
  const { dict, locale } = useTranslation();
  const params = useParams();
  const requestId = params?.id as string;

  // Local state for UI preview
  const [request, setRequest] = useState<PublishRequestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State for Image Lightbox Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [allImagesModalOpen, setAllImagesModalOpen] = useState(false);

  // State for PDF Lightbox Preview
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

  // State for Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // State for Approval Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  // Processing state
  const [actionLoading, setActionLoading] = useState(false);

  const STATUS_CONFIG: Record<
    string,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = React.useMemo(() => ({
    pending: {
      label: dict.admin_publish_requests.status_pending || "CHỜ DUYỆT",
      bg: "bg-[#fef3c7] border-[#fde68a]",
      text: "text-[#b45309]",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    approved: {
      label: dict.admin_publish_requests.status_approved || "ĐÃ PHÊ DUYỆT",
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    rejected: {
      label: dict.admin_publish_requests.status_rejected || "ĐÃ TỪ CHỐI",
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  }), [dict]);

  useEffect(() => {
    if (!requestId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await requestGetCompanyPublishRequestById(requestId);
        if (res.success && res.data) {
          setRequest(res.data);
        } else {
          setError(dict.admin_publish_requests.error_load_detail);
        }
      } catch (err) {
        console.error("Lỗi khi fetch chi tiết yêu cầu:", err);
        const errMsg = err instanceof Error ? err.message : dict.admin_publish_requests.error_load_detail;
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [requestId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadFile = async (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    try {
      let extension = "pdf";
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
        if (lastPart.includes('.')) {
          extension = lastPart.split('.').pop() || "pdf";
        }
      } catch (err) {
        console.error("Lỗi khi phân tích định dạng file:", err);
      }
      
      const filename = `giay-phep-kinh-doanh-${request?.company?.registration_code || "license"}.${extension}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(dict.admin_registrations.file_load_error);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("CORS/network block, fallback sang mở tab mới:", err);
      window.open(url, "_blank");
    }
  };

  const handleApprove = async () => {
    if (!requestId) return;
    try {
      setActionLoading(true);
      const res = await requestUpdateCompanyPublishRequestStatus(requestId, "APPROVED");
      if (res.success) {
        if (request) {
          setRequest({
            ...request,
            status: "approved",
          });
        }
        showToast(dict.admin_publish_requests.approve_success);
      } else {
        showToast(res.message || dict.admin_publish_requests.approve_error);
      }
      setApproveModalOpen(false);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : dict.admin_publish_requests.approve_error;
      showToast(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!requestId) return;
    if (!rejectReason.trim()) {
      showToast(dict.admin_publish_requests.reject_reason_required);
      return;
    }
    try {
      setActionLoading(true);
      const res = await requestUpdateCompanyPublishRequestStatus(requestId, "REJECTED", rejectReason);
      if (res.success) {
        if (request) {
          setRequest({
            ...request,
            status: "rejected",
            reject_reason: rejectReason,
          });
        }
        showToast(dict.admin_publish_requests.reject_success);
      } else {
        showToast(res.message || dict.admin_publish_requests.reject_error);
      }
      setRejectModalOpen(false);
      setRejectReason("");
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : dict.admin_publish_requests.reject_error;
      showToast(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024594]"></div>
        <p className="text-sm text-slate-500 font-medium">{dict.admin_publish_requests.loading_detail}</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">{dict.admin_publish_requests.error_load_detail}</h3>
          <p className="text-sm text-slate-600 mb-4">{error || dict.admin_publish_requests.error_not_found}</p>
          <Link
            href="/publish-requests"
            className="inline-flex items-center gap-2 bg-[#024594] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#013570] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> {dict.admin_publish_requests.back_to_list}
          </Link>
        </div>
      </div>
    );
  }

  const statusKey = (request.status || "").toLowerCase();
  const statusCfg = STATUS_CONFIG[statusKey] ?? {
    label: request.status.toUpperCase(),
    bg: "bg-gray-100 border-gray-300",
    text: "text-gray-700",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 relative font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumbs & Header Bar Group */}
      <div className="space-y-1.5">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
          <Link
            href="/publish-requests"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {dict.admin_publish_requests.title_list}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
          <span className="text-primary font-bold">{dict.admin_publish_requests.title_detail}</span>
        </nav>

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 border-b border-outline-variant pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-[#0b1c30] tracking-tight font-headline">
                {request.company.company_name}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${statusCfg.bg} ${statusCfg.text}`}
              >
                {statusCfg.icon}
                {statusCfg.label}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {locale === 'vi' ? 'Ngày gửi:' : 'Requested at:'}{" "}
              <span className="font-mono font-semibold text-[#0b1c30]">
                {new Date(request.requested_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
              </span>
            </p>
          </div>
          {statusKey === "pending" && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setRejectModalOpen(true)}
                className="flex-1 md:flex-initial px-3 py-1.5 border border-[#ff0c3b] text-[#ff0c3b] hover:bg-red-50 active:scale-95 transition-all rounded-lg text-xs font-bold cursor-pointer"
              >
                {dict.admin_publish_requests.reject_action}
              </button>
              <button
                onClick={() => setApproveModalOpen(true)}
                className="flex-1 md:flex-initial px-3 py-1.5 bg-[#024594] text-white hover:bg-[#023b7e] active:scale-95 transition-all rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                {dict.admin_publish_requests.approve_action}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason Alert Block */}
      {statusKey === "rejected" && request.reject_reason && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-red-900">{dict.admin_publish_requests.reject_reason_title}</h4>
            <p className="text-xs text-red-700 font-medium whitespace-pre-line">&ldquo;{request.reject_reason}&rdquo;</p>
          </div>
        </div>
      )}

      {/* ── CARD 1: NGƯỜI GỬI YÊU CẦU ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#c3c6d3] p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Column: Requester Identity & Contacts */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#024594] shrink-0 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-black uppercase tracking-wider block">{locale === 'vi' ? 'Người gửi yêu cầu' : 'Requester'}</span>
              <h4 className="text-xs font-bold text-slate-800">
                {request.requested_by?.full_name || dict.admin_publish_requests.not_updated}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{request.requested_by?.phone || dict.admin_publish_requests.not_updated}</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-200 hidden sm:inline-block"></span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{request.requested_by?.email || dict.admin_publish_requests.not_updated}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Requester Notes (Compact Box) */}
          <div className="md:w-2/5 shrink-0 bg-slate-50 border border-slate-150 p-3 rounded-xl flex flex-col justify-center">
            <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-0.5">{locale === 'vi' ? 'Ghi chú kèm theo' : 'Requester note'}</span>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {request.note ? `"${request.note}"` : (locale === 'vi' ? 'Không có ghi chú thêm cho yêu cầu này.' : 'No additional note for this request.')}
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD 2: THÔNG TIN DOANH NGHIỆP ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#c3c6d3] p-5 shadow-sm hover:shadow-md transition-shadow space-y-5">
        <h3 className="text-base font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-3">
          <Building2 className="w-5.5 h-5.5 text-[#024594]" /> {dict.admin_publish_requests.section_company_info}
        </h3>

        {/* 1. Logo & Banner Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4.5 items-center">
          {/* Logo container */}
          <div className="md:col-span-1 flex flex-col items-center justify-center p-2">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider mb-2 self-start flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> {locale === 'vi' ? 'Logo công ty' : 'Company logo'}
            </span>
            {request.company.logo_url ? (
              <div
                onClick={() => setPreviewImage(request.company.logo_url!)}
                className="relative group cursor-pointer rounded-2xl overflow-hidden border border-slate-150 shadow-xs hover:shadow transition-all"
              >
                <img
                  src={request.company.logo_url}
                  alt="Company Logo"
                  className="w-32 h-32 object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-bold text-2xl border border-slate-200 shadow-inner">
                {request.company.company_name.substring(0, 2)}
              </div>
            )}
          </div>

          {/* Banner container */}
          <div className="md:col-span-3 h-36 relative overflow-hidden rounded-2xl border border-slate-150 shadow-xs hover:shadow transition-all">
            <span className="absolute top-3 left-3 z-10 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/50 shadow-xs">
              <ImageIcon className="w-3.5 h-3.5 text-[#024594]" /> {locale === 'vi' ? 'Banner quảng bá' : 'Promotional banner'}
            </span>
            {request.company.banner_url ? (
              <div
                onClick={() => setPreviewImage(request.company.banner_url!)}
                className="absolute inset-0 w-full h-full cursor-pointer group"
              >
                <img
                  src={request.company.banner_url}
                  alt="Company Banner"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-300">
                  <span className="bg-slate-900/85 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                    <Eye className="w-4 h-4" /> {locale === 'vi' ? 'Xem banner đầy đủ' : 'View full banner'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-medium">
                {locale === 'vi' ? 'Chưa cập nhật ảnh Banner' : 'No banner image uploaded'}
              </div>
            )}
          </div>
        </div>

        {/* 2. Giới thiệu công ty */}
        <div className="space-y-2 pt-2">
          <label className="text-[11px] font-bold text-black uppercase tracking-wider block">
            {dict.admin_publish_requests.company_desc}
          </label>
          <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/60 p-4 rounded-2xl border border-slate-150/70 shadow-2xs">
            {request.company.description || (locale === 'vi' ? 'Chưa có thông tin giới thiệu.' : 'No company introduction provided.')}
          </p>
        </div>

        {/* 3. Middle split (Details left, Business License right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch pt-1">
          {/* Details Column */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-[#024594] uppercase tracking-wider mb-2 flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <Building2 className="w-4.5 h-4.5 text-[#024594]" /> {locale === 'vi' ? 'Chi tiết thông tin' : 'Detailed information'}
            </h4>
            <div className="flex-1 space-y-3 text-xs py-2 flex flex-col justify-center">
              <div className="flex justify-between items-start py-1">
                <span className="text-black font-semibold">{locale === 'vi' ? 'Tên chính thức:' : 'Official name:'}</span>
                <span className="font-bold text-slate-800 text-right max-w-[280px]">
                  {request.company.company_name}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-black font-semibold">{locale === 'vi' ? 'Mã hồ sơ xét duyệt:' : 'Review code:'}</span>
                <span className="font-mono font-bold text-[#024594]">
                  {request.company.registration_code}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-black font-semibold">{locale === 'vi' ? 'Mã số thuế:' : 'Tax code:'}</span>
                <span className="font-mono font-semibold text-slate-800">
                  {request.company.business_license_no}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-black font-semibold">{locale === 'vi' ? 'Số điện thoại:' : 'Phone number:'}</span>
                <span className="font-mono font-semibold text-slate-800">
                  {request.company.phone || dict.admin_publish_requests.not_updated}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-black font-semibold">{locale === 'vi' ? 'Email liên hệ:' : 'Contact email:'}</span>
                <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                  {request.company.email || dict.admin_publish_requests.not_updated}
                </span>
              </div>

              <div className="flex justify-between items-start py-1">
                <span className="text-black font-semibold shrink-0">{locale === 'vi' ? 'Địa chỉ trụ sở:' : 'Headquarters:'}</span>
                <span className="text-slate-800 font-medium text-right max-w-[280px] leading-snug">
                  {request.company.address || dict.admin_publish_requests.not_updated}
                </span>
              </div>
            </div>
          </div>

          {/* Business License Column */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
              <h4 className="text-xs font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#024594]" /> {locale === 'vi' ? 'Giấy phép kinh doanh' : 'Business license'}
              </h4>
              {request.company.license_file_url && (
                <a
                  href={request.company.license_file_url}
                  onClick={(e) => handleDownloadFile(e, request.company.license_file_url!)}
                  className="text-xs font-bold text-[#024594] hover:text-[#023b7e] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> {locale === 'vi' ? 'Tải về' : 'Download'}
                </a>
              )}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px] py-2 group">
              {request.company.license_file_url ? (
                request.company.license_file_url.toLowerCase().endsWith(".pdf") ||
                  request.company.license_file_url.includes("pdf") ? (
                  <div className="w-[200px] h-[260px] rounded-xl border border-slate-200 overflow-hidden relative group bg-white shadow-xs mx-auto">
                    <iframe
                      src={`${request.company.license_file_url}#toolbar=0&navpanes=0&view=Fit`}
                      className="w-full h-full border-none pointer-events-none overflow-hidden scale-[1.1] origin-center"
                      scrolling="no"
                      title="Giấy phép kinh doanh PDF"
                    />
                    <div
                      onClick={() => setPreviewPdf(request.company.license_file_url!)}
                      className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <button
                        className="bg-[#024594] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition-transform transform hover:scale-105"
                      >
                        <Eye className="w-3.5 h-3.5" /> {locale === 'vi' ? 'Phóng to PDF' : 'Zoom PDF'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setPreviewImage(request.company.license_file_url!)}
                    className="relative cursor-pointer group flex flex-col items-center justify-center"
                  >
                    <img
                      src={request.company.license_file_url}
                      alt="Giấy phép kinh doanh"
                      className="h-[260px] w-auto max-w-full object-contain rounded-lg shadow-sm group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <span className="bg-[#024594] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                        <Eye className="w-3.5 h-3.5" /> {locale === 'vi' ? 'Xem ảnh lớn' : 'View large image'}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center space-y-2">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    {locale === 'vi' ? 'Chưa tải lên Giấy phép kinh doanh' : 'No business license uploaded'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Hình ảnh hoạt động */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <label className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#024594]" /> {locale === 'vi' ? 'Hình ảnh hoạt động công ty' : 'Company activity photos'}
            </label>
            <button
              onClick={() => setAllImagesModalOpen(true)}
              className="text-xs font-bold text-[#024594] hover:text-[#023b7e] hover:underline flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              {locale === 'vi' ? 'Xem tất cả' : 'View all'} ({request.company.activity_images.length}) <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {request.company.activity_images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {request.company.activity_images.slice(0, 4).map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewImage(imgUrl)}
                  className="aspect-4/3 rounded-2xl overflow-hidden border border-slate-150 bg-slate-100 relative group cursor-pointer shadow-2xs hover:shadow transition-all"
                >
                  <img
                    src={imgUrl}
                    alt={`Hoạt động ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">{locale === 'vi' ? 'Chưa có hình ảnh hoạt động nào được đăng tải.' : 'No activity photos uploaded.'}</p>
          )}
        </div>

        {/* 5. Dịch vụ */}
        <div className="space-y-3 pt-1">
          {request.company.services.length > 0 ? (
            <div className="flex flex-row items-center justify-between pb-2 border-b border-slate-150 text-[11px] font-bold text-black uppercase tracking-wider">
              <span className="sm:w-72 shrink-0">{locale === 'vi' ? 'Dịch vụ đăng ký hiển thị' : 'Registered marketplace services'}</span>
              <span className="hidden sm:inline-block flex-1 sm:px-4 text-center">{locale === 'vi' ? 'Mô tả dịch vụ' : 'Service description'}</span>
              <span className="hidden sm:inline-block w-32 shrink-0 text-right">{locale === 'vi' ? 'Giá dịch vụ' : 'Service price'}</span>
            </div>
          ) : (
            <label className="text-[11px] font-bold text-black uppercase tracking-wider block border-b border-slate-100 pb-1.5">
              {locale === 'vi' ? 'Dịch vụ đăng ký hiển thị' : 'Registered marketplace services'}
            </label>
          )}
          
          <div className="overflow-hidden">
            {request.company.services.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {request.company.services.map((srv) => (
                  <div
                    key={srv.service_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-4.5 gap-2 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                  >
                    {/* Left: Name and sub-description */}
                    <div className="space-y-1 sm:w-72 shrink-0">
                      <h4 className="font-bold text-[#0b1c30] text-xs">
                        {srv.name}
                      </h4>
                      {srv.sub_description && (
                        <p className="text-[11px] text-slate-500">
                          {srv.sub_description}
                        </p>
                      )}
                    </div>
                    {/* Middle: Description */}
                    <div className="text-xs text-slate-600 leading-relaxed font-normal flex-1 sm:px-4">
                      {srv.description}
                    </div>
                    {/* Right: Price */}
                    <div className="font-bold text-[#024594] text-xs font-mono text-right shrink-0 w-32">
                      {formatPrice(srv.price)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">{locale === 'vi' ? 'Doanh nghiệp chưa có dịch vụ đăng ký.' : 'The company has no registered marketplace services.'}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL PREVIEW ──────────────────────────────────────────────── */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview Full"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* ── ALL IMAGES MODAL ───────────────────────────────────────────────────── */}
      {allImagesModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#c3c6d3] max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-[#0b1c30] text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#024594]" /> {locale === 'vi' ? 'Tất cả hình ảnh hoạt động' : 'All activity photos'} ({request.company.activity_images.length})
              </h3>
              <button
                onClick={() => setAllImagesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
              {request.company.activity_images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setAllImagesModalOpen(false);
                    setPreviewImage(imgUrl);
                  }}
                  className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 relative group cursor-pointer"
                >
                  <img
                    src={imgUrl}
                    alt={`Hoạt động ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PDF PREVIEW MODAL ──────────────────────────────────────────────── */}
      {previewPdf && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-[#c3c6d3] w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-[#0b1c30] text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" /> {locale === 'vi' ? 'Xem Giấy Phép Kinh Doanh (PDF)' : 'View Business License (PDF)'}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-800 text-sm font-semibold flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> {locale === 'vi' ? 'Mở tab mới' : 'Open in new tab'}
                </a>
                <button
                  onClick={() => setPreviewPdf(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={`${previewPdf}#toolbar=1`}
                className="w-full h-full border-none"
                title="Giấy phép kinh doanh PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL (DIALOG) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in font-body">
          <div className="bg-white rounded-2xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ff0c3b]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">{dict.admin_publish_requests.confirm_reject_title}</h3>
              </div>
              <button onClick={() => { setRejectModalOpen(false); setRejectReason(""); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {locale === 'vi'
                  ? `Bạn có chắc chắn muốn từ chối yêu cầu công khai thông tin của doanh nghiệp ${request.company.company_name} không?`
                  : `Are you sure you want to reject the request to publish information for ${request.company.company_name}?`}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {dict.admin_publish_requests.reject_input_label}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={dict.admin_publish_requests.reject_input_placeholder}
                  className="w-full min-h-[100px] border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none text-slate-800"
                  required
                />
              </div>

              <p className="text-xs text-[#b91c1c] bg-[#fef2f2] border border-[#fca5a5] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#ef4444] mt-0.5" />
                {locale === 'vi'
                  ? 'Lưu ý: Hệ thống sẽ tự động gửi email thông báo kèm lý do từ chối này tới doanh nghiệp. Doanh nghiệp sẽ trở về trạng thái hoạt động bình thường.'
                  : 'Note: The system will automatically send an email notification with this reject reason. The company will return to its normal active state.'}
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => { setRejectModalOpen(false); setRejectReason(""); }}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded-xl text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                {dict.admin_publish_requests.cancel}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 bg-[#ff0c3b] hover:bg-[#d80a32] active:scale-95 text-white transition-all rounded-xl text-sm font-bold shadow-md disabled:opacity-55 flex items-center gap-2 cursor-pointer"
              >
                {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {dict.admin_publish_requests.reject_action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL (DIALOG) */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in font-body">
          <div className="bg-white rounded-2xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">{dict.admin_publish_requests.confirm_approve_title}</h3>
              </div>
              <button onClick={() => setApproveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {locale === 'vi'
                  ? `Bạn có chắc chắn muốn phê duyệt yêu cầu công khai thông tin của doanh nghiệp ${request.company.company_name} không?`
                  : `Are you sure you want to approve the request to publish information for ${request.company.company_name}?`}
              </p>
              <p className="text-xs text-[#b45309] bg-[#fffbeb] border border-[#fde68a] p-3 rounded-lg leading-normal flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#d97706] mt-0.5" />
                {locale === 'vi'
                  ? 'Lưu ý: Hành động này sẽ chuyển trạng thái của doanh nghiệp sang "published", cho phép hiển thị và tìm kiếm trên trang chủ (Marketplace).'
                  : 'Note: This action will change the company status to "published", allowing it to be shown and searched on the marketplace homepage.'}
              </p>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setApproveModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 transition-colors rounded-xl text-sm font-semibold text-slate-700 disabled:opacity-50"
              >
                {dict.admin_publish_requests.cancel}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded-xl text-sm font-bold shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {locale === 'vi' ? 'Đồng ý phê duyệt' : 'Confirm approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
