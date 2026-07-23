"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Edit, Mail, Phone, User, UserRound, X, IdCard } from "lucide-react";
import { requestGetCities, requestGetWards } from "@/features/address";
import type { City, Ward } from "@/features/address/types";

import { requestGetGuardDetail, requestUploadGuardFile, requestUpdateGuardProfile } from "@/features/guards/api/guard.api";
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
                  {dict.guard_detail?.status_active}
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {dict.guard_detail?.status_inactive}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm font-medium text-slate-600">
              {dict.guard_detail?.subtitle}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {dict.guard_detail?.cancel}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded bg-blue-800 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:opacity-50"
            >
              {saving ? dict.guard_detail?.saving : dict.guard_detail?.save}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
            {dict.guard_detail?.edit_profile}
          </button>
        )}
      </div>

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
                      <p className="text-sm font-medium text-slate-500">Email</p>

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
