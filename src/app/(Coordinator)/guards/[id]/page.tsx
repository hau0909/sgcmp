"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, CheckCircle2, Edit, Mail, Phone, User, UserRound, X, XCircle, IdCard, AlertTriangle, Activity, FileCheck, FileText, Award, ExternalLink } from "lucide-react";
import { requestGetCities, requestGetWards } from "@/features/address";
import type { City, Ward } from "@/features/address/types";

import {
  requestGetGuardDetail,
  requestUploadGuardFile,
  requestUpdateGuardProfile,
  requestApproveRejectGuard,
} from "@/features/guards/api/guard.api";
import type { GuardDetail, GuardDetailProfile, gender } from "@/features/guards/type";

const getProfile = (
  profiles: GuardDetail["profiles"],
): GuardDetailProfile | null => {
  if (!profiles) {
    return null;
  }

  if (Array.isArray(profiles)) {
    return profiles[0] ?? null;
  }

  return profiles;
};

const formatDate = (date: string | null | undefined, notUpdated: string): string => {
  if (!date) {
    return notUpdated;
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("vi-VN").format(parsedDate);
};

const formatGender = (gender: string | null | undefined, male: string, female: string, notUpdated: string): string => {
  if (!gender) {
    return notUpdated;
  }

  const normalizedGender = gender.trim().toLowerCase();

  if (normalizedGender === "male" || normalizedGender === "nam") {
    return male;
  }

  if (normalizedGender === "female" || normalizedGender === "nữ" || normalizedGender === "nu") {
    return female;
  }

  return gender;
};

import { useTranslation } from "@/components/providers/LanguageProvider";

export default function GuardDetailPage() {
  const router = useRouter();
  const { dict } = useTranslation();
  const params = useParams<{ id: string | string[] }>();

  const guardId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [guard, setGuard] = useState<GuardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Approval & Rejection states
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cccdFrontInputRef = useRef<HTMLInputElement>(null);
  const cccdBackInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "male" as gender,
    identity_id: "",
    identity_issue_date: "",
    identity_issue_place: "",
    address: "",
    phone_number: "",
    email: "",
  });

  // Address dropdowns
  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | "">("");
  const [selectedWardId, setSelectedWardId] = useState<number | "">("");
  const [streetInput, setStreetInput] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const fetchGuardDetail = async (silent = false) => {
    if (!guardId) {
      setErrorMessage(dict.guard_detail?.error_guard_not_found ?? "Guard not found");
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      setErrorMessage("");

      const result = await requestGetGuardDetail(guardId);

      if (!result.success || !result.data) {
        throw new Error(result.message);
      }

      setGuard(result.data);
    } catch (error: unknown) {
      setGuard(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : (dict.guard_detail?.error_load_guard ?? "Unable to load guard information"),
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchGuardDetail();
  }, [guardId]);

  // Load cities on mount
  useEffect(() => {
    async function loadCities() {
      try {
        setLoadingCities(true);
        const res = await requestGetCities();
        if (res?.success && res.cities) setCities(res.cities);
      } catch (err) {
        console.error("Failed to load cities:", err);
      } finally {
        setLoadingCities(false);
      }
    }
    loadCities();
  }, []);

  // Load wards when city changes
  useEffect(() => {
    setSelectedWardId("");
    setWards([]);
    if (selectedCityId === "") return;
    async function loadWards() {
      try {
        setLoadingWards(true);
        const res = await requestGetWards(Number(selectedCityId));
        if (res?.success && res.wards) setWards(res.wards);
      } catch (err) {
        console.error("Failed to load wards:", err);
      } finally {
        setLoadingWards(false);
      }
    }
    loadWards();
  }, [selectedCityId]);

  // Auto-build address string from street + ward + city
  useEffect(() => {
    const parts: string[] = [];
    if (streetInput.trim()) parts.push(streetInput.trim());
    if (selectedWardId !== "") {
      const ward = wards.find((w) => w.ward_id === selectedWardId);
      if (ward) parts.push(ward.ward_name);
    }
    if (selectedCityId !== "") {
      const city = cities.find((c) => c.city_id === selectedCityId);
      if (city) parts.push(city.city_name);
    }
    setFormData((prev) => ({ ...prev, address: parts.join(", ") }));
  }, [streetInput, selectedWardId, selectedCityId, wards, cities]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (guard) {
      const p = getProfile(guard.profiles);
      const iden = guard.identity;
      const g = p?.gender?.trim().toLowerCase();
      setFormData({
        full_name: p?.full_name ?? "",
        date_of_birth: p?.date_of_birth ?? "",
        gender: (g === "female" || g === "nữ" || g === "nu" ? "female" : "male") as gender,
        identity_id: iden?.identity_id ?? "",
        identity_issue_date: iden?.issue_date ?? "",
        identity_issue_place: iden?.issue_place ?? "",
        address: p?.address ?? "",
        phone_number: p?.phone_number ?? "",
        email: p?.email ?? "",
      });
      setAvatarPreview(p?.avatar_url ?? null);
      setCccdFrontPreview(iden?.front_url ?? null);
      setCccdBackPreview(iden?.back_url ?? null);
      setAvatarFile(null);
      setCccdFrontFile(null);
      setCccdBackFile(null);
    }
  }, [guard]);

  const handleCancel = () => {
    if (guard) {
      const p = getProfile(guard.profiles);
      const iden = guard.identity;
      const g = p?.gender?.trim().toLowerCase();
      setFormData({
        full_name: p?.full_name ?? "",
        date_of_birth: p?.date_of_birth ?? "",
        gender: (g === "female" || g === "nữ" || g === "nu" ? "female" : "male") as gender,
        identity_id: iden?.identity_id ?? "",
        identity_issue_date: iden?.issue_date ?? "",
        identity_issue_place: iden?.issue_place ?? "",
        address: p?.address ?? "",
        phone_number: p?.phone_number ?? "",
        email: p?.email ?? "",
      });
      setAvatarPreview(p?.avatar_url ?? null);
      setCccdFrontPreview(iden?.front_url ?? null);
      setCccdBackPreview(iden?.back_url ?? null);
    }
    setAvatarFile(null);
    setCccdFrontFile(null);
    setCccdBackFile(null);
    setFieldErrors({});
    setEditError("");
    setIsEditing(false);
  };

  const handleApprove = async () => {
    if (!guardId || isApproving || isRejecting) return;
    try {
      setIsApproving(true);
      setApprovalError("");
      const res = await requestApproveRejectGuard(guardId, { action: "approve" });
      if (!res.success) {
        throw new Error(res.message || (dict.guard_detail?.error_approve_failed ?? "Duyệt hồ sơ thất bại."));
      }
      setToastMessage(dict.guard_detail?.toast_approved ?? "Duyệt hồ sơ bảo vệ thành công!");
      await fetchGuardDetail(true);
    } catch (err: any) {
      console.error("Approve guard error:", err);
      setApprovalError(err.message || (dict.guard_detail?.error_approve_generic ?? "Không thể duyệt hồ sơ."));
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardId || isApproving || isRejecting) return;
    if (!rejectionReason.trim()) {
      setApprovalError(dict.guard_detail?.error_reject_required ?? "Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      setIsRejecting(true);
      setApprovalError("");
      const res = await requestApproveRejectGuard(guardId, {
        action: "reject",
        rejection_note: rejectionReason.trim(),
      });
      if (!res.success) {
        throw new Error(res.message || (dict.guard_detail?.error_reject_failed ?? "Từ chối hồ sơ thất bại."));
      }
      setToastMessage(dict.guard_detail?.toast_rejected ?? "Đã từ chối hồ sơ bảo vệ!");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      await fetchGuardDetail(true);
    } catch (err: any) {
      console.error("Reject guard error:", err);
      setApprovalError(err.message || (dict.guard_detail?.error_reject_generic ?? "Không thể từ chối hồ sơ."));
    } finally {
      setIsRejecting(false);
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      nextErrors.full_name = dict.guard_detail?.validate_name_required ?? "Please enter full name.";
    } else {
      const name = formData.full_name;
      const nameRegex = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;

      if (name.startsWith(" ") || name.endsWith(" ")) {
        nextErrors.full_name = dict.guard_detail?.validate_name_no_leading_trailing_space ?? "Full name must not have leading or trailing spaces.";
      } else if (/\s{2,}/.test(name)) {
        nextErrors.full_name = dict.guard_detail?.validate_name_no_multiple_spaces ?? "Full name must not contain multiple consecutive spaces.";
      } else if (!nameRegex.test(name)) {
        nextErrors.full_name = dict.guard_detail?.validate_name_letters_only ?? "Full name must contain only letters and spaces between words.";
      }
    }

    if (!formData.date_of_birth) {
      nextErrors.date_of_birth = dict.guard_detail?.validate_dob_required ?? "Please select date of birth.";
    } else {
      const dobDate = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dobDate.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        nextErrors.date_of_birth = dict.guard_detail?.validate_dob_future ?? "Date of birth cannot be in the future.";
      } else {
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }

        if (age < 18) {
          nextErrors.date_of_birth = dict.guard_detail?.validate_dob_min_age ?? "Security guards must be at least 18 years old.";
        }
      }
    }

    if (!formData.identity_id.trim()) {
      nextErrors.identity_id = dict.guard_detail?.validate_cccd_required ?? "Please enter ID card number.";
    } else if (!/^(\d{9}|\d{12})$/.test(formData.identity_id.trim())) {
      nextErrors.identity_id = dict.guard_detail?.validate_cccd_format ?? "ID card number must be 9 or 12 digits.";
    }

    if (!formData.identity_issue_date) {
      nextErrors.identity_issue_date = dict.guard_detail?.validate_issue_date_required ?? "Please select the ID card issue date.";
    } else {
      const issueDate = new Date(formData.identity_issue_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      issueDate.setHours(0, 0, 0, 0);
      if (issueDate > today) {
        nextErrors.identity_issue_date = dict.guard_detail?.validate_issue_date_future ?? "ID card issue date cannot be in the future.";
      }
    }

    if (!formData.identity_issue_place.trim()) {
      nextErrors.identity_issue_place = dict.guard_detail?.validate_issue_place_required ?? "Please enter the ID card issue place.";
    } else {
      const issuePlaceRegex = /^[\p{L}\p{M}0-9\s]+$/u;
      if (!issuePlaceRegex.test(formData.identity_issue_place.trim())) {
        nextErrors.identity_issue_place = dict.guard_detail?.validate_issue_place_special_chars ?? "Issue place must not contain special characters.";
      }
    }

    if (!formData.address.trim()) {
      nextErrors.address = dict.guard_detail?.validate_address_required ?? "Please enter permanent address.";
    } else {
      const addressRegex = /^[\p{L}\p{M}0-9\s,\/.-]+$/u;
      if (!addressRegex.test(formData.address.trim())) {
        nextErrors.address = dict.guard_detail?.validate_address_special_chars ?? "Address must not contain special characters.";
      }
    }

    if (!formData.phone_number.trim()) {
      nextErrors.phone_number = dict.guard_detail?.validate_phone_required ?? "Please enter phone number.";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone_number.trim())) {
      nextErrors.phone_number = dict.guard_detail?.validate_phone_invalid ?? "Invalid phone number.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = dict.guard_detail?.validate_email_required ?? "Please enter email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = dict.guard_detail?.validate_email_invalid ?? "Invalid email.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setEditError(dict.guard_detail?.validate_form_error ?? "Please review the invalid information.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setEditError("");

      if (!guard?.user_id) {
        throw new Error(dict.guard_detail?.error_no_account ?? "Guard account information not found.");
      }

      let currentAvatarUrl = avatarPreview;
      let currentFrontUrl = cccdFrontPreview;
      let currentBackUrl = cccdBackPreview;

      // 1. Upload avatar if selected
      if (avatarFile) {
        const res = await requestUploadGuardFile(
          avatarFile,
          guard.user_id,
          "avatar",
        );
        if (res.success && res.data) {
          currentAvatarUrl = res.data.public_url;
        } else {
          throw new Error(res.message || (dict.guard_detail?.error_upload_avatar ?? "Unable to upload avatar"));
        }
      }

      // 2. Upload CCCD Front if selected
      if (cccdFrontFile) {
        const res = await requestUploadGuardFile(
          cccdFrontFile,
          guard.user_id,
          "cccd_front",
        );
        if (res.success && res.data) {
          currentFrontUrl = res.data.public_url;
        } else {
          throw new Error(res.message || (dict.guard_detail?.error_upload_front ?? "Unable to upload ID card front image"));
        }
      }

      // 3. Upload CCCD Back if selected
      if (cccdBackFile) {
        const res = await requestUploadGuardFile(
          cccdBackFile,
          guard.user_id,
          "cccd_back",
        );
        if (res.success && res.data) {
          currentBackUrl = res.data.public_url;
        } else {
          throw new Error(res.message || (dict.guard_detail?.error_upload_back ?? "Unable to upload ID card back image"));
        }
      }

      // 4. Save details
      const res = await requestUpdateGuardProfile(guardId, {
        user_id: guard?.user_id,
        ...formData,
        avatar_url: currentAvatarUrl,
        front_url: currentFrontUrl,
        back_url: currentBackUrl,
      });

      if (!res.success) {
        throw new Error(res.message || (dict.guard_detail?.error_save_profile ?? "Unable to update profile"));
      }

      setIsEditing(false);
      setToastMessage(dict.guard_detail?.toast_updated ?? "Guard information updated successfully.");
      await fetchGuardDetail(true);
    } catch (error: unknown) {
      setEditError(
        error instanceof Error ? error.message : (dict.guard_detail?.error_save_generic ?? "An error occurred while saving the profile"),
      );
    } finally {
      setSaving(false);
    }
  };

  const profile = useMemo(() => {
    return guard ? getProfile(guard.profiles) : null;
  }, [guard]);

  const identity = guard?.identity ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <div className="rounded-md border border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-500">
            {dict.guard_detail?.loading}
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !guard) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.guard_detail?.cancel ?? dict.coordinator?.detail_go_back ?? "Go Back"}
        </button>

        <div className="rounded-md border border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-red-600">
            {errorMessage || dict.guard_detail?.not_found}
          </p>
        </div>
      </div>
    );
  }

  const notUpdated = dict.guard_detail?.not_found ?? "N/A";
  const notUpdatedLabel = dict.coor_guards?.not_updated ?? "Not updated";
  const fullName = profile?.full_name ?? notUpdatedLabel;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={dict.coordinator?.detail_go_back ?? "Go Back"}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {isEditing ? (
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-16 w-16 cursor-pointer group rounded-md overflow-hidden border border-slate-300 shadow-sm"
              title={dict.guard_detail?.avatar_click_hint}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={dict.guard_detail?.avatar_click_hint ?? "Avatar preview"}
                  className="h-full w-full object-cover transition group-hover:brightness-50"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500 transition group-hover:bg-slate-300">
                  <UserRound className="h-7 w-7" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 text-white">
                <Edit className="h-4 w-4" />
              </div>
            </div>
          ) : profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={fullName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-md border border-slate-300 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-slate-300 bg-slate-200 text-slate-500">
              <UserRound className="h-7 w-7" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-950">
                {fullName}
              </h1>

              {profile?.status === "active" ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {dict.guard_detail?.status_active || "HOẠT ĐỘNG"}
                </span>
              ) : profile?.status === "banned" ? (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {dict.guard_detail?.status_banned || "ĐÃ BỊ KHÓA"}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {dict.guard_detail?.status_inactive || "VÔ HIỆU HÓA"}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm font-medium text-slate-600">
              {dict.guard_detail?.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Approval Status Banner & Action Buttons */}
      <div className="mb-6">
        {guard?.approval_status === "pending_approval" ? (
          <div className="rounded-xl border border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-amber-950">
                      {dict.guard_detail?.banner_pending_approval_title ?? "Hồ sơ bảo vệ đang chờ xét duyệt"}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                      {dict.guard_detail?.banner_pending_approval_badge ?? "CHỜ DUYỆT"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-amber-800">
                    {dict.guard_detail?.banner_pending_approval_desc ?? "Nhân viên bảo vệ đã hoàn thiện thông tin cá nhân và ảnh CCCD. Vui lòng đối soát kỹ trước khi phê duyệt."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={isApproving || isRejecting}
                  onClick={() => {
                    setRejectionReason("");
                    setApprovalError("");
                    setIsRejectModalOpen(true);
                  }}
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-red-300 bg-white px-4 text-sm font-bold text-red-700 shadow-xs transition hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  <span>{dict.guard_detail?.btn_reject ?? "Từ chối"}</span>
                </button>

                <button
                  type="button"
                  disabled={isApproving || isRejecting}
                  onClick={handleApprove}
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
                >
                  {isApproving ? (
                    <span>{dict.guard_detail?.btn_approving ?? "Đang duyệt..."}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{dict.guard_detail?.btn_approve ?? "Duyệt hồ sơ"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : guard?.approval_status === "rejected" ? (
          <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white shadow-xs">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-rose-950">
                      {dict.guard_detail?.banner_rejected_title ?? "Hồ sơ đã bị từ chối"}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-900">
                      {dict.guard_detail?.banner_rejected_badge ?? "ĐÃ TỪ CHỐI"}
                    </span>
                  </div>
                  {guard.rejection_note && (
                    <div className="mt-2 rounded-lg bg-white/80 border border-rose-200 p-3 text-xs text-rose-900">
                      <span className="font-bold">{dict.guard_detail?.rejection_reason_label ?? "Lý do từ chối: "}</span>
                      <span>{guard.rejection_note}</span>
                    </div>
                  )}
                  {guard.verified_at && (
                    <p className="mt-1.5 text-[11px] text-rose-600">
                      {dict.guard_detail?.rejection_time_label ?? "Thời gian từ chối: "}{formatDate(guard.verified_at?.split("T")[0], "")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : guard?.approval_status === "approved" ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  {dict.guard_detail?.banner_approved_title ?? "Hồ sơ bảo vệ đã được phê duyệt hợp lệ"}
                </h3>
                <p className="text-xs text-emerald-700">
                  {dict.guard_detail?.banner_approved_desc ?? "Nhân viên có thể nhận ca trực và thực hiện các nhiệm vụ an ninh."}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center rounded-full bg-emerald-200 px-3 py-1 text-xs font-bold text-emerald-900">
              {dict.guard_detail?.banner_approved_badge ?? "ĐÃ DUYỆT"}
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-400 text-white">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {dict.guard_detail?.banner_pending_profile_title ?? "Chờ bảo vệ điền hồ sơ"}
                </h3>
                <p className="text-xs text-slate-600">
                  {dict.guard_detail?.banner_pending_profile_desc ?? "Bảo vệ cần xác thực email và nộp các thông tin chi tiết (CCCD, địa chỉ, ảnh...)."}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
              {dict.guard_detail?.banner_pending_profile_badge ?? "CHỜ ĐIỀN HỒ SƠ"}
            </span>
          </div>
        )}
      </div>

      {approvalError && (
        <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{approvalError}</p>
        </div>
      )}

      {editError && (
        <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{editError}</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <User className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                {dict.guard_detail?.section_personal}
              </h2>
            </div>

            <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_fullname} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.full_name
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                    {fieldErrors.full_name && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_dob}
                    </label>
                    <input
                      type="date"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.date_of_birth
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_of_birth: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.date_of_birth && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.date_of_birth}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_gender}
                    </label>
                    <select
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as gender,
                        })
                      }
                    >
                      <option value="male">{dict.guard_detail?.gender_male}</option>
                      <option value="female">{dict.guard_detail?.gender_female}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_cccd} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.identity_id
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.identity_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identity_id: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.identity_id && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.identity_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_issue_date}
                    </label>
                    <input
                      type="date"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.identity_issue_date
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.identity_issue_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identity_issue_date: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.identity_issue_date && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.identity_issue_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_issue_place}
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.identity_issue_place
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.identity_issue_place}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identity_issue_place: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.identity_issue_place && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.identity_issue_place}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_address}
                    </label>
                    {/* City + Ward dropdowns */}
                    <div className="grid gap-2 md:grid-cols-2 mb-2">
                      <div>
                        <label className="text-xs font-medium text-slate-400 mb-1 block">{dict.guard_detail?.field_city}</label>
                        <select
                          value={selectedCityId}
                          disabled={loadingCities}
                          onChange={(e) => setSelectedCityId(e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full rounded border px-3 py-2 text-sm focus:outline-none border-slate-300 focus:border-blue-500`}
                        >
                          <option value="">{loadingCities ? dict.guard_detail?.city_loading : dict.guard_detail?.city_placeholder}</option>
                          {cities.map((c) => (
                            <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-400 mb-1 block">{dict.guard_detail?.field_ward}</label>
                        <select
                          value={selectedWardId}
                          disabled={loadingWards || selectedCityId === ""}
                          onChange={(e) => setSelectedWardId(e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full rounded border px-3 py-2 text-sm focus:outline-none border-slate-300 focus:border-blue-500`}
                        >
                          <option value="">{loadingWards ? dict.guard_detail?.ward_loading : selectedCityId === "" ? dict.guard_detail?.ward_select_city_first : dict.guard_detail?.ward_placeholder}</option>
                          {wards.map((w) => (
                            <option key={w.ward_id} value={w.ward_id}>{w.ward_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* Street */}
                    <div className="mb-2">
                      <label className="text-xs font-medium text-slate-400 mb-1 block">{dict.guard_detail?.field_street}</label>
                      <input
                        type="text"
                        value={streetInput}
                        placeholder={dict.guard_detail?.field_street_placeholder}
                        onChange={(e) => setStreetInput(e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Preview of full address */}
                    <input
                      type="text"
                      readOnly
                      value={formData.address}
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none bg-slate-50 text-slate-500 ${fieldErrors.address
                        ? "border-red-500"
                        : "border-slate-200"
                        }`}
                      placeholder={dict.guard_detail?.field_address_placeholder}
                    />
                    {fieldErrors.address && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <InfoItem label={dict.guard_detail?.field_fullname ?? "Full Name"} value={fullName} />

                  <InfoItem
                    label={dict.guard_detail?.field_dob ?? "Date of Birth"}
                    value={formatDate(profile?.date_of_birth, notUpdatedLabel)}
                  />

                  <InfoItem
                    label={dict.guard_detail?.field_gender ?? "Gender"}
                    value={formatGender(profile?.gender, dict.guard_detail?.gender_male ?? "Male", dict.guard_detail?.gender_female ?? "Female", notUpdatedLabel)}
                  />

                  <InfoItem
                    label={dict.guard_detail?.field_cccd ?? "CCCD/CMND"}
                    value={identity?.identity_id ?? notUpdatedLabel}
                  />

                  <InfoItem
                    label={dict.guard_detail?.field_issue_date ?? "Issue Date"}
                    value={formatDate(identity?.issue_date, notUpdatedLabel)}
                  />

                  <InfoItem
                    label={dict.guard_detail?.field_issue_place ?? "Issue Place"}
                    value={identity?.issue_place ?? notUpdatedLabel}
                  />

                  <div className="md:col-span-2">
                    <InfoItem
                      label={dict.guard_detail?.field_address ?? "Permanent Address"}
                      value={profile?.address ?? notUpdatedLabel}
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <IdCard className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                {dict.guard_detail?.section_cccd}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <CccdPreviewBox
                label={dict.guard_detail?.cccd_front ?? "ID Card Front"}
                imageUrl={isEditing ? cccdFrontPreview : identity?.front_url}
                isEditing={isEditing}
                onClick={() => cccdFrontInputRef.current?.click()}
                noImageLabel={dict.guard_detail?.no_image}
                uploadLabel={dict.guard_detail?.upload_image}
                clickToChangeLabel={dict.guard_detail?.click_to_change}
              />

              <CccdPreviewBox
                label={dict.guard_detail?.cccd_back ?? "ID Card Back"}
                imageUrl={isEditing ? cccdBackPreview : identity?.back_url}
                isEditing={isEditing}
                onClick={() => cccdBackInputRef.current?.click()}
                noImageLabel={dict.guard_detail?.no_image}
                uploadLabel={dict.guard_detail?.upload_image}
                clickToChangeLabel={dict.guard_detail?.click_to_change}
              />
            </div>

            {/* Hidden File Inputs for Editing */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
                  const MAXIMUM_IMAGE_SIZE = 2 * 1024 * 1024;
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    setEditError(dict.guard_detail?.error_avatar_format ?? "Avatar only supports JPG or PNG format.");
                    e.target.value = "";
                    return;
                  }
                  if (file.size > MAXIMUM_IMAGE_SIZE) {
                    setEditError(dict.guard_detail?.error_avatar_size ?? "Avatar file size must not exceed 2MB.");
                    e.target.value = "";
                    return;
                  }
                  setEditError("");
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
            <input
              type="file"
              ref={cccdFrontInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    setEditError(dict.guard_detail?.error_front_format ?? "ID card front only supports JPG or PNG format.");
                    e.target.value = "";
                    return;
                  }
                  setEditError("");
                  setCccdFrontFile(file);
                  setCccdFrontPreview(URL.createObjectURL(file));
                }
              }}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
            <input
              type="file"
              ref={cccdBackInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
                  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                    setEditError(dict.guard_detail?.error_back_format ?? "ID card back only supports JPG or PNG format.");
                    e.target.value = "";
                    return;
                  }
                  setEditError("");
                  setCccdBackFile(file);
                  setCccdBackPreview(URL.createObjectURL(file));
                }
              }}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />
          </section>

          {/* Section: Physical Info & Notable Skills */}
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <Activity className="h-4 w-4 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                {dict.guard_complete_profile?.section_physical_skills ?? "Thông tin Thể chất & Kỹ năng"}
              </h2>
            </div>

            <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
              <InfoItem
                label={dict.guard_complete_profile?.field_height ?? "Chiều cao"}
                value={guard?.height_cm ? `${guard.height_cm} cm` : notUpdatedLabel}
              />
              <InfoItem
                label={dict.guard_complete_profile?.field_weight ?? "Cân nặng"}
                value={guard?.weight_kg ? `${guard.weight_kg} kg` : notUpdatedLabel}
              />

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-slate-500 mb-1.5">
                  {dict.guard_complete_profile?.field_notable_skills ?? "Kỹ năng nổi bật"}
                </p>
                {Array.isArray(guard?.notable_skills) && guard.notable_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {guard.notable_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-900"
                      >
                        <Award className="h-3.5 w-3.5 text-blue-700" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">{notUpdatedLabel}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section: Health Certificate & Skill Certificates */}
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm space-y-4">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <FileCheck className="h-4 w-4 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                {dict.guard_complete_profile?.section_certificates ?? "Giấy khám sức khỏe & Chứng chỉ"}
              </h2>
            </div>

            {/* Health Certificate */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">
                {dict.guard_complete_profile?.field_health_cert ?? "Giấy khám sức khỏe"}
              </p>
              {guard?.health_certificate_path ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3 max-w-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-rose-600 shrink-0" />
                    <span className="truncate text-xs font-semibold text-slate-800">
                      {guard.health_certificate_path.split("/").pop() || "Giấy khám sức khỏe"}
                    </span>
                  </div>
                  <a
                    href={guard.health_certificate_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Xem file</span>
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">{notUpdatedLabel}</p>
              )}
            </div>

            {/* Skill Certificates */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-500 mb-2">
                {dict.guard_complete_profile?.field_skill_certs ?? "Chứng chỉ kỹ năng / nghiệp vụ"}
              </p>
              {Array.isArray(guard?.skill_certificate_paths) && guard.skill_certificate_paths.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {guard.skill_certificate_paths.map((certUrl, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate text-xs font-semibold text-slate-800">
                          {certUrl.split("/").pop() || `Chứng chỉ ${idx + 1}`}
                        </span>
                      </div>
                      <a
                        href={certUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Xem file</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">{notUpdatedLabel}</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
              <Mail className="h-4 w-4 text-blue-800" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                {dict.guard_detail?.section_contact}
              </h2>
            </div>

            <div className="space-y-5">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      {dict.guard_detail?.field_phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${fieldErrors.phone_number
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-blue-500"
                        }`}
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                    />
                    {fieldErrors.phone_number && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.phone_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      autoComplete="off"
                      readOnly
                      disabled
                      className="w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                      value={formData.email}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-slate-500" />

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {dict.guard_detail?.field_phone}
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {profile?.phone_number ?? notUpdatedLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-slate-500" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">{dict.guard_detail?.field_email ?? "Email"}</p>

                      <p className="mt-1 break-all text-sm font-bold text-slate-950">
                        {profile?.email ?? notUpdatedLabel}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reject Modal */}
      <RejectGuardModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setApprovalError("");
        }}
        reason={rejectionReason}
        setReason={setRejectionReason}
        onSubmit={handleReject}
        isSubmitting={isRejecting}
        error={approvalError}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );

}
function CccdPreviewBox({
  label,
  imageUrl,
  isEditing,
  onClick,
  noImageLabel,
  uploadLabel,
  clickToChangeLabel,
}: {
  label: string;
  imageUrl?: string | null;
  isEditing?: boolean;
  onClick?: () => void;
  noImageLabel?: string;
  uploadLabel?: string;
  clickToChangeLabel?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>

      {imageUrl ? (
        <div
          onClick={isEditing ? onClick : undefined}
          className={`relative aspect-[16/10] overflow-hidden rounded-md border border-slate-300 ${isEditing ? "cursor-pointer group" : ""
            }`}
          title={isEditing ? clickToChangeLabel : undefined}
        >
          <img
            src={imageUrl}
            alt={label}
            className={`h-full w-full object-cover ${isEditing ? "transition group-hover:brightness-50" : ""
              }`}
          />
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/45 text-white">
              <Edit className="h-6 w-6" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={isEditing ? onClick : undefined}
          className={`flex aspect-[16/10] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-100 ${isEditing ? "cursor-pointer hover:bg-slate-200 transition group" : ""
            }`}
          title={isEditing ? clickToChangeLabel : undefined}
        >
          <div className="text-center">
            <User
              className={`mx-auto h-8 w-8 text-slate-400 ${isEditing ? "group-hover:text-blue-500 transition" : ""
                }`}
            />

            <p
              className={`mt-2 text-sm font-medium text-slate-500 ${isEditing ? "group-hover:text-blue-600 transition" : ""
                }`}
            >
              {noImageLabel}
            </p>
            {isEditing && (
              <p className="mt-1 text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                {uploadLabel}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Reject Modal Component
function RejectGuardModal({
  isOpen,
  onClose,
  reason,
  setReason,
  onSubmit,
  isSubmitting,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  setReason: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  error?: string;
}) {
  const { dict } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-red-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {dict.guard_detail?.modal_reject_title ?? "Từ chối hồ sơ bảo vệ"}
              </h3>
              <p className="text-xs text-slate-500">
                {dict.guard_detail?.modal_reject_desc ?? "Nhập lý do để bảo vệ biết và chỉnh sửa lại"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              {dict.guard_detail?.modal_reject_label ?? "Lý do từ chối"} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={dict.guard_detail?.modal_reject_placeholder ?? "VD: Ảnh CCCD mặt trước bị mờ, vui lòng chụp lại rõ nét hơn..."}
              rows={4}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {dict.guard_detail?.modal_reject_cancel ?? "Hủy"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (dict.guard_detail?.modal_reject_submitting ?? "Đang xử lý...") : (dict.guard_detail?.modal_reject_submit ?? "Xác nhận từ chối")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
