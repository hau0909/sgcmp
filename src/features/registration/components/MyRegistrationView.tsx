"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Building,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Pencil,
  Eye,
  FileClock,
  Image as ImageIcon,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Briefcase
} from "lucide-react";
import { requestGetMyRegistration } from "../api/registration.api";
import { RegistrationDetail } from "../types";
import { requestGetCities, requestGetWards } from "@/features/address";
import { useTranslation } from "@/components/providers/LanguageProvider";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  if (!dateStr) return "–";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "–";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return dateStr;
  }
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, d }: { status: string; d: any }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        {d.badge_approved}
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
        <X className="w-3.5 h-3.5" />
        {d.badge_rejected}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
      <Clock className="w-3.5 h-3.5" />
      {d.badge_pending}
    </span>
  );
}

// ─── Image preview ────────────────────────────────────────────────────────────
function ImagePreview({
  url,
  label,
  onView,
  aspect = "square",
  d
}: {
  url: string;
  label: string;
  onView: (url: string) => void;
  aspect?: "square" | "video" | "auto";
  d: any;
}) {
  if (!url)
    return (
      <div className={`w-full ${aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : 'h-32'} rounded-xl border border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center text-xs text-on-surface-variant`}>
        {d.no_image}
      </div>
    );

  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("pdf");
  if (isPdf)
    return (
      <div 
        onClick={() => window.open(url, "_blank")}
        className={`w-full ${aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : 'h-32'} rounded-xl border border-outline-variant/60 flex flex-col items-center justify-center bg-surface-container gap-2 p-4 text-center cursor-pointer hover:bg-surface-container-high transition-colors`}
      >
        <FileText className="w-8 h-8 text-primary" />
        <span className="font-semibold text-on-surface text-sm truncate w-full text-center">{label} (PDF)</span>
        <span className="text-xs text-primary underline">{d.click_to_view}</span>
      </div>
    );

  return (
    <div
      className={`relative w-full ${aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : 'h-32'} rounded-xl overflow-hidden border border-outline-variant cursor-pointer group`}
      onClick={() => onView(url)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
        <Eye className="w-6 h-6" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyRegistrationView() {
  const { dict } = useTranslation();
  const d = dict.customer.my_registration;

  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("–");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await requestGetMyRegistration();
        const reg: RegistrationDetail | null = res.registration ?? null;
        setRegistration(reg);

        // Resolve address from city/ward IDs stored in company.address
        if (reg?.companies?.address) {
          const rawAddr = reg.companies.address;
          const addr = typeof rawAddr === "string" ? null : rawAddr as { city_id?: number; ward_id?: number; street?: string };
          if (addr?.city_id) {
            try {
              const [citiesRes, wardsRes] = await Promise.all([
                requestGetCities(),
                requestGetWards(Number(addr.city_id)),
              ]);
              const cityName = citiesRes?.cities?.find((c: any) => c.city_id === addr.city_id)?.city_name || "";
              const wardName = wardsRes?.wards?.find((w: any) => w.ward_id === addr.ward_id)?.ward_name || "";
              const parts: string[] = [];
              if (addr.street) parts.push(addr.street);
              if (wardName) parts.push(wardName);
              if (cityName) parts.push(cityName);
              setAddress(parts.join(", ") || "–");
            } catch {
              setAddress(typeof rawAddr === "string" ? rawAddr : addr.street || "–");
            }
          } else if (typeof rawAddr === "string") {
            setAddress(rawAddr);
          }
        }
      } catch (err: any) {
        setError(err.message || d.error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  const company = registration?.companies;
  const profile = company?.profiles;
  const identity = company?.identities;
  const images = company?.companyImgs || [];

  const logoUrl = images.find((img: any) => img.image_type === "logo")?.image_url || "";
  const licenseUrl = company?.license_file_url || "";
  const galleryImages = images.filter((img: any) => img.image_type !== "logo");

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 space-y-6 pb-12">
      {/* ── Page Header (Luôn hiển thị) ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-headline">
              {d.title}
            </h1>
            {!loading && !error && registration && (
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <StatusBadge status={registration.status} d={d} />
                <span className="text-sm text-on-surface-variant font-body">
                  {d.code}:{" "}
                  <span className="font-mono font-semibold text-on-surface">
                    {registration.registration_code}
                  </span>
                </span>
                <span className="text-sm text-on-surface-variant font-body">
                  {d.date}:{" "}
                  <span className="font-semibold text-on-surface">
                    {formatDateTime(registration.created_at)}
                  </span>
                </span>
              </div>
            )}
            {loading && (
               <div className="flex items-center gap-4 mt-2 h-6">
                 <div className="w-24 h-5 bg-slate-200 rounded-full animate-pulse"></div>
                 <div className="w-32 h-5 bg-slate-200 rounded animate-pulse"></div>
               </div>
            )}
          </div>
        </div>

        {/* Edit button */}
        <button
          disabled={loading || !!error || !registration || registration.status !== "rejected"}
          title={
            registration?.status === "rejected"
              ? d.edit_btn_tooltip
              : d.edit_btn_disabled
          }
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0
            ${registration?.status === "rejected"
              ? "border-primary text-primary bg-primary/5 hover:bg-primary/10 cursor-pointer shadow-sm"
              : "border-outline-variant text-on-surface-variant/50 bg-surface-container-low cursor-not-allowed"
            }`}
        >
          <Pencil className="w-4 h-4" />
          {d.edit_btn}
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-xs text-on-surface-variant/80 font-medium">{d.loading}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-2xl border border-red-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
          <h3 className="font-bold text-red-800 text-lg">{d.error}</h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : !registration ? (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileClock className="w-8 h-8 text-primary/60" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">{d.empty_title}</h3>
          <p className="text-sm text-on-surface-variant mt-1 mb-5 max-w-sm leading-relaxed">
            {d.empty_desc}
          </p>
          <Link
            href="/register-company"
            className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            {d.empty_btn}
          </Link>
        </div>
      ) : (
        <>
          {/* Status banners */}
      {registration.status === "rejected" && registration.note && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-800 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1 text-base">{d.status_rejected_title}</p>
            <p className="text-sm leading-relaxed text-red-700 whitespace-pre-wrap">
              {registration.note}
            </p>
            <p className="text-sm font-semibold mt-2 text-red-800 bg-red-100/50 inline-block px-3 py-1 rounded-lg">
              → {d.status_rejected_action}
            </p>
          </div>
        </div>
      )}

      {/* ── Main content: 2-Column Grid for less vertical scrolling ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN: Doanh nghiệp + Hình ảnh */}
        <div className="space-y-6">
          
          {/* 1. Thông tin doanh nghiệp */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_company_title}</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.company_name}</label>
                  <p className="font-bold text-primary text-base">{company?.company_name || "–"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.tax_code}</label>
                  <p className="font-mono font-medium text-on-surface text-sm">{company?.business_license_no || "–"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.phone}</label>
                  <div className="flex items-center gap-1.5 font-medium text-on-surface text-sm">
                    <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                    {company?.phone || "–"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.email}</label>
                  <div className="flex items-center gap-1.5 font-medium text-on-surface text-sm">
                    <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                    {company?.email || "–"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.address}</label>
                  <div className="flex items-start gap-1.5 font-medium text-on-surface text-sm bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {address}
                  </div>
                </div>
                {company?.description && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.description}</label>
                    <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant/50 whitespace-pre-wrap">
                      {company.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Hình ảnh nhận diện & Hoạt động */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_images_title}</h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-on-surface block mb-2">{d.logo}</label>
                <div className="w-24">
                  <ImagePreview url={logoUrl} label={d.logo} onView={setPreviewUrl} aspect="square" d={d} />
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/40">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-on-surface-variant" />
                  {d.gallery} ({galleryImages.length})
                </label>
                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {galleryImages.map((img: any, idx: number) => (
                      <div key={img.image_id || idx}>
                        <ImagePreview url={img.image_url} label={`Ảnh ${idx + 1}`} onView={setPreviewUrl} aspect="square" d={d} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg border border-dashed border-outline-variant text-center">
                    {d.no_gallery}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Người đại diện + Giấy phép */}
        <div className="space-y-6">
          
          {/* 3. Người đại diện pháp luật */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_rep_title}</h3>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center shrink-0">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-on-surface-variant/50" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-base">{profile?.full_name || "–"}</h4>
                  <span className="text-xs text-on-surface-variant font-medium">{d.rep_role}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.rep_phone}</label>
                  <div className="flex items-center gap-1.5 font-medium text-on-surface text-sm">
                    <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                    {profile?.phone_number || "–"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.rep_email}</label>
                  <div className="flex items-center gap-1.5 font-medium text-on-surface text-sm">
                    <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                    {profile?.email || "–"}
                  </div>
                </div>
              </div>

              {/* CCCD Info */}
              <div className="pt-4 border-t border-outline-variant/40">
                <h4 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  {d.id_title}
                </h4>
                <div className="grid grid-cols-2 gap-x-5 gap-y-4 mb-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.id_no}</label>
                    <p className="font-mono font-medium text-on-surface text-sm">{identity?.identity_id || "–"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.id_date}</label>
                    <div className="flex items-center gap-1.5 font-medium text-on-surface text-sm">
                      <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
                      {identity?.issue_date ? formatDate(identity.issue_date) : "–"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.id_place}</label>
                    <div className="flex items-center gap-1.5 font-medium text-on-surface text-sm">
                      <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
                      <span className="truncate">{identity?.issue_place || "–"}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-on-surface-variant block mb-1.5 uppercase tracking-wide">{d.id_front}</label>
                    <ImagePreview url={identity?.front_url || ""} label={d.id_front} onView={setPreviewUrl} aspect="video" d={d} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-on-surface-variant block mb-1.5 uppercase tracking-wide">{d.id_back}</label>
                    <ImagePreview url={identity?.back_url || ""} label={d.id_back} onView={setPreviewUrl} aspect="video" d={d} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Giấy phép kinh doanh (Ô Riêng Theo Yêu Cầu) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_license_title}</h3>
            </div>
            <div className="p-5">
              <ImagePreview url={licenseUrl} label={d.license_label} onView={setPreviewUrl} aspect="auto" d={d} />
            </div>
          </div>

        </div>

      </div>

      {/* ── Image Lightbox ───────────────────────────────────────────────────── */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      </>
      )}
    </div>
  );
}
