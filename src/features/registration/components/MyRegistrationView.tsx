"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Briefcase,
  Save,
  RefreshCcw,
  Plus,
  Loader2,
} from "lucide-react";
import { requestGetMyRegistration, requestUpdateMyRegistration } from "../api/registration.api";
import { RegistrationDetail } from "../types";
import { requestGetCities, requestGetWards } from "@/features/address";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import UploadZone from "./UploadZone";
import { useAuthStore } from "@/store/auth.store";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) => {
  if (!dateStr) return "–";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("vi-VN");
  } catch { return dateStr; }
};
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "–";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  } catch { return dateStr; }
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, d }: { status: string; d: any }) {
  if (status === "approved")
    return <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" />{d.badge_approved}</span>;
  if (status === "rejected")
    return <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200"><X className="w-3.5 h-3.5" />{d.badge_rejected}</span>;
  if (status === "resubmitted")
    return <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200"><RefreshCcw className="w-3.5 h-3.5" />{d.badge_resubmitted}</span>;
  return <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200"><Clock className="w-3.5 h-3.5" />{d.badge_pending}</span>;
}

// ─── Image preview (view mode) ────────────────────────────────────────────────
function ImagePreview({ url, label, onView, aspect = "square", d }: { url: string; label: string; onView: (url: string) => void; aspect?: "square" | "video" | "auto"; d: any; }) {
  if (!url)
    return <div className={`w-full ${aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : 'h-32'} rounded-xl border border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center text-xs text-on-surface-variant`}>{d.no_image}</div>;
  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("pdf");
  if (isPdf)
    return <div onClick={() => window.open(url, "_blank")} className={`w-full ${aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : 'h-32'} rounded-xl border border-outline-variant/60 flex flex-col items-center justify-center bg-surface-container gap-2 p-4 text-center cursor-pointer hover:bg-surface-container-high transition-colors`}><FileText className="w-8 h-8 text-primary" /><span className="font-semibold text-on-surface text-sm truncate w-full text-center">{label} (PDF)</span><span className="text-xs text-primary underline">{d.click_to_view}</span></div>;
  return <div className={`relative w-full ${aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : 'h-32'} rounded-xl overflow-hidden border border-outline-variant cursor-pointer group`} onClick={() => onView(url)}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={url} alt={label} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><Eye className="w-6 h-6" /></div>
  </div>;
}

// ─── Input field helper ───────────────────────────────────────────────────────
function EditField({ label, value, onChange, type = "text", placeholder, required, disabled, error }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean; error?: string; }) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg border text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${error ? "border-red-400 bg-red-50/30" : "border-outline-variant focus:border-primary"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyRegistrationView() {
  const { dict } = useTranslation();
  const d = dict.customer.my_registration;
  const supabase = createClient();
  const userId = useAuthStore((state: any) => state.user_id);

  const [registration, setRegistration] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("–");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Cities / Wards for address select in edit mode
  const [cities, setCities] = useState<{ city_id: number; city_name: string }[]>([]);
  const [wards, setWards] = useState<{ ward_id: number; ward_name: string }[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);

  // Edit form data
  const [editData, setEditData] = useState({
    // personal
    fullName: "",
    phoneNumber: "",
    avatarUrl: "",
    avatarFile: null as File | null,
    // identity
    identityId: "",
    issueDate: "",
    issuePlace: "",
    frontUrl: "",
    frontFile: null as File | null,
    backUrl: "",
    backFile: null as File | null,
    // company
    companyName: "",
    businessLicenseNo: "",
    companyPhone: "",
    companyEmail: "",
    cityId: "" as number | "",
    wardId: "" as number | "",
    street: "",
    description: "",
    licenseUrl: "",
    licenseFile: null as File | null,
    // images
    logoUrl: "",
    logoFile: null as File | null,
    galleryExisting: [] as string[], // existing gallery URLs to keep
    galleryFiles: [] as File[],      // new gallery files to add
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchRegistration = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await requestGetMyRegistration(userId);
      const reg: RegistrationDetail | null = res.registration ?? null;
      setRegistration(reg);

      if (reg?.companies?.address) {
        const rawAddr = reg.companies.address;
        const addr = typeof rawAddr === "string" ? null : rawAddr as { city_id?: number; ward_id?: number; street?: string };
        if (addr?.city_id) {
          try {
            const [citiesRes, wardsRes] = await Promise.all([requestGetCities(), requestGetWards(Number(addr.city_id))]);
            const cityName = (citiesRes?.cities || []).find((c: any) => c.city_id === addr.city_id)?.city_name || "";
            const wardName = (wardsRes?.wards || []).find((w: any) => w.ward_id === addr.ward_id)?.ward_name || "";
            const parts: string[] = [];
            if (addr.street) parts.push(addr.street);
            if (wardName) parts.push(wardName);
            if (cityName) parts.push(cityName);
            setAddress(parts.join(", ") || "–");
          } catch {
            setAddress(typeof rawAddr === "string" ? rawAddr : (rawAddr as any).street || "–");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => { fetchRegistration(); }, [fetchRegistration]);

  // ── Load cities once ──────────────────────────────────────────────────────
  useEffect(() => {
    requestGetCities().then(res => setCities(res?.cities || [])).catch(() => {});
  }, []);

  // ── Load wards when city changes ──────────────────────────────────────────
  useEffect(() => {
    if (!editData.cityId) { setWards([]); return; }
    setWardsLoading(true);
    requestGetWards(Number(editData.cityId))
      .then(res => setWards(res?.wards || []))
      .catch(() => setWards([]))
      .finally(() => setWardsLoading(false));
  }, [editData.cityId]);

  // ── Start editing: populate editData from registration ────────────────────
  const handleStartEdit = () => {
    if (!registration) return;
    const company = registration.companies;
    const profile = company?.profiles;
    const identity = company?.identities;
    const images = company?.companyImgs || [];
    const rawAddr = company?.address as any;

    const logoUrl = images.find((img: any) => img.image_type === "logo")?.image_url || "";
    const galleryExisting = images.filter((img: any) => img.image_type !== "logo").map((img: any) => img.image_url);

    setEditData({
      fullName: profile?.full_name || "",
      phoneNumber: profile?.phone_number || "",
      avatarUrl: profile?.avatar_url || "",
      avatarFile: null,
      identityId: identity?.identity_id || "",
      issueDate: identity?.issue_date ? identity.issue_date.slice(0, 10) : "",
      issuePlace: identity?.issue_place || "",
      frontUrl: identity?.front_url || "",
      frontFile: null,
      backUrl: identity?.back_url || "",
      backFile: null,
      companyName: company?.company_name || "",
      businessLicenseNo: company?.business_license_no || "",
      companyPhone: company?.phone || "",
      companyEmail: company?.email || "",
      cityId: rawAddr?.city_id || "",
      wardId: rawAddr?.ward_id || "",
      street: rawAddr?.street || "",
      description: company?.description || "",
      licenseUrl: company?.license_file_url || "",
      licenseFile: null,
      logoUrl,
      logoFile: null,
      galleryExisting,
      galleryFiles: [],
    });
    setEditErrors({});
    setSubmitError(null);
    setIsEditing(true);
  };

  // ── Upload helper ─────────────────────────────────────────────────────────
  const uploadToStorage = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) throw new Error(`Upload lỗi: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  // ── Validate edit form ────────────────────────────────────────────────────
  const validateEdit = () => {
    const errs: Record<string, string> = {};
    if (!editData.fullName.trim()) errs.fullName = dict.pages.registration.err_name_required;
    
    if (!editData.phoneNumber.trim()) {
      errs.phoneNumber = dict.pages.registration.err_phone_required;
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(editData.phoneNumber.replace(/\s/g, ""))) {
      errs.phoneNumber = dict.pages.registration.err_phone_invalid;
    }

    if (!editData.identityId.trim()) {
      errs.identityId = dict.pages.registration.err_identity_required;
    } else if (!/^[0-9]{9}$|^[0-9]{12}$/.test(editData.identityId.trim())) {
      errs.identityId = dict.pages.registration.err_identity_invalid;
    }

    if (!editData.issueDate) {
      errs.issueDate = dict.pages.registration.err_issue_date_required;
    } else {
      const selectedDate = new Date(editData.issueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        errs.issueDate = dict.pages.registration.err_issue_date_invalid;
      }
    }
    if (!editData.issuePlace.trim()) errs.issuePlace = dict.pages.registration.err_issue_place_required;
    if (!editData.frontUrl && !editData.frontFile) errs.frontFile = dict.pages.registration.err_front_id_required;
    if (!editData.backUrl && !editData.backFile) errs.backFile = dict.pages.registration.err_back_id_required;
    
    if (!editData.companyName.trim()) errs.companyName = dict.pages.registration.err_company_name_required;
    if (!editData.businessLicenseNo.trim()) errs.businessLicenseNo = dict.pages.registration.err_tax_required;
    if (!editData.companyPhone.trim()) errs.companyPhone = dict.pages.registration.err_company_phone_required;
    
    if (!editData.companyEmail.trim()) {
      errs.companyEmail = dict.pages.registration.err_company_email_required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.companyEmail)) {
      errs.companyEmail = dict.pages.registration.err_company_email_invalid;
    }

    if (editData.cityId === "") errs.cityId = dict.pages.registration.err_city_required;
    if (editData.wardId === "") errs.wardId = dict.pages.registration.err_ward_required;
    if (!editData.street.trim()) errs.street = dict.pages.registration.err_street_required;
    if (!editData.logoUrl && !editData.logoFile) errs.logoFile = dict.pages.registration.err_logo_required;
    if (!editData.licenseUrl && !editData.licenseFile) errs.licenseFile = dict.pages.registration.err_license_required;
    
    const totalGallery = editData.galleryExisting.length + editData.galleryFiles.length;
    if (totalGallery < 3) {
      errs.galleryFiles = dict.pages.registration.err_gallery_min;
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit resubmission ───────────────────────────────────────────────────
  const handleResubmit = async () => {
    if (!validateEdit() || !registration?.companies?.company_id) return;
    const companyId = registration.companies.company_id;
    const userId = registration.companies.owner_id;

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Upload new files if any
      let finalAvatarUrl = editData.avatarUrl;
      if (editData.avatarFile) {
        const ext = editData.avatarFile.name.split(".").pop()?.toLowerCase() || "";
        finalAvatarUrl = await uploadToStorage(editData.avatarFile, "profiles", `${userId}/avatar.${ext}`);
      }
      let finalFrontUrl = editData.frontUrl;
      if (editData.frontFile) {
        const ext = editData.frontFile.name.split(".").pop()?.toLowerCase() || "";
        finalFrontUrl = await uploadToStorage(editData.frontFile, "profiles", `${userId}/identity/front.${ext}`);
      }
      let finalBackUrl = editData.backUrl;
      if (editData.backFile) {
        const ext = editData.backFile.name.split(".").pop()?.toLowerCase() || "";
        finalBackUrl = await uploadToStorage(editData.backFile, "profiles", `${userId}/identity/back.${ext}`);
      }
      let finalLogoUrl = editData.logoUrl;
      if (editData.logoFile) {
        const ext = editData.logoFile.name.split(".").pop()?.toLowerCase() || "";
        finalLogoUrl = await uploadToStorage(editData.logoFile, "companies", `${companyId}/images/logo.${ext}`);
      }
      let finalLicenseUrl = editData.licenseUrl;
      if (editData.licenseFile) {
        const ext = editData.licenseFile.name.split(".").pop()?.toLowerCase() || "";
        finalLicenseUrl = await uploadToStorage(editData.licenseFile, "companies", `${companyId}/lisence.${ext}`);
      }
      const newGalleryUrls = await Promise.all(
        editData.galleryFiles.map((file, idx) => {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          return uploadToStorage(file, "companies", `${companyId}/images/gallery-${Date.now()}-${idx}.${ext}`);
        })
      );

      // Build images array: keep existing gallery + new gallery + logo
      const images: { imageUrl: string; imageType: "logo" | "banner" | "other" }[] = [];
      if (finalLogoUrl) images.push({ imageUrl: finalLogoUrl, imageType: "logo" });
      editData.galleryExisting.forEach((url, idx) => {
        images.push({ imageUrl: url, imageType: idx === 0 ? "banner" : "other" });
      });
      newGalleryUrls.forEach((url, idx) => {
        const offset = editData.galleryExisting.length;
        images.push({ imageUrl: url, imageType: (offset + idx) === 0 ? "banner" : "other" });
      });

      const res = await requestUpdateMyRegistration({
        userId: userId,
        registrationId: registration.registration_id,
        profile: { fullName: editData.fullName, phoneNumber: editData.phoneNumber, avatarUrl: finalAvatarUrl || null },
        identity: { identityId: editData.identityId, issueDate: editData.issueDate, issuePlace: editData.issuePlace, frontUrl: finalFrontUrl, backUrl: finalBackUrl },
        company: {
          companyName: editData.companyName,
          businessLicenseNo: editData.businessLicenseNo,
          licenseFileUrl: finalLicenseUrl || null,
          address: { city_id: Number(editData.cityId), ward_id: Number(editData.wardId), street: editData.street },
          email: editData.companyEmail,
          phone: editData.companyPhone,
          description: editData.description || null,
        },
        images,
        companyId,
      });

      if (res?.success) {
        setSubmitSuccess(true);
        setIsEditing(false);
        await fetchRegistration(); // reload
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        const errorMsg = res?.error || res?.message;
        if (errorMsg === "ERR_DUP_PHONE") setSubmitError(d.err_dup_phone);
        else if (errorMsg === "ERR_DUP_IDENTITY") setSubmitError(d.err_dup_identity);
        else if (errorMsg === "ERR_DUP_LICENSE") setSubmitError(d.err_dup_license);
        else setSubmitError(errorMsg || d.resubmit_failed);
      }
    } catch (err: any) {
      if (err.message === "ERR_DUP_PHONE") setSubmitError(d.err_dup_phone);
      else if (err.message === "ERR_DUP_IDENTITY") setSubmitError(d.err_dup_identity);
      else if (err.message === "ERR_DUP_LICENSE") setSubmitError(d.err_dup_license);
      else setSubmitError(err.message || d.resubmit_error_unknown);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const company = registration?.companies;
  const profile = company?.profiles;
  const identity = company?.identities;
  const images = company?.companyImgs || [];
  const logoUrl = images.find((img: any) => img.image_type === "logo")?.image_url || "";
  const licenseUrl = company?.license_file_url || "";
  const galleryImages = images.filter((img: any) => img.image_type !== "logo");

  const canEdit = !loading && !error && registration?.status === "rejected";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 space-y-6 pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-headline">{d.title}</h1>
            {!loading && !error && registration && (
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <StatusBadge status={registration.status} d={d} />
                <span className="text-sm text-on-surface-variant font-body">{d.code}: <span className="font-mono font-semibold text-on-surface">{registration.registration_code}</span></span>
                <span className="text-sm text-on-surface-variant font-body">{d.date}: <span className="font-semibold text-on-surface">{formatDateTime(registration.created_at)}</span></span>
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

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditErrors({}); setSubmitError(null); }}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-outline-variant text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                {d.cancel_edit_btn}
              </button>
              <button
                onClick={handleResubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-primary text-white bg-primary hover:bg-primary/90 cursor-pointer shadow-sm transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{d.resubmit_loading}</> : <><Save className="w-4 h-4" />{d.resubmit_btn}</>}
              </button>
            </>
          ) : (
            <button
              onClick={handleStartEdit}
              disabled={!canEdit}
              title={canEdit ? d.edit_btn_tooltip : d.edit_btn_disabled}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0
                ${canEdit ? "border-primary text-primary bg-primary/5 hover:bg-primary/10 cursor-pointer shadow-sm" : "border-outline-variant text-on-surface-variant/50 bg-surface-container-low cursor-not-allowed"}`}
            >
              <Pencil className="w-4 h-4" />
              {d.edit_btn}
            </button>
          )}
        </div>
      </div>

      {/* Success toast */}
      {submitSuccess && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 text-sm text-emerald-800 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-semibold">{d.resubmit_success}</span>
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-800 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
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
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><FileClock className="w-8 h-8 text-primary/60" /></div>
          <h3 className="text-lg font-bold text-on-surface">{d.empty_title}</h3>
          <p className="text-sm text-on-surface-variant mt-1 mb-5 max-w-sm leading-relaxed">{d.empty_desc}</p>
          <Link href="/register-company" className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-sm font-bold rounded-xl transition-all shadow-sm">{d.empty_btn}</Link>
        </div>
      ) : (
        <>
          {/* Status banner – rejected */}
          {registration.status === "rejected" && registration.note && !isEditing && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-800 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1 text-base">{d.status_rejected_title}</p>
                <p className="text-sm leading-relaxed text-red-700 whitespace-pre-wrap">{registration.note}</p>
                <p className="text-sm font-semibold mt-2 text-red-800 bg-red-100/50 inline-block px-3 py-1 rounded-lg">→ {d.status_rejected_action}</p>
              </div>
            </div>
          )}

          {/* Status banner – resubmitted */}
          {registration.status === "resubmitted" && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800 shadow-sm">
              <RefreshCcw className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1 text-base">{d.status_resubmitted_title}</p>
                <p className="text-sm leading-relaxed text-blue-700">{d.status_resubmitted_desc}</p>
              </div>
            </div>
          )}

          {/* ── 2-column grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ═══ LEFT COLUMN ═══ */}
            <div className="space-y-6">

              {/* 1. Company Info */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_company_title}</h3>
                </div>
                <div className="p-5">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <EditField label={d.field_company_name} value={editData.companyName} onChange={v => setEditData(p => ({ ...p, companyName: v }))} error={editErrors.companyName} />
                      </div>
                      <EditField label={d.field_tax} value={editData.businessLicenseNo} onChange={v => setEditData(p => ({ ...p, businessLicenseNo: v }))} error={editErrors.businessLicenseNo} />
                      <EditField label={d.field_company_phone} value={editData.companyPhone} onChange={v => setEditData(p => ({ ...p, companyPhone: v }))} error={editErrors.companyPhone} />
                      <div className="sm:col-span-2">
                        <EditField label={d.field_company_email} value={editData.companyEmail} onChange={v => setEditData(p => ({ ...p, companyEmail: v }))} type="email" error={editErrors.companyEmail} />
                      </div>
                      {/* Address */}
                      <div>
                        <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.field_city}</label>
                        <select
                          value={editData.cityId}
                          onChange={e => setEditData(p => ({ ...p, cityId: Number(e.target.value) || "", wardId: "" }))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 ${editErrors.cityId ? "border-red-400" : "border-outline-variant focus:border-primary"}`}
                        >
                          <option value="">{d.city_placeholder}</option>
                          {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
                        </select>
                        {editErrors.cityId && <p className="text-xs text-red-600 mt-1">{editErrors.cityId}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.field_ward}</label>
                        <select
                          value={editData.wardId}
                          onChange={e => setEditData(p => ({ ...p, wardId: Number(e.target.value) || "" }))}
                          disabled={!editData.cityId || wardsLoading}
                          className={`w-full px-3 py-2 rounded-lg border text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 ${editErrors.wardId ? "border-red-400" : "border-outline-variant focus:border-primary"} ${!editData.cityId ? "opacity-60" : ""}`}
                        >
                          <option value="">{d.ward_placeholder}</option>
                          {wards.map(w => <option key={w.ward_id} value={w.ward_id}>{w.ward_name}</option>)}
                        </select>
                        {editErrors.wardId && <p className="text-xs text-red-600 mt-1">{editErrors.wardId}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <EditField label={d.field_street} value={editData.street} onChange={v => setEditData(p => ({ ...p, street: v }))} placeholder={d.street_placeholder} error={editErrors.street} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.field_company_desc}</label>
                        <textarea
                          value={editData.description}
                          onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                      <div className="sm:col-span-2"><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.company_name}</label><p className="font-bold text-primary text-base">{company?.company_name || "–"}</p></div>
                      <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.tax_code}</label><p className="font-mono font-medium text-on-surface text-sm">{company?.business_license_no || "–"}</p></div>
                      <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.phone}</label><div className="flex items-center gap-1.5 font-medium text-on-surface text-sm"><Phone className="w-3.5 h-3.5 text-on-surface-variant" />{company?.phone || "–"}</div></div>
                      <div className="sm:col-span-2"><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.email}</label><div className="flex items-center gap-1.5 font-medium text-on-surface text-sm"><Mail className="w-3.5 h-3.5 text-on-surface-variant" />{company?.email || "–"}</div></div>
                      <div className="sm:col-span-2"><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.address}</label><div className="flex items-start gap-1.5 font-medium text-on-surface text-sm bg-surface-container-low p-3 rounded-lg border border-outline-variant/50"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />{address}</div></div>
                      {company?.description && <div className="sm:col-span-2"><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.description}</label><p className="text-sm text-on-surface leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant/50 whitespace-pre-wrap">{company.description}</p></div>}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Images */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_images_title}</h3>
                </div>
                <div className="p-5 space-y-5">
                  {isEditing ? (
                    <>
                      <UploadZone label={d.upload_logo} accept="image/*" defaultValue={editData.logoUrl || null} onChange={f => setEditData(p => ({ ...p, logoFile: f, logoUrl: f ? p.logoUrl : "" }))} />
                      {editErrors.logoFile && <p className="text-xs text-red-600">{editErrors.logoFile}</p>}
                      <div className="pt-4 border-t border-outline-variant/40">
                        <label className="text-xs font-semibold text-on-surface block mb-2">{d.upload_gallery}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {/* 1. Render Existing Gallery */}
                          {editData.galleryExisting.map((url, idx) => (
                            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/60 group bg-surface-container">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setEditData(p => ({ ...p, galleryExisting: p.galleryExisting.filter((_, i) => i !== idx) }))}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/95"
                              ><X className="w-3.5 h-3.5" /></button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-white py-1 text-center font-bold">
                                {idx === 0 ? d.banner : d.image}
                              </div>
                            </div>
                          ))}

                          {/* 2. Render New Uploaded Gallery */}
                          {editData.galleryFiles.map((f, idx) => {
                            // Calculate absolute index across both arrays to know if this is the banner
                            const absoluteIdx = editData.galleryExisting.length + idx;
                            return (
                              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/60 group bg-surface-container">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setEditData(p => ({ ...p, galleryFiles: p.galleryFiles.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/95"><X className="w-3.5 h-3.5" /></button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-white py-1 text-center font-bold">
                                  {absoluteIdx === 0 ? d.banner : d.image}
                                </div>
                              </div>
                            );
                          })}

                          {/* 3. Upload Button */}
                          <label className="relative aspect-square rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/50 hover:bg-surface-container-low flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                              const files = Array.from(e.target.files || []);
                              setEditData(p => ({ ...p, galleryFiles: [...p.galleryFiles, ...files] }));
                            }} />
                            <Plus className="w-6 h-6 text-on-surface-variant" />
                            <span className="text-[11px] font-semibold text-on-surface-variant">{d.gallery_add}</span>
                          </label>
                        </div>
                        {editErrors.galleryFiles && (
                          <p className="text-xs text-red-600 mt-2">{editErrors.galleryFiles}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div><label className="text-xs font-semibold text-on-surface block mb-2">{d.logo}</label><div className="w-24"><ImagePreview url={logoUrl} label={d.logo} onView={setPreviewUrl} aspect="square" d={d} /></div></div>
                      <div className="pt-4 border-t border-outline-variant/40">
                        <label className="text-xs font-semibold text-on-surface flex items-center gap-2 mb-2"><Briefcase className="w-4 h-4 text-on-surface-variant" />{d.gallery} ({galleryImages.length})</label>
                        {galleryImages.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{galleryImages.map((img: any, idx: number) => <div key={img.image_id || idx}><ImagePreview url={img.image_url} label={`Image ${idx + 1}`} onView={setPreviewUrl} aspect="square" d={d} /></div>)}</div>
                        ) : <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg border border-dashed border-outline-variant text-center">{d.no_gallery}</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* ═══ RIGHT COLUMN ═══ */}
            <div className="space-y-6">

              {/* 3. Representative */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_rep_title}</h3>
                </div>
                <div className="p-5 space-y-4">
                  {isEditing ? (
                    <>
                      {/* Avatar upload */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center shrink-0">
                          {(editData.avatarFile ? URL.createObjectURL(editData.avatarFile) : editData.avatarUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={editData.avatarFile ? URL.createObjectURL(editData.avatarFile) : editData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : <User className="w-7 h-7 text-on-surface-variant/50" />}
                        </div>
                        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-outline-variant text-xs text-on-surface-variant cursor-pointer hover:bg-surface-container-low transition-colors">
                          <ImageIcon className="w-3.5 h-3.5" />{d.upload_avatar}
                          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setEditData(p => ({ ...p, avatarFile: f })); }} />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <EditField label={d.field_fullname} value={editData.fullName} onChange={v => setEditData(p => ({ ...p, fullName: v }))} error={editErrors.fullName} />
                        <EditField label={d.field_phone} value={editData.phoneNumber} onChange={v => setEditData(p => ({ ...p, phoneNumber: v }))} error={editErrors.phoneNumber} />
                      </div>
                      {/* CCCD */}
                      <div className="pt-3 border-t border-outline-variant/40">
                        <h4 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-primary" />{d.id_title}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="sm:col-span-2"><EditField label={d.field_cccd} value={editData.identityId} onChange={v => setEditData(p => ({ ...p, identityId: v }))} error={editErrors.identityId} /></div>
                          <EditField label={d.field_issue_date} value={editData.issueDate} onChange={v => setEditData(p => ({ ...p, issueDate: v }))} type="date" error={editErrors.issueDate} />
                          <EditField label={d.field_issue_place} value={editData.issuePlace} onChange={v => setEditData(p => ({ ...p, issuePlace: v }))} error={editErrors.issuePlace} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <UploadZone label={d.upload_cccd_front} accept="image/*" defaultValue={editData.frontUrl || null} onChange={f => setEditData(p => ({ ...p, frontFile: f, frontUrl: f ? p.frontUrl : "" }))} />
                            {editErrors.frontFile && <p className="text-xs text-red-600 mt-1">{editErrors.frontFile}</p>}
                          </div>
                          <div>
                            <UploadZone label={d.upload_cccd_back} accept="image/*" defaultValue={editData.backUrl || null} onChange={f => setEditData(p => ({ ...p, backFile: f, backUrl: f ? p.backUrl : "" }))} />
                            {editErrors.backFile && <p className="text-xs text-red-600 mt-1">{editErrors.backFile}</p>}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center shrink-0">
                          {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : <User className="w-8 h-8 text-on-surface-variant/50" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-base">{profile?.full_name || "–"}</h4>
                          <span className="text-xs text-on-surface-variant font-medium">{d.rep_role}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                        <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.rep_phone}</label><div className="flex items-center gap-1.5 font-medium text-on-surface text-sm"><Phone className="w-3.5 h-3.5 text-on-surface-variant" />{profile?.phone_number || "–"}</div></div>
                        <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.rep_email}</label><div className="flex items-center gap-1.5 font-medium text-on-surface text-sm"><Mail className="w-3.5 h-3.5 text-on-surface-variant" />{profile?.email || "–"}</div></div>
                      </div>
                      <div className="pt-4 border-t border-outline-variant/40">
                        <h4 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-primary" />{d.id_title}</h4>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-4 mb-4">
                          <div className="col-span-2"><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.id_no}</label><p className="font-mono font-medium text-on-surface text-sm">{identity?.identity_id || "–"}</p></div>
                          <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.id_date}</label><div className="flex items-center gap-1.5 font-medium text-on-surface text-sm"><Calendar className="w-3.5 h-3.5 text-on-surface-variant" />{identity?.issue_date ? formatDate(identity.issue_date) : "–"}</div></div>
                          <div><label className="text-xs font-semibold text-on-surface-variant block mb-1">{d.id_place}</label><div className="flex items-center gap-1.5 font-medium text-on-surface text-sm"><MapPin className="w-3.5 h-3.5 text-on-surface-variant" /><span className="truncate">{identity?.issue_place || "–"}</span></div></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] font-semibold text-on-surface-variant block mb-1.5 uppercase tracking-wide">{d.id_front}</label><ImagePreview url={identity?.front_url || ""} label={d.id_front} onView={setPreviewUrl} aspect="video" d={d} /></div>
                          <div><label className="text-[10px] font-semibold text-on-surface-variant block mb-1.5 uppercase tracking-wide">{d.id_back}</label><ImagePreview url={identity?.back_url || ""} label={d.id_back} onView={setPreviewUrl} aspect="video" d={d} /></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 4. Business License */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-surface-container-low border-b border-outline-variant/60 px-5 py-3.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-on-surface text-sm tracking-wider">{d.card_license_title}</h3>
                </div>
                <div className="p-5">
                  {isEditing ? (
                    <>
                      <UploadZone label={d.upload_license} accept="image/*,application/pdf" defaultValue={editData.licenseUrl || null} onChange={f => setEditData(p => ({ ...p, licenseFile: f, licenseUrl: f ? p.licenseUrl : "" }))} />
                      {editErrors.licenseFile && <p className="text-xs text-red-600 mt-2">{editErrors.licenseFile}</p>}
                    </>
                  ) : (
                    <ImagePreview url={licenseUrl} label={d.license_label} onView={setPreviewUrl} aspect="auto" d={d} />
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Floating submit bar when editing (mobile-friendly) */}
          {isEditing && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant px-4 py-3 flex gap-3 z-50 shadow-lg">
              <button onClick={() => { setIsEditing(false); setEditErrors({}); }} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-outline-variant text-on-surface-variant">
                {d.cancel_edit_btn}
              </button>
              <button onClick={handleResubmit} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />{d.resubmit_loading}</> : <><Save className="w-4 h-4" />{d.resubmit_btn}</>}
              </button>
            </div>
          )}

          {/* Lightbox */}
          {previewUrl && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" onClick={() => setPreviewUrl(null)}>
              <button onClick={() => setPreviewUrl(null)} className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"><X className="w-6 h-6" /></button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
