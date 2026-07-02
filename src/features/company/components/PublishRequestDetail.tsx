"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { requestGetCompanyPublishRequestById } from "../api/company.api";
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
  MapPin,
  X,
  Eye,
  User,
  MessageSquare,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  pending: {
    label: "CHỜ DUYỆT",
    bg: "bg-[#fef3c7] border-[#fde68a]",
    text: "text-[#b45309]",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  approved: {
    label: "ĐÃ PHÊ DUYỆT",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: "ĐÃ TỪ CHỐI",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export default function PublishRequestDetail() {
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

  useEffect(() => {
    if (!requestId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await requestGetCompanyPublishRequestById(requestId);
        if (res.success && res.data) {
          setRequest(res.data);
        } else {
          setError("Không thể tải thông tin yêu cầu.");
        }
      } catch (err: any) {
        console.error("Lỗi khi fetch chi tiết yêu cầu:", err);
        setError(err.message || "Đã xảy ra lỗi khi kết nối đến máy chủ.");
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#024594]"></div>
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin yêu cầu...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-sm text-slate-600 mb-4">{error || "Không tìm thấy thông tin yêu cầu."}</p>
          <Link
            href="/publish-requests"
            className="inline-flex items-center gap-2 bg-[#024594] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#013570] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
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
    <div className="max-w-7xl mx-auto p-6 space-y-6 relative font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
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

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
        <Link
          href="/publish-requests"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Yêu cầu công khai
        </Link>
        <ChevronRight className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
        <span className="text-primary font-bold">Chi tiết yêu cầu</span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-headline">
              {request.company.company_name}
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${statusCfg.bg} ${statusCfg.text}`}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Ngày gửi:{" "}
            <span className="font-mono font-semibold text-[#0b1c30]">
              {new Date(request.requested_at).toLocaleString("vi-VN")}
            </span>
          </p>
        </div>

      </div>

      {/* ── SECTION 1: THÔNG TIN NGƯỜI GỬI & GHI CHÚ YÊU CẦU ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Người gửi yêu cầu */}
        <div className="bg-white rounded-2xl border border-[#c3c6d3] p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-[#024594]" /> Người gửi yêu cầu
          </h3>
          <div className="space-y-4 text-sm flex-1 flex flex-col justify-center">
            <div className="pb-3 border-b border-slate-100/80">
              <label className="text-xs font-bold text-[#2b364b] block">
                Họ và tên người gửi
              </label>
              <p className="font-bold text-slate-800 text-base mt-1">
                {request.requested_by?.full_name || "Nguyễn Văn Thiên"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-[#2b364b] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#2b364b]" /> SĐT người gửi
                </label>
                <p className="font-mono font-semibold text-slate-800 mt-1">
                  {request.requested_by?.phone || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#2b364b] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#2b364b]" /> Email người gửi
                </label>
                <p className="font-semibold text-slate-800 mt-1 truncate">
                  {request.requested_by?.email || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ghi chú yêu cầu */}
        <div className="bg-white rounded-2xl border border-[#c3c6d3] p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-[#024594]" /> Ghi chú kèm theo yêu cầu
          </h3>
          <div className="flex-1 flex flex-col justify-center bg-slate-50/80 rounded-xl border border-slate-200/80 p-4">
            {request.note ? (
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                "{request.note}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic text-center">
                Không có ghi chú thêm cho yêu cầu này.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: LOGO & BANNER (Click vào xem) ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {/* LOGO BOX (1 Column) */}
        <div className="md:col-span-1 bg-white border border-[#c3c6d3] rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow min-h-[160px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 self-start flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> Logo công ty
          </span>
          {request.company.logo_url ? (
            <div
              onClick={() => setPreviewImage(request.company.logo_url!)}
              className="relative group cursor-pointer"
            >
              <img
                src={request.company.logo_url}
                alt="Company Logo"
                className="w-28 h-28 object-cover rounded-2xl border border-slate-200 shadow-xs group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary font-bold text-2xl border border-slate-200">
              {request.company.company_name.substring(0, 2)}
            </div>
          )}
        </div>

        {/* BANNER BOX (3 Columns) */}
        <div className="md:col-span-3 bg-white border border-[#c3c6d3] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden min-h-[160px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10 flex items-center gap-1 bg-white/80 backdrop-blur-xs px-2 py-1 rounded w-fit">
            <ImageIcon className="w-3.5 h-3.5" /> Banner quảng bá
          </span>
          {request.company.banner_url ? (
            <div
              onClick={() => setPreviewImage(request.company.banner_url!)}
              className="absolute inset-0 w-full h-full cursor-pointer group"
            >
              <img
                src={request.company.banner_url}
                alt="Company Banner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <span className="bg-slate-900/80 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                  <Eye className="w-4 h-4" /> Xem ảnh banner đầy đủ
                </span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center text-white/50 font-medium">
              Chưa cập nhật ảnh Banner
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: GIỚI THIỆU (Kiểu chữ đồng nhất) ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#c3c6d3] p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
        <h3 className="text-sm font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-4 h-4 text-[#024594]" /> Giới thiệu công ty
        </h3>
        <p className="text-sm text-[#0b1c30] leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-100">
          {request.company.description}
        </p>
      </div>

      {/* ── SECTION 3: THÔNG TIN & ÁNH GIẤY PHÉP ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: THÔNG TIN (Bố trí gọn gàng bên trái) */}
        <div className="bg-white rounded-2xl border border-[#c3c6d3] p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-[#024594]" /> Thông tin doanh nghiệp
          </h3>
          <div className="space-y-3.5 text-sm flex-1 flex flex-col justify-center">
            <div className="pb-2 border-b border-slate-100/80">
              <label className="text-xs font-bold text-[#2b364b] block">
                Tên chính thức doanh nghiệp
              </label>
              <p className="font-semibold text-slate-800 text-base mt-0.5">
                {request.company.company_name}
              </p>
            </div>

            <div className="pb-2 border-b border-slate-100/80">
              <label className="text-xs font-bold text-[#2b364b] block">
                Mã số thuế
              </label>
              <p className="font-mono font-semibold text-slate-800 mt-0.5">
                {request.company.business_license_no}
              </p>
            </div>

            <div className="pb-2 border-b border-slate-100/80">
              <label className="text-xs font-bold text-[#2b364b] block">
                Mã hồ sơ xét duyệt
              </label>
              <p className="font-mono font-semibold text-[#024594] mt-0.5">
                {request.company.registration_code}
              </p>
            </div>

            <div className="pb-2 border-b border-slate-100/80">
              <label className="text-xs font-bold text-[#2b364b] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#2b364b]" /> Địa chỉ trụ sở chính
              </label>
              <p className="text-slate-800 leading-snug mt-0.5 font-medium">
                {request.company.address}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-[#2b364b] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#2b364b]" /> Số điện thoại
                </label>
                <p className="font-mono font-semibold text-slate-800 mt-0.5">
                  {request.company.phone}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#2b364b] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#2b364b]" /> Email liên hệ
                </label>
                <p className="font-semibold text-slate-800 mt-0.5 truncate">
                  {request.company.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GIẤY PHÉP KINH DOANH (PDF hoặc Ảnh) */}
        <div className="bg-white rounded-2xl border border-[#c3c6d3] p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-[#024594]" /> Giấy Phép Kinh Doanh
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4 relative overflow-hidden min-h-[360px] group">
            {request.company.license_file_url ? (
              request.company.license_file_url.toLowerCase().endsWith(".pdf") ||
                request.company.license_file_url.includes("pdf") ? (
                <div className="w-[240px] h-[330px] rounded-xl border border-slate-200 overflow-hidden relative group bg-white shadow-md mx-auto">
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
                      className="bg-[#024594] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform transform hover:scale-105"
                    >
                      <Eye className="w-4 h-4" /> Click để phóng to PDF
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
                    className="h-[330px] w-auto max-w-full object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <span className="bg-[#024594] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                      <Eye className="w-4 h-4" /> Click để phóng to
                    </span>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center space-y-2">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Chưa có bản tải lên của Giấy phép kinh doanh
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: ÁNH CÔNG TY (Click xem & Nút xem tất cả ở góc phải) ──────── */}
      <div className="bg-white rounded-2xl border border-[#c3c6d3] p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#024594] uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#024594]" /> Hình ảnh hoạt động công ty
          </h3>
          <button
            onClick={() => setAllImagesModalOpen(true)}
            className="text-xs font-bold text-[#024594] hover:text-[#023b7e] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            Xem tất cả ({request.company.activity_images.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {request.company.activity_images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {request.company.activity_images.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setPreviewImage(imgUrl)}
                className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group cursor-pointer"
              >
                <img
                  src={imgUrl}
                  alt={`Hoạt động ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Chưa có hình ảnh hoạt động nào được đăng tải.</p>
        )}
      </div>

      {/* ── SECTION 5: DỊCH VỤ (Hiển thị giống hệt ảnh thiết kế) ───────────────── */}
      <div className="bg-white rounded-2xl border border-[#c3c6d3] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Table Header Row Matching User Image */}
        <div className="grid grid-cols-12 bg-[#f8fafc] border-b border-slate-200 px-6 py-3 text-[12px] font-bold text-slate-700 tracking-wider uppercase">
          <div className="col-span-4">TÊN DỊCH VỤ</div>
          <div className="col-span-5">MÔ TẢ</div>
          <div className="col-span-3 text-right">GIÁ DỊCH VỤ</div>
        </div>

        {/* Table Body Rows Matching User Image */}
        {request.company.services.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {request.company.services.map((srv) => (
              <div
                key={srv.service_id}
                className="grid grid-cols-12 px-6 py-4.5 items-center bg-[#f8fafc]/40 hover:bg-white transition-colors"
              >
                {/* Column 1: Tên dịch vụ */}
                <div className="col-span-4 pr-4 space-y-0.5">
                  <h4 className="font-bold text-[#0b1c30] text-base leading-snug">
                    {srv.name}
                  </h4>
                  {srv.sub_description && (
                    <p className="text-xs text-slate-500 leading-normal">
                      {srv.sub_description}
                    </p>
                  )}
                </div>

                {/* Column 2: Mô tả */}
                <div className="col-span-5 pr-4 text-sm text-[#0b1c30] leading-normal font-normal">
                  {srv.description}
                </div>

                {/* Column 3: Giá dịch vụ */}
                <div className="col-span-3 text-right font-bold text-[#024594] text-sm font-mono">
                  {formatPrice(srv.price)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-slate-500 italic">Doanh nghiệp chưa đăng ký dịch vụ cụ thể.</p>
        )}
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
                <ImageIcon className="w-5 h-5 text-[#024594]" /> Tất cả hình ảnh hoạt động ({request.company.activity_images.length})
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
                <FileText className="w-5 h-5 text-red-600" /> Xem Giấy Phép Kinh Doanh (PDF)
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-800 text-sm font-semibold flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Mở tab mới
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
    </div>
  );
}
