"use client";

import React, { useState, useEffect } from "react";
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
  FileWarning,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building2,
  Image as ImageIcon,
  Eye,
  ShieldCheck,
  ExternalLink,
  FileText
} from "lucide-react";
import {
  requestGetRegistrationDetail,
  requestUpdateRegistrationStatus,
} from "../api/registration.api";
import { RegistrationDetail } from "../types";
import { formatAddressService } from "@/features/address";

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
};

export default function RegistrationApproval() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params?.id as string;

  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // State for Approval Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  // Lightbox preview states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);
  const [showAllImagesModal, setShowAllImagesModal] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState(false);

  const handleDownloadLicense = async (url: string) => {
    if (!url || downloadingFile) return;
    setDownloadingFile(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const isPdf = url.toLowerCase().endsWith(".pdf") || url.includes("pdf") || blob.type === "application/pdf";
      const filename = isPdf ? "Giay_Phep_Kinh_Doanh.pdf" : "Giay_Phep_Kinh_Doanh.png";
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      showToast("Không thể tải file. Vui lòng thử lại.");
    } finally {
      setDownloadingFile(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [formattedAddress, setFormattedAddress] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      if (!registrationId) return;
      try {
        setLoading(true);
        const res = await requestGetRegistrationDetail(registrationId);
        setRegistration(res.registration);
        if (res.registration?.note) {
          setRejectReason(res.registration.note);
        }
        
        if (res.registration?.companies?.address) {
          const formatted = await formatAddressService(res.registration.companies.address);
          setFormattedAddress(formatted);
        }
      } catch (err: any) {
        console.error("Error fetching registration detail:", err);
        setError(err.message || "Không thể tải chi tiết hồ sơ");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [registrationId]);

  const handleApprove = async () => {
    if (!registrationId) return;
    try {
      await requestUpdateRegistrationStatus(registrationId, "approved");
      if (registration) {
        setRegistration({
          ...registration,
          status: "approved",
        });
      }
      setApproveModalOpen(false);
      showToast("Phê duyệt hồ sơ đăng ký doanh nghiệp thành công!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Không thể phê duyệt hồ sơ");
    }
  };

  const handleReject = async () => {
    if (!registrationId) return;
    if (!rejectReason.trim()) {
      showToast("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      await requestUpdateRegistrationStatus(registrationId, "rejected", rejectReason);
      if (registration) {
        setRegistration({
          ...registration,
          status: "rejected",
          note: rejectReason,
        });
      }
      setRejectModalOpen(false);
      showToast("Đã từ chối hồ sơ đăng ký doanh nghiệp thành công!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Không thể từ chối hồ sơ");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          Đang tải chi tiết hồ sơ đăng ký...
        </div>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-error font-medium">
            Lỗi: {error || "Không tìm thấy hồ sơ đăng ký"}
          </p>
          <Link href="/registrations" className="text-primary hover:underline font-semibold text-sm">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const companyName = registration.companies?.company_name || "N/A";
  const desc = registration.companies?.description || "N/A";
  const licenseNo = registration.companies?.business_license_no || "N/A";
  const repName = registration.companies?.profiles?.full_name || "N/A";
  const repGender = registration.companies?.profiles?.gender || "N/A";
  const repDob = registration.companies?.profiles?.date_of_birth
    ? formatDate(registration.companies.profiles.date_of_birth)
    : "N/A";
  const repPhone = registration.companies?.profiles?.phone_number || "N/A";
  const repEmail = registration.companies?.profiles?.email || "N/A";
  const repAddress = registration.companies?.profiles?.address || "N/A";
  const officeAddress = formattedAddress || "N/A";

  const repAvatar = registration.companies?.profiles?.avatar_url || "";
  const repCccd = registration.companies?.identities?.identity_id || "N/A";
  const repIssueDate = registration.companies?.identities?.issue_date
    ? formatDate(registration.companies.identities.issue_date)
    : "N/A";
  const repIssuePlace = registration.companies?.identities?.issue_place || "N/A";
  const cccdFront = registration.companies?.identities?.front_url || "";
  const cccdBack = registration.companies?.identities?.back_url || "";

  const companyEmail = registration.companies?.email || "N/A";
  const companyPhone = registration.companies?.phone || "N/A";

  const logoUrl = registration.companies?.companyImgs?.find((img: any) => img.image_type === "logo")?.image_url || "";
  const bannerUrl = registration.companies?.companyImgs?.find((img: any) => img.image_type === "banner")?.image_url || "";
  const otherImages = registration.companies?.companyImgs?.filter((img: any) => img.image_type === "other") || [];
  const licenseFileUrl = registration.companies?.license_file_url || "";

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 relative">
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant pb-4">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-on-surface-variant/80 text-xs font-medium mb-1">
            <Link href="/registrations" className="hover:text-primary transition-colors">
              Doanh nghiệp
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            <span className="text-on-surface-variant/70 font-normal">Đang chờ duyệt</span>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            <span className="text-primary font-bold">Chi tiết phê duyệt</span>
          </nav>
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-headline">
              Phê duyệt Đăng ký Doanh nghiệp
            </h2>
            {registration.status === "approved" && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                ĐÃ PHÊ DUYỆT
              </span>
            )}
            {registration.status === "rejected" && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                <X className="w-3 h-3" />
                ĐÃ TỪ CHỐI
              </span>
            )}
            {registration.status === "pending" && (
              <span className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#b45309] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#fde68a]">
                <Clock className="w-3 h-3" />
                ĐANG CHỜ DUYỆT
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5 font-body flex items-center gap-3 flex-wrap">
            <span>
              Hồ sơ mã số: <span className="font-mono font-semibold text-slate-800">{registration.registration_code}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Ngày gửi hồ sơ: <span className="font-semibold text-slate-800">{formatDateTime(registration.created_at)}</span>
            </span>
          </p>
        </div>

        {registration.status === "pending" && (
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setRejectModalOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2 border border-[#ff0c3b] text-[#ff0c3b] hover:bg-red-50 active:scale-95 transition-all rounded-lg text-xs font-bold tracking-wide cursor-pointer"
            >
              TỪ CHỐI HỒ SƠ
            </button>
            <button
              onClick={() => setApproveModalOpen(true)}
              className="flex-1 md:flex-initial px-4 py-2 bg-[#024594] text-white hover:bg-[#023b7e] active:scale-95 transition-all rounded-lg text-xs font-bold tracking-wide shadow-sm cursor-pointer"
            >
              PHÊ DUYỆT ĐĂNG KÝ
            </button>
          </div>
        )}
      </div>

      {/* Rejection Reason Alert if rejected */}
      {registration.status === "rejected" && registration.note && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <FileWarning className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-red-900">Lý do từ chối hồ sơ:</h4>
            <p className="text-xs mt-1 text-red-800 whitespace-pre-wrap leading-relaxed">{registration.note}</p>
          </div>
        </div>
      )}

      {/* Main Content Container (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* LEFT COLUMN: Company info (merged) + Activity Images */}
        <div className="flex flex-col h-full gap-4">

          {/* Card: Thông tin doanh nghiệp (gộp: thông tin + mô tả + logo/banner) */}
          <div className="bg-white rounded-xl border border-[#c3c6d3] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#f0f4f8] border-b border-[#c3c6d3] px-4 py-2.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#024594]" />
              <h3 className="text-xs font-bold text-[#0b1c30] tracking-wider uppercase">THÔNG TIN DOANH NGHIỆP</h3>
            </div>
            <div className="p-4 space-y-4 text-xs font-body">
              {/* Tên công ty */}
              <div className="pb-2 border-b border-slate-100">
                <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Tên chính thức doanh nghiệp</label>
                <p className="font-bold text-[#024594] text-sm mt-0.5">{companyName}</p>
              </div>

              {/* Grid thông tin */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
                <div className="pb-2 border-b border-slate-100">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Mã số DN / MST</label>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">{licenseNo}</p>
                </div>
                <div className="pb-2 border-b border-slate-100">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Số điện thoại</label>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">{companyPhone}</p>
                </div>
                <div className="col-span-2 pb-2 border-b border-slate-100">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Email doanh nghiệp</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{companyEmail}</p>
                </div>
                <div className="col-span-2 pb-2 border-b border-slate-100">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Địa chỉ trụ sở chính</label>
                  <p className="text-slate-800 leading-snug mt-0.5 font-medium">{officeAddress}</p>
                </div>
                <div className="col-span-2 pb-1">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Mô tả doanh nghiệp</label>
                  <p className="text-slate-700 leading-relaxed font-normal bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 mt-1">{desc}</p>
                </div>
              </div>

              {/* Logo & Banner */}
              <div className="border-t border-slate-100 pt-3">
                <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block mb-2">Hình ảnh thương hiệu</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Logo */}
                  <div className="col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center gap-2 min-h-[120px] justify-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Building2 className="w-3 h-3" />Logo</span>
                    {logoUrl ? (
                      <div onClick={() => setPreviewImage(logoUrl)} className="relative group cursor-pointer">
                        <img src={logoUrl} alt="Logo" className="w-20 h-20 object-cover rounded-lg border border-slate-200 shadow-sm group-hover:opacity-90 transition-opacity" />
                        <div className="absolute inset-0 bg-black/35 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Eye className="w-4 h-4" /></div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 text-xs">N/A</div>
                    )}
                  </div>
                  {/* Banner */}
                  <div className="col-span-2 bg-slate-800 border border-slate-200 rounded-xl relative overflow-hidden min-h-[120px]">
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded"><ImageIcon className="w-3 h-3" />Banner</span>
                    {bannerUrl ? (
                      <div onClick={() => setPreviewImage(bannerUrl)} className="absolute inset-0 cursor-pointer group">
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <span className="bg-slate-900/80 px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1"><Eye className="w-3 h-3" />Xem</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-medium">Chưa có banner</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ảnh hoạt động */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />Ảnh hoạt động của công ty
                  </label>
                  {otherImages.length > 2 && (
                    <button onClick={() => setShowAllImagesModal(true)} className="text-[10px] font-bold text-[#024594] hover:text-[#023b7e] transition-colors uppercase tracking-wider cursor-pointer">
                      Xem tất cả ({otherImages.length})
                    </button>
                  )}
                </div>
                {otherImages.length > 0 ? (
                  <div className="flex gap-3 flex-wrap">
                    {otherImages.slice(0, 2).map((img: any, idx: number) => (
                      <div key={img.image_id || idx} onClick={() => setPreviewImage(img.image_url)}
                        className="relative flex-1 min-w-[120px] aspect-[4/3] rounded-lg border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer group hover:border-[#024594] transition-colors">
                        <img src={img.image_url} alt={`Ảnh hoạt động ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Eye className="w-4 h-4" /></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3 text-slate-400">
                    <ImageIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    <span className="text-xs font-medium">Chưa có ảnh hoạt động</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Representative Info + License */}
        <div className="flex flex-col h-full gap-4">




          <div className="bg-white rounded-xl border border-[#c3c6d3] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#f0f4f8] border-b border-[#c3c6d3] px-4 py-2.5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#024594]" />
              <h3 className="text-xs font-bold text-[#0b1c30] tracking-wider uppercase">THÔNG TIN NGƯỜI ĐẠI DIỆN</h3>
            </div>
            <div className="p-4 font-body space-y-3">
              {/* Avatar + Tên */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                {repAvatar ? (
                  <img src={repAvatar} alt="Avatar" className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0" onClick={() => setPreviewImage(repAvatar)} />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 flex-shrink-0"><User className="w-5 h-5" /></div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{repName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Người đại diện pháp luật</p>
                </div>
              </div>

              {/* Thông tin cá nhân */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Số điện thoại</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{repPhone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Giới tính</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{repGender}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Ngày sinh</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{repDob}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Email</label>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">{repEmail}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Địa chỉ liên hệ</label>
                  <p className="font-semibold text-slate-800 mt-0.5 leading-snug">{repAddress}</p>
                </div>
              </div>

              {/* CCCD */}
              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Số CCCD / CMND</label>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">{repCccd}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Ngày cấp</label>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">{repIssueDate}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block">Nơi cấp</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{repIssuePlace}</p>
                </div>
              </div>

              {/* Ảnh CCCD */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-[#434751] uppercase tracking-wider block mb-2">Ảnh định danh CMND / CCCD</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mặt trước</span>
                    {cccdFront ? (
                      <div onClick={() => setPreviewImage(cccdFront)} className="relative aspect-[3/2] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group hover:border-[#024594] transition-colors">
                        <img src={cccdFront} alt="CCCD mặt trước" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Eye className="w-3.5 h-3.5" /></div>
                      </div>
                    ) : (
                      <div className="aspect-[3/2] rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">Chưa có ảnh</div>
                    )}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mặt sau</span>
                    {cccdBack ? (
                      <div onClick={() => setPreviewImage(cccdBack)} className="relative aspect-[3/2] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group hover:border-[#024594] transition-colors">
                        <img src={cccdBack} alt="CCCD mặt sau" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Eye className="w-3.5 h-3.5" /></div>
                      </div>
                    ) : (
                      <div className="aspect-[3/2] rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400">Chưa có ảnh</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Card: Giấy phép đăng ký kinh doanh */}
          <div className="bg-white rounded-xl border border-[#c3c6d3] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex-grow flex flex-col">
            <div className="bg-[#f0f4f8] border-b border-[#c3c6d3] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#024594]" />
                <h3 className="text-xs font-bold text-[#0b1c30] tracking-wider uppercase">GIẤY PHÉP ĐĂNG KÝ KINH DOANH</h3>
              </div>
              {licenseFileUrl && (
                <button
                  onClick={() => handleDownloadLicense(licenseFileUrl)}
                  disabled={downloadingFile}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#024594] hover:text-[#023b7e] border border-[#024594]/30 hover:border-[#024594] bg-white hover:bg-[#024594]/5 px-2 py-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Tải xuống giấy phép"
                >
                  <Download className="w-3 h-3" />
                  {downloadingFile ? "Đang tải..." : "Tải xuống"}
                </button>
              )}
            </div>
            <div className="p-4 font-body flex-grow flex flex-col justify-center">
              {licenseFileUrl ? (
                <div
                  onClick={() => {
                    if (licenseFileUrl.toLowerCase().endsWith(".pdf") || licenseFileUrl.includes("pdf")) {
                      setPreviewPdf(licenseFileUrl);
                    } else {
                      setPreviewImage(licenseFileUrl);
                    }
                  }}
                  className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all group flex-shrink-0"
                >
                  {licenseFileUrl.toLowerCase().endsWith(".pdf") || licenseFileUrl.includes("pdf") ? (
                    <div className="w-16 h-20 rounded-lg border border-slate-200 overflow-hidden relative bg-white flex-shrink-0 shadow-sm group-hover:border-[#024594] transition-colors">
                      <iframe src={`${licenseFileUrl}#toolbar=0&navpanes=0&view=Fit`} className="w-full h-full border-none pointer-events-none scale-[1.4] origin-center" scrolling="no" title="Giấy phép kinh doanh PDF" />
                      <div className="absolute inset-0 bg-transparent" />
                    </div>
                  ) : (
                    <div className="w-16 h-20 rounded-lg border border-slate-200 overflow-hidden relative bg-slate-100 flex-shrink-0 shadow-sm group-hover:border-[#024594] transition-colors">
                      <img src={licenseFileUrl} alt="Giấy phép kinh doanh" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {licenseFileUrl.toLowerCase().endsWith(".pdf") || licenseFileUrl.includes("pdf") ? "Giay_Phep_Kinh_Doanh.pdf" : "Giay_Phep_Kinh_Doanh.png"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {licenseFileUrl.toLowerCase().endsWith(".pdf") || licenseFileUrl.includes("pdf") ? "Tài liệu PDF" : "Hình ảnh đính kèm"} • Click để xem chi tiết
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm group-hover:text-[#024594] group-hover:border-[#024594] transition-colors flex-shrink-0">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4 text-slate-400 flex-grow">
                  <FileText className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <span className="text-xs font-medium">Chưa có bản tải lên của Giấy phép kinh doanh</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>


      {/* ── LIGHTBOX IMAGE OVERLAY ── */}
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
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}

      {/* ── LIGHTBOX PDF OVERLAY ── */}
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
                Bạn có chắc chắn muốn từ chối hồ sơ đăng ký doanh nghiệp của <span className="font-bold text-[#0b1c30]">{companyName}</span> không?
              </p>
              <div>
                <label className="text-xs font-bold text-[#434751] uppercase tracking-wider block mb-1.5">Lý do từ chối <span className="text-red-500">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Nhập lý do từ chối hồ sơ..."
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all placeholder:text-slate-400"
                />
              </div>
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
                className="px-4 py-2 bg-[#ff0c3b] hover:bg-[#d80a32] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
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
                Bạn có chắc chắn muốn phê duyệt hồ sơ đăng ký doanh nghiệp của <span className="font-bold text-[#0b1c30]">{companyName}</span> không?
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
                className="px-4 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
              >
                Đồng ý phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOW ALL IMAGES GALLERY MODAL */}
      {showAllImagesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl border border-[#c3c6d3] max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#f0f4f8] border-b border-[#c3c6d3] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#024594]">
                <ImageIcon className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-[#0b1c30] text-lg font-headline">ẢNH HOẠT ĐỘNG CỦA CÔNG TY</h3>
              </div>
              <button onClick={() => setShowAllImagesModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {otherImages.map((img: any, idx: number) => (
                  <div
                    key={img.image_id || idx}
                    onClick={() => {
                      setPreviewImage(img.image_url);
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group shadow-sm hover:border-[#024594] transition-colors"
                  >
                    <img
                      src={img.image_url}
                      alt={`Ảnh hoạt động ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowAllImagesModal(false)}
                className="px-5 py-2 bg-[#024594] hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-bold shadow-md cursor-pointer"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
