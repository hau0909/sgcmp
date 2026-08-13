"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  IdCard,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Loader2,
  X,
  RefreshCw,
  Edit3,
  Activity,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  FileCheck,
  Award,
  HeartPulse,
} from "lucide-react";
import { requestGetCities, requestGetWards } from "@/features/address";
import type { City, Ward } from "@/features/address/types";
import {
  requestGetGuardMyProfile,
  requestCompleteGuardProfile,
  requestUploadGuardFile,
} from "@/features/guards/api/guard.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

type Gender = "male" | "female";

const SUGGESTED_SKILLS = [
  { key: "skill_first_aid", label: "Sơ cấp cứu cơ bản" },
  { key: "skill_martial_arts", label: "Võ thuật / Tự vệ" },
  { key: "skill_security_control", label: "Kiểm soát an ninh" },
  { key: "skill_cctv", label: "Giám sát CCTV" },
  { key: "skill_emergency_handling", label: "Xử lý tình huống khẩn cấp" },
  { key: "skill_english", label: "Tiếng Anh giao tiếp" },
  { key: "skill_access_control", label: "Kiểm soát ra vào" },
  { key: "skill_patrolling", label: "Tuần tra an ninh" },
];

const isPdf = (urlOrName?: string | null): boolean => {
  if (!urlOrName) return false;
  return urlOrName.toLowerCase().endsWith(".pdf") || urlOrName.toLowerCase().includes("application/pdf");
};

export default function GuardCompleteProfilePage() {
  const router = useRouter();
  const { dict } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states - Section 1: Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Section 2: Personal Details
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [address, setAddress] = useState("");

  // Address dropdowns
  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | "">("");
  const [selectedWardId, setSelectedWardId] = useState<number | "">("");
  const [streetInput, setStreetInput] = useState("");

  // Refs to prevent re-fetching cities and avoid stale closures
  const citiesLoadedRef = useRef(false);
  const initialAddressRef = useRef("");

  // Section 3: Identity states
  const [identityId, setIdentityId] = useState("");
  const [identityIssueDate, setIdentityIssueDate] = useState("");
  const [identityIssuePlace, setIdentityIssuePlace] = useState("");

  // Section 4: Physical Info & Notable Skills
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [notableSkills, setNotableSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Section 5: Files & Certificates
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cccdFrontInputRef = useRef<HTMLInputElement>(null);
  const cccdBackInputRef = useRef<HTMLInputElement>(null);
  const healthCertInputRef = useRef<HTMLInputElement>(null);
  const skillCertInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);

  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);

  const [healthCertFile, setHealthCertFile] = useState<File | null>(null);
  const [healthCertPreview, setHealthCertPreview] = useState<string | null>(null);

  // Skill certificates (Array of existing URLs or newly uploaded object URLs)
  const [skillCertEntries, setSkillCertEntries] = useState<Array<{ url: string; file?: File; isPdf: boolean; name?: string }>>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const t = dict.guard_complete_profile;

  // Fetch guard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await requestGetGuardMyProfile();
      if (res.success && res.data) {
        const p = res.data.profile;
        const g = res.data.guard;
        const iden = res.data.identity;
        setProfileData(res.data);

        setFullName(p?.full_name || "");
        setEmail(p?.email || "");
        setPhoneNumber(p?.phone_number || "");

        setDateOfBirth(p?.date_of_birth ? p.date_of_birth.split("T")[0] : "");
        const gen = (p?.gender || "").toLowerCase();
        setGender(gen === "female" || gen === "nữ" || gen === "nu" ? "female" : "male");
        const initialAddr = p?.address || "";
        setAddress(initialAddr);
        initialAddressRef.current = initialAddr;

        if (p?.avatar_url) setAvatarPreview(p.avatar_url);

        if (iden) {
          setIdentityId(iden.identity_id || "");
          setIdentityIssueDate(iden.issue_date ? iden.issue_date.split("T")[0] : "");
          setIdentityIssuePlace(iden.issue_place || "");
          if (iden.front_url) setCccdFrontPreview(iden.front_url);
          if (iden.back_url) setCccdBackPreview(iden.back_url);
        }

        if (g) {
          setHeightCm(g.height_cm ? String(g.height_cm) : "");
          setWeightKg(g.weight_kg ? String(g.weight_kg) : "");
          setNotableSkills(Array.isArray(g.notable_skills) ? g.notable_skills : []);
          if (g.health_certificate_path) {
            setHealthCertPreview(g.health_certificate_path);
          }
          if (Array.isArray(g.skill_certificate_paths)) {
            setSkillCertEntries(
              g.skill_certificate_paths.map((url: string) => ({
                url,
                isPdf: isPdf(url),
                name: url.split("/").pop() || "Chứng chỉ kỹ năng",
              }))
            );
          }
        }

        // If status is pending_profile or rejected, default to editing mode
        if (g?.approval_status === "pending_profile" || g?.approval_status === "rejected" || !g?.approval_status) {
          setIsEditing(true);
        } else {
          setIsEditing(false);
        }
      }
    } catch (err: any) {
      console.error("Lỗi lấy thông tin hồ sơ:", err);
      setErrorMessage(err.message || t?.fetch_error || "Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseAddressToInputs = async (rawAddr: string, cityList: City[]) => {
    if (!rawAddr || cityList.length === 0) return;
    const parts = rawAddr.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;

    const rawCity = parts[parts.length - 1];
    const matchedCity = cityList.find(
      (c) =>
        c.city_name.toLowerCase() === rawCity.toLowerCase() ||
        rawCity.toLowerCase().includes(c.city_name.toLowerCase()) ||
        c.city_name.toLowerCase().includes(rawCity.toLowerCase())
    );

    if (matchedCity) {
      setSelectedCityId(matchedCity.city_id);

      if (parts.length >= 2) {
        const rawWard = parts[parts.length - 2];
        const street = parts.slice(0, parts.length - 2).join(", ");
        setStreetInput(street || (parts.length === 2 ? parts[0] : ""));

        try {
          const res = await requestGetWards(matchedCity.city_id);
          if (res?.success && res.wards) {
            setWards(res.wards);
            const matchedWard = res.wards.find(
              (w: Ward) =>
                w.ward_name.toLowerCase() === rawWard.toLowerCase() ||
                rawWard.toLowerCase().includes(w.ward_name.toLowerCase()) ||
                w.ward_name.toLowerCase().includes(rawWard.toLowerCase())
            );
            if (matchedWard) {
              setSelectedWardId(matchedWard.ward_id);
            }
          }
        } catch (err) {
          console.error("Failed to load wards for parsed address:", err);
        }
      } else {
        setStreetInput(parts[0] || "");
      }
    } else {
      setStreetInput(rawAddr);
    }
  };

  // Load cities ONCE on mount
  useEffect(() => {
    async function loadCities() {
      if (citiesLoadedRef.current) return;
      try {
        const res = await requestGetCities();
        if (res?.success && res.cities) {
          setCities(res.cities);
          citiesLoadedRef.current = true;
          const currentAddr = initialAddressRef.current;
          if (currentAddr) {
            void parseAddressToInputs(currentAddr, res.cities);
          }
        }
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    }
    loadCities();
  }, []);

  const handleCitySelect = async (cityIdStr: string) => {
    const cityId = cityIdStr ? Number(cityIdStr) : "";
    setSelectedCityId(cityId);
    setSelectedWardId("");
    setWards([]);
    if (cityId !== "") {
      try {
        const res = await requestGetWards(Number(cityId));
        if (res?.success && res.wards) setWards(res.wards);
      } catch (err) {
        console.error("Failed to load wards:", err);
      }
    }
  };

  // Build address string
  useEffect(() => {
    if (!isEditing) return;
    if (selectedCityId !== "" || selectedWardId !== "" || streetInput.trim() !== "") {
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
      if (parts.length > 0) {
        setAddress(parts.join(", "));
      }
    }
  }, [streetInput, selectedWardId, selectedCityId, wards, cities, isEditing]);

  // Skill helper actions
  const toggleSuggestedSkill = (item: (typeof SUGGESTED_SKILLS)[number]) => {
    if (!isEditing || isSubmitting) return;
    const itemLabel = (t as any)?.[item.key] || item.label;
    const isSelected = notableSkills.includes(itemLabel) || notableSkills.includes(item.label);
    if (isSelected) {
      setNotableSkills((prev) => prev.filter((s) => s !== itemLabel && s !== item.label));
    } else {
      setNotableSkills((prev) => [...prev, itemLabel]);
      setFieldErrors((prev) => ({ ...prev, notableSkills: "" }));
    }
  };

  const handleAddCustomSkill = () => {
    if (!isEditing || isSubmitting) return;
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!notableSkills.includes(trimmed)) {
      setNotableSkills((prev) => [...prev, trimmed]);
      setFieldErrors((prev) => ({ ...prev, notableSkills: "" }));
    }
    setCustomSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!isEditing || isSubmitting) return;
    setNotableSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Skill certificate actions
  const handleAddSkillCertFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newEntries: Array<{ url: string; file?: File; isPdf: boolean; name?: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, skillCerts: t?.validate_file_max_10mb || "File tải lên không được quá 10MB." }));
        return;
      }
      const isFilePdf = isPdf(file.name) || file.type === "application/pdf";
      const objectUrl = URL.createObjectURL(file);
      newEntries.push({
        url: objectUrl,
        file,
        isPdf: isFilePdf,
        name: file.name,
      });
    }

    setSkillCertEntries((prev) => [...prev, ...newEntries]);
    setFieldErrors((prev) => ({ ...prev, skillCerts: "" }));
  };

  const handleRemoveSkillCert = (index: number) => {
    if (!isEditing || isSubmitting) return;
    setSkillCertEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!dateOfBirth) {
      errors.dateOfBirth = t?.validate_dob_required || "Vui lòng chọn ngày sinh.";
    } else {
      const dobDate = new Date(dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dobDate.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        errors.dateOfBirth = t?.validate_dob_future || "Ngày sinh không được ở tương lai.";
      } else {
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age < 18) {
          errors.dateOfBirth = t?.validate_dob_min_age || "Nhân viên bảo vệ phải từ 18 tuổi trở lên.";
        }
      }
    }

    if (!address.trim()) {
      errors.address = t?.validate_address_required || "Vui lòng nhập địa chỉ thường trú.";
    }

    if (!identityId.trim()) {
      errors.identityId = t?.validate_cccd_required || "Vui lòng nhập số CCCD/CMND.";
    } else if (!/^(\d{9}|\d{12})$/.test(identityId.trim())) {
      errors.identityId = t?.validate_cccd_format || "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
    }

    if (!identityIssueDate) {
      errors.identityIssueDate = t?.validate_issue_date_required || "Vui lòng chọn ngày cấp CCCD/CMND.";
    } else {
      const issueDate = new Date(identityIssueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      issueDate.setHours(0, 0, 0, 0);
      if (issueDate > today) {
        errors.identityIssueDate = t?.validate_issue_date_future || "Ngày cấp CCCD/CMND không được ở tương lai.";
      }
    }

    if (!identityIssuePlace.trim()) {
      errors.identityIssuePlace = t?.validate_issue_place_required || "Vui lòng nhập nơi cấp CCCD/CMND.";
    }

    if (!avatarPreview && !avatarFile) {
      errors.avatar = t?.validate_avatar_required || "Vui lòng tải lên ảnh chân dung / ảnh thẻ.";
    }

    if (!cccdFrontPreview && !cccdFrontFile) {
      errors.cccdFront = t?.validate_cccd_front_required || "Vui lòng tải lên ảnh mặt trước CCCD/CMND.";
    }

    if (!cccdBackPreview && !cccdBackFile) {
      errors.cccdBack = t?.validate_cccd_back_required || "Vui lòng tải lên ảnh mặt sau CCCD/CMND.";
    }

    // Section 4 & 5 Validations
    if (!heightCm || isNaN(Number(heightCm)) || Number(heightCm) < 100 || Number(heightCm) > 250) {
      errors.heightCm = t?.validate_height_required || "Vui lòng nhập chiều cao hợp lệ (100 - 250 cm).";
    }

    if (!weightKg || isNaN(Number(weightKg)) || Number(weightKg) < 30 || Number(weightKg) > 200) {
      errors.weightKg = t?.validate_weight_required || "Vui lòng nhập cân nặng hợp lệ (30 - 200 kg).";
    }

    if (!notableSkills || notableSkills.length === 0) {
      errors.notableSkills = t?.validate_skills_required || "Vui lòng chọn hoặc nhập ít nhất một kỹ năng nổi bật.";
    }

    if (!healthCertPreview && !healthCertFile) {
      errors.healthCert = t?.validate_health_cert_required || "Vui lòng tải lên Giấy khám sức khỏe.";
    }

    if (!skillCertEntries || skillCertEntries.length === 0) {
      errors.skillCerts = t?.validate_skill_certs_required || "Vui lòng tải lên ít nhất một Chứng chỉ kỹ năng / nghiệp vụ.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileUpload = async (
    file: File,
    type: "avatar" | "cccd_front" | "cccd_back" | "health_certificate" | "skill_certificate",
    userId: string
  ) => {
    const res = await requestUploadGuardFile(file, userId, type);
    if (!res.success || !res.data?.public_url) {
      throw new Error(res.message || `Không thể tải file ${type}`);
    }
    return res.data.public_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      setErrorMessage(t?.validate_form_error || "Vui lòng kiểm tra lại các trường thông tin còn thiếu hoặc chưa hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const userId = profileData?.profile?.user_id || profileData?.profile?.id;
      if (!userId) {
        throw new Error("Không tìm thấy thông tin tài khoản.");
      }

      let finalAvatarUrl = avatarPreview;
      let finalFrontUrl = cccdFrontPreview;
      let finalBackUrl = cccdBackPreview;
      let finalHealthCertUrl = healthCertPreview;

      // Upload basic photos if new files selected
      if (avatarFile) {
        finalAvatarUrl = await handleFileUpload(avatarFile, "avatar", userId);
      }
      if (cccdFrontFile) {
        finalFrontUrl = await handleFileUpload(cccdFrontFile, "cccd_front", userId);
      }
      if (cccdBackFile) {
        finalBackUrl = await handleFileUpload(cccdBackFile, "cccd_back", userId);
      }

      // Upload health cert if new file selected
      if (healthCertFile) {
        finalHealthCertUrl = await handleFileUpload(healthCertFile, "health_certificate", userId);
      }

      // Upload skill certificates
      const finalSkillCertUrls: string[] = [];
      for (const entry of skillCertEntries) {
        if (entry.file) {
          const uploadedUrl = await handleFileUpload(entry.file, "skill_certificate", userId);
          finalSkillCertUrls.push(uploadedUrl);
        } else if (entry.url && !entry.url.startsWith("blob:")) {
          finalSkillCertUrls.push(entry.url);
        }
      }

      // Submit complete profile
      const res = await requestCompleteGuardProfile({
        date_of_birth: dateOfBirth,
        gender,
        address: address.trim(),
        avatar_url: finalAvatarUrl,
        identity_id: identityId.trim(),
        identity_issue_date: identityIssueDate,
        identity_issue_place: identityIssuePlace.trim(),
        front_url: finalFrontUrl,
        back_url: finalBackUrl,
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        notable_skills: notableSkills,
        health_certificate_path: finalHealthCertUrl || "",
        skill_certificate_paths: finalSkillCertUrls,
      });

      if (!res.success) {
        throw new Error(res.message || t?.submit_error || "Nộp hồ sơ thất bại.");
      }

      setSuccessMessage(t?.submit_success || "Nộp hồ sơ thành công! Hồ sơ của bạn đã được chuyển đến Điều phối viên để xét duyệt.");
      setIsEditing(false);
      await fetchData();
    } catch (err: any) {
      console.error("Lỗi nộp hồ sơ:", err);
      setErrorMessage(err.message || t?.submit_error || "Không thể nộp hồ sơ xét duyệt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileData) {
      const p = profileData.profile;
      const iden = profileData.identity;
      const g = profileData.guard;

      setDateOfBirth(p?.date_of_birth ? p.date_of_birth.split("T")[0] : "");
      const gen = (p?.gender || "").toLowerCase();
      setGender(gen === "female" || gen === "nữ" || gen === "nu" ? "female" : "male");
      const origAddr = p?.address || "";
      setAddress(origAddr);
      if (origAddr && cities.length > 0) {
        void parseAddressToInputs(origAddr, cities);
      }
      setAvatarPreview(p?.avatar_url || null);

      if (iden) {
        setIdentityId(iden.identity_id || "");
        setIdentityIssueDate(iden.issue_date ? iden.issue_date.split("T")[0] : "");
        setIdentityIssuePlace(iden.issue_place || "");
        setCccdFrontPreview(iden.front_url || null);
        setCccdBackPreview(iden.back_url || null);
      }

      if (g) {
        setHeightCm(g.height_cm ? String(g.height_cm) : "");
        setWeightKg(g.weight_kg ? String(g.weight_kg) : "");
        setNotableSkills(Array.isArray(g.notable_skills) ? g.notable_skills : []);
        setHealthCertPreview(g.health_certificate_path || null);
        if (Array.isArray(g.skill_certificate_paths)) {
          setSkillCertEntries(
            g.skill_certificate_paths.map((url: string) => ({
              url,
              isPdf: isPdf(url),
              name: url.split("/").pop() || "Chứng chỉ kỹ năng",
            }))
          );
        }
      }
    }

    setAvatarFile(null);
    setCccdFrontFile(null);
    setCccdBackFile(null);
    setHealthCertFile(null);
    setCustomSkillInput("");
    setFieldErrors({});
    setErrorMessage("");
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
          <p className="text-sm font-medium text-slate-600">{t?.loading || "Đang tải hồ sơ của bạn..."}</p>
        </div>
      </div>
    );
  }

  const approvalStatus = profileData?.guard?.approval_status || "pending_profile";
  const rejectionNote = profileData?.guard?.rejection_note;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="h-7 w-7 text-blue-800" />
              <span>{t?.title || "Hồ sơ nhân viên bảo vệ"}</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {t?.subtitle || "Hoàn thiện thông tin định danh và hồ sơ để Điều phối viên xét duyệt trước khi nhận ca trực."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 transition cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>{t?.btn_edit || "Chỉnh sửa hồ sơ"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>{t?.btn_cancel_edit || "Hủy chỉnh sửa"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit mode warning notice */}
        {isEditing && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs font-medium text-blue-900 flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{t?.edit_mode_title || "Đang ở chế độ chỉnh sửa hồ sơ"}</p>
              <p className="mt-0.5 text-blue-800">
                {t?.edit_mode_desc || "Sau khi gửi thông tin mới, hồ sơ của bạn sẽ chuyển sang trạng thái Chờ duyệt để Điều phối viên kiểm tra lại."}
              </p>
            </div>
          </div>
        )}

        {/* Status Banners */}
        {approvalStatus === "pending_approval" && (
          <div className="rounded-xl border border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-950">
                    {t?.pending_approval_title || "Hồ sơ đang chờ Điều phối viên xét duyệt"}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    {t?.pending_approval_badge || "CHỜ DUYỆT"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                  {t?.pending_approval_desc || "Bạn đã nộp hồ sơ thành công. Điều phối viên đang xem xét và đối soát thông tin của bạn. Khi được duyệt, bạn sẽ có thể nhận lịch trực và vào các phân hệ làm việc."}
                </p>
              </div>
            </div>
          </div>
        )}

        {approvalStatus === "rejected" && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-rose-950">
                    {t?.rejected_title || "Hồ sơ của bạn chưa được duyệt"}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-900">
                    {t?.rejected_badge || "CẦN CẬP NHẬT"}
                  </span>
                </div>
                {rejectionNote && (
                  <div className="mt-2.5 rounded-lg bg-white/90 border border-rose-200 p-3 text-sm text-rose-900 font-medium">
                    <span className="font-bold text-rose-950">{t?.rejected_reason_label || "Lý do từ chối: "} </span>
                    <span>{rejectionNote}</span>
                  </div>
                )}
                <p className="mt-2 text-xs text-rose-700">
                  {t?.rejected_desc || "Vui lòng kiểm tra lại các thông tin được yêu cầu và bấm nút \"Nộp lại hồ sơ xét duyệt\" bên dưới."}
                </p>
              </div>
            </div>
          </div>
        )}

        {approvalStatus === "approved" && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-emerald-950">
                    {t?.approved_title || "Hồ sơ của bạn đã được phê duyệt!"}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                    {t?.approved_badge || "ĐÃ DUYỆT"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-emerald-800">
                  {t?.approved_desc || "Tài khoản của bạn đã sẵn sàng hoạt động. Bạn có thể xem lịch trực, ca làm việc và các báo cáo an ninh."}
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Content / Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Section 1: Basic Info (Read-only from Invitation) */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <User className="h-5 w-5 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {t?.section_account || "1. Thông tin tài khoản"}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <p className="text-xs font-medium text-slate-500">{t?.field_full_name || "Họ và tên"}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{fullName || (t?.not_updated || "Chưa cập nhật")}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <p className="text-xs font-medium text-slate-500">{t?.field_email || "Email"}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 break-all">{email || (t?.not_updated || "Chưa cập nhật")}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <p className="text-xs font-medium text-slate-500">{t?.field_phone || "Số điện thoại"}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{phoneNumber || (t?.not_updated || "Chưa cập nhật")}</p>
              </div>
            </div>
          </section>

          {/* Section 2: Personal Details & Avatar */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Calendar className="h-5 w-5 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {t?.section_personal || "2. Thông tin cá nhân & Ảnh thẻ"}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center text-center">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 2 * 1024 * 1024) {
                        setFieldErrors((prev) => ({ ...prev, avatar: t?.validate_file_max_size || "Ảnh không được quá 2MB." }));
                        return;
                      }
                      setAvatarFile(f);
                      setAvatarPreview(URL.createObjectURL(f));
                      setFieldErrors((prev) => ({ ...prev, avatar: "" }));
                    }
                  }}
                  className="hidden"
                  disabled={!isEditing || isSubmitting}
                />

                <div className="relative">
                  <div
                    onClick={() => isEditing && avatarInputRef.current?.click()}
                    className={`flex h-36 w-36 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-blue-600 bg-blue-50/50 text-blue-800 transition ${
                      isEditing ? "cursor-pointer hover:bg-blue-100/50" : ""
                    }`}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Ảnh thẻ"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-blue-700" />
                        <span className="mt-2 text-xs font-bold">{t?.avatar_upload_btn || "Tải ảnh thẻ"}</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-xs font-bold text-slate-900">{t?.field_avatar || "Ảnh chân dung / thẻ"}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{t?.avatar_hint || "Định dạng JPG, PNG (tối đa 2MB)"}</p>
                {fieldErrors.avatar && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.avatar}</p>
                )}
              </div>

              {/* Personal Details Inputs */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {t?.field_dob || "Ngày sinh"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      max={todayStr}
                      disabled={!isEditing || isSubmitting}
                      onChange={(e) => {
                        setDateOfBirth(e.target.value);
                        if (fieldErrors.dateOfBirth) setFieldErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                      }}
                      className={`h-10 w-full rounded-lg border bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                        fieldErrors.dateOfBirth ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-700"
                      } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                    />
                    {fieldErrors.dateOfBirth && (
                      <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {t?.field_gender || "Giới tính"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={gender}
                      disabled={!isEditing || isSubmitting}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="male">{t?.gender_male || "Nam"}</option>
                      <option value="female">{t?.gender_female || "Nữ"}</option>
                    </select>
                  </div>
                </div>

                {/* Address Selection */}
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {t?.field_address || "Địa chỉ thường trú"} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={selectedCityId}
                        onChange={(e) => handleCitySelect(e.target.value)}
                        disabled={isSubmitting}
                        className="h-10 rounded-lg border border-slate-300 bg-slate-50/50 px-3 text-sm text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                      >
                        <option value="">{t?.select_city || "-- Chọn Tỉnh / Thành phố --"}</option>
                        {cities.map((c) => (
                          <option key={c.city_id} value={c.city_id}>
                            {c.city_name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedWardId}
                        onChange={(e) => setSelectedWardId(e.target.value ? Number(e.target.value) : "")}
                        disabled={isSubmitting || selectedCityId === ""}
                        className="h-10 rounded-lg border border-slate-300 bg-slate-50/50 px-3 text-sm text-slate-900 outline-none focus:border-blue-700 focus:bg-white disabled:bg-slate-100"
                      >
                        <option value="">{t?.select_ward || "-- Chọn Phường / Xã --"}</option>
                        {wards.map((w) => (
                          <option key={w.ward_id} value={w.ward_id}>
                            {w.ward_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="text"
                      value={streetInput}
                      onChange={(e) => setStreetInput(e.target.value)}
                      placeholder={t?.street_placeholder || "Số nhà, tên đường..."}
                      disabled={isSubmitting}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 text-sm text-slate-900 outline-none focus:border-blue-700 focus:bg-white"
                    />

                    {address && (
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold">{t?.full_address_label || "Địa chỉ hoàn chỉnh: "} </span>
                        {address}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      {t?.field_address || "Địa chỉ thường trú"}
                    </label>
                    <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-900">
                      {address || (t?.not_updated || "Chưa cập nhật")}
                    </p>
                  </div>
                )}
                {fieldErrors.address && (
                  <p className="text-xs font-medium text-red-600">{fieldErrors.address}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Identity & CCCD Images */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <IdCard className="h-5 w-5 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {t?.section_identity || "3. Thông tin Căn cước công dân (CCCD/CMND)"}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t?.field_cccd_number || "Số CCCD/CMND"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={identityId}
                  disabled={!isEditing || isSubmitting}
                  onChange={(e) => {
                    setIdentityId(e.target.value.replace(/\D/g, ""));
                    if (fieldErrors.identityId) setFieldErrors((prev) => ({ ...prev, identityId: "" }));
                  }}
                  placeholder={t?.cccd_placeholder || "9 hoặc 12 chữ số"}
                  maxLength={12}
                  className={`h-10 w-full rounded-lg border bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                    fieldErrors.identityId ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-700"
                  } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                />
                {fieldErrors.identityId && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.identityId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t?.field_issue_date || "Ngày cấp"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={identityIssueDate}
                  max={todayStr}
                  disabled={!isEditing || isSubmitting}
                  onChange={(e) => {
                    setIdentityIssueDate(e.target.value);
                    if (fieldErrors.identityIssueDate) setFieldErrors((prev) => ({ ...prev, identityIssueDate: "" }));
                  }}
                  className={`h-10 w-full rounded-lg border bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                    fieldErrors.identityIssueDate ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-700"
                  } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                />
                {fieldErrors.identityIssueDate && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.identityIssueDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t?.field_issue_place || "Nơi cấp"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={identityIssuePlace}
                  disabled={!isEditing || isSubmitting}
                  onChange={(e) => {
                    setIdentityIssuePlace(e.target.value);
                    if (fieldErrors.identityIssuePlace) setFieldErrors((prev) => ({ ...prev, identityIssuePlace: "" }));
                  }}
                  placeholder={t?.issue_place_placeholder || "VD: Cục Cảnh sát QLHC về TTXH"}
                  className={`h-10 w-full rounded-lg border bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                    fieldErrors.identityIssuePlace ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-700"
                  } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                />
                {fieldErrors.identityIssuePlace && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.identityIssuePlace}</p>
                )}
              </div>
            </div>

            {/* CCCD 2 Sides Upload */}
            <div className="grid gap-6 sm:grid-cols-2 pt-3">
              {/* Front Image */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  {t?.field_cccd_front || "Ảnh mặt trước CCCD"} <span className="text-red-500">*</span>
                </label>
                <input
                  ref={cccdFrontInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 2 * 1024 * 1024) {
                        setFieldErrors((prev) => ({ ...prev, cccdFront: t?.validate_file_max_size || "Ảnh không được quá 2MB." }));
                        return;
                      }
                      setCccdFrontFile(f);
                      setCccdFrontPreview(URL.createObjectURL(f));
                      setFieldErrors((prev) => ({ ...prev, cccdFront: "" }));
                    }
                  }}
                  className="hidden"
                  disabled={!isEditing || isSubmitting}
                />

                <div
                  onClick={() => isEditing && cccdFrontInputRef.current?.click()}
                  className={`relative aspect-[16/10] overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center transition ${
                    isEditing ? "cursor-pointer hover:border-blue-600 hover:bg-blue-50/30" : ""
                  }`}
                >
                  {cccdFrontPreview ? (
                    <img src={cccdFrontPreview} alt="Mặt trước CCCD" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-xs font-bold text-slate-700">{t?.upload_front_btn || "Tải ảnh mặt trước"}</p>
                      <p className="text-[11px] text-slate-500">{t?.photo_clear_hint || "Chụp rõ nét, không lóa sáng"}</p>
                    </div>
                  )}
                </div>
                {fieldErrors.cccdFront && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.cccdFront}</p>
                )}
              </div>

              {/* Back Image */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  {t?.field_cccd_back || "Ảnh mặt sau CCCD"} <span className="text-red-500">*</span>
                </label>
                <input
                  ref={cccdBackInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 2 * 1024 * 1024) {
                        setFieldErrors((prev) => ({ ...prev, cccdBack: t?.validate_file_max_size || "Ảnh không được quá 2MB." }));
                        return;
                      }
                      setCccdBackFile(f);
                      setCccdBackPreview(URL.createObjectURL(f));
                      setFieldErrors((prev) => ({ ...prev, cccdBack: "" }));
                    }
                  }}
                  className="hidden"
                  disabled={!isEditing || isSubmitting}
                />

                <div
                  onClick={() => isEditing && cccdBackInputRef.current?.click()}
                  className={`relative aspect-[16/10] overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center transition ${
                    isEditing ? "cursor-pointer hover:border-blue-600 hover:bg-blue-50/30" : ""
                  }`}
                >
                  {cccdBackPreview ? (
                    <img src={cccdBackPreview} alt="Mặt sau CCCD" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-xs font-bold text-slate-700">{t?.upload_back_btn || "Tải ảnh mặt sau"}</p>
                      <p className="text-[11px] text-slate-500">{t?.photo_clear_hint || "Chụp rõ nét, không lóa sáng"}</p>
                    </div>
                  )}
                </div>
                {fieldErrors.cccdBack && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.cccdBack}</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: Physical Info & Notable Skills */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Activity className="h-5 w-5 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {t?.section_physical_skills || "4. Thông tin Thể chất & Kỹ năng nghiệp vụ"}
              </h2>
            </div>

            {/* Height & Weight */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t?.field_height || "Chiều cao (cm)"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={heightCm}
                    disabled={!isEditing || isSubmitting}
                    onChange={(e) => {
                      setHeightCm(e.target.value);
                      if (fieldErrors.heightCm) setFieldErrors((prev) => ({ ...prev, heightCm: "" }));
                    }}
                    placeholder={t?.height_placeholder || "VD: 175"}
                    className={`h-10 w-full rounded-lg border bg-slate-50/50 px-3 pr-12 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                      fieldErrors.heightCm ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-700"
                    } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">cm</span>
                </div>
                {fieldErrors.heightCm && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.heightCm}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t?.field_weight || "Cân nặng (kg)"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={30}
                    max={200}
                    value={weightKg}
                    disabled={!isEditing || isSubmitting}
                    onChange={(e) => {
                      setWeightKg(e.target.value);
                      if (fieldErrors.weightKg) setFieldErrors((prev) => ({ ...prev, weightKg: "" }));
                    }}
                    placeholder={t?.weight_placeholder || "VD: 70"}
                    className={`h-10 w-full rounded-lg border bg-slate-50/50 px-3 pr-12 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                      fieldErrors.weightKg ? "border-red-500 focus:border-red-500" : "border-slate-300 focus:border-blue-700"
                    } disabled:bg-slate-100 disabled:cursor-not-allowed`}
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">kg</span>
                </div>
                {fieldErrors.weightKg && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.weightKg}</p>
                )}
              </div>
            </div>

            {/* Notable Skills */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t?.field_notable_skills || "Kỹ năng nổi bật"} <span className="text-red-500">*</span>
              </label>

              {isEditing ? (
                <>
                  <p className="text-xs text-slate-500">
                    {t?.skills_hint || "Chọn từ danh sách gợi ý hoặc tự nhập thêm kỹ năng của bạn"}
                  </p>

                  {/* Suggested chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SUGGESTED_SKILLS.map((item) => {
                      const itemLabel = (t as any)?.[item.key] || item.label;
                      const isSelected = notableSkills.includes(itemLabel) || notableSkills.includes(item.label);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => toggleSuggestedSkill(item)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-blue-800 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                          }`}
                        >
                          {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          <span>{itemLabel}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Skill Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      disabled={isSubmitting}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder={t?.skill_input_placeholder || "Nhập kỹ năng khác rồi nhấn Enter..."}
                      className="h-10 flex-1 rounded-lg border border-slate-300 bg-slate-50/50 px-3 text-sm text-slate-900 outline-none transition focus:border-blue-700 focus:bg-white"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting || !customSkillInput.trim()}
                      onClick={handleAddCustomSkill}
                      className="flex h-10 items-center gap-1.5 rounded-lg bg-slate-800 px-4 text-xs font-bold text-white transition hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{t?.btn_add_skill || "Thêm"}</span>
                    </button>
                  </div>
                </>
              ) : null}

              {/* Selected skills list */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-600 mb-2">
                  {t?.selected_skills_title || "Kỹ năng đã chọn:"}
                </p>
                {notableSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {notableSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-900"
                      >
                        <Award className="h-3.5 w-3.5 text-blue-700" />
                        <span>{skill}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 text-blue-400 hover:text-red-600 transition cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {t?.no_skills_selected || "Chưa có kỹ năng nào được chọn."}
                  </p>
                )}
              </div>
              {fieldErrors.notableSkills && (
                <p className="text-xs font-medium text-red-600">{fieldErrors.notableSkills}</p>
              )}
            </div>
          </section>

          {/* Section 5: Health & Skill Certificates */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <FileCheck className="h-5 w-5 text-blue-800" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {t?.section_certificates || "5. Giấy khám sức khỏe & Chứng chỉ nghề nghiệp"}
              </h2>
            </div>

            {/* Health Certificate Upload (1 file/photo/PDF) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t?.field_health_cert || "Giấy khám sức khỏe"} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t?.health_cert_hint || "Định dạng JPG, PNG, WEBP hoặc PDF (tối đa 10MB)"}
                  </p>
                </div>

                {isEditing && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => healthCertInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-950 transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{t?.upload_health_cert_btn || "Tải lên Giấy khám sức khỏe"}</span>
                  </button>
                )}
              </div>

              <input
                ref={healthCertInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (f.size > 10 * 1024 * 1024) {
                      setFieldErrors((prev) => ({ ...prev, healthCert: t?.validate_file_max_10mb || "File không được quá 10MB." }));
                      return;
                    }
                    setHealthCertFile(f);
                    setHealthCertPreview(URL.createObjectURL(f));
                    setFieldErrors((prev) => ({ ...prev, healthCert: "" }));
                  }
                }}
                className="hidden"
                disabled={!isEditing || isSubmitting}
              />

              {healthCertPreview ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {isPdf(healthCertPreview) || healthCertFile?.type === "application/pdf" ? (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                        <FileText className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <img src={healthCertPreview} alt="Giấy khám sức khỏe" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">
                        {healthCertFile?.name || healthCertPreview.split("/").pop() || "Giấy khám sức khỏe"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isPdf(healthCertPreview) || healthCertFile?.type === "application/pdf"
                          ? (t?.file_pdf_label || "Tài liệu PDF")
                          : "Hình ảnh"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={healthCertPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>{t?.view_file || "Xem file"}</span>
                    </a>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setHealthCertFile(null);
                          setHealthCertPreview(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{t?.remove_file || "Xóa"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => isEditing && healthCertInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition ${
                    isEditing ? "cursor-pointer hover:border-blue-600 hover:bg-blue-50/40" : ""
                  }`}
                >
                  <HeartPulse className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-xs font-bold text-slate-700">
                    {t?.upload_health_cert_btn || "Tải lên Giấy khám sức khỏe"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t?.health_cert_hint || "Định dạng JPG, PNG, WEBP hoặc PDF (tối đa 10MB)"}
                  </p>
                </div>
              )}
              {fieldErrors.healthCert && (
                <p className="text-xs font-medium text-red-600">{fieldErrors.healthCert}</p>
              )}
            </div>

            {/* Skill Certificates Multi-Upload */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t?.field_skill_certs || "Chứng chỉ kỹ năng / nghiệp vụ"} <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t?.skill_certs_hint || "Có thể tải lên nhiều chứng chỉ (JPG, PNG, WEBP, PDF - tối đa 10MB/file)"}
                  </p>
                </div>

                {isEditing && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => skillCertInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-950 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t?.upload_skill_cert_btn || "Thêm chứng chỉ"}</span>
                  </button>
                )}
              </div>

              <input
                ref={skillCertInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={(e) => {
                  handleAddSkillCertFiles(e.target.files);
                  e.target.value = "";
                }}
                className="hidden"
                disabled={!isEditing || isSubmitting}
              />

              {/* Certificate grid */}
              {skillCertEntries.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {skillCertEntries.map((cert, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {cert.isPdf ? (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                            <FileText className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="h-10 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <img src={cert.url} alt="Chứng chỉ" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {cert.name || `Chứng chỉ ${idx + 1}`}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {cert.isPdf ? (t?.file_pdf_label || "Tài liệu PDF") : "Hình ảnh"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-600 hover:text-blue-800 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                          title={t?.view_file || "Xem file"}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillCert(idx)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100/60 rounded-lg transition cursor-pointer"
                            title={t?.remove_file || "Xóa"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => isEditing && skillCertInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition ${
                    isEditing ? "cursor-pointer hover:border-blue-600 hover:bg-blue-50/40" : ""
                  }`}
                >
                  <Award className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-xs font-bold text-slate-700">
                    {t?.upload_skill_cert_btn || "Thêm chứng chỉ"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t?.skill_certs_hint || "Có thể tải lên nhiều chứng chỉ (JPG, PNG, WEBP, PDF - tối đa 10MB/file)"}
                  </p>
                </div>
              )}
              {fieldErrors.skillCerts && (
                <p className="text-xs font-medium text-red-600">{fieldErrors.skillCerts}</p>
              )}
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {t?.btn_cancel || "Hủy bỏ"}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-900 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t?.btn_submitting || "Đang gửi hồ sơ..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>
                        {approvalStatus === "rejected"
                          ? (t?.btn_resubmit || "Nộp lại hồ sơ xét duyệt")
                          : approvalStatus === "approved"
                          ? (t?.btn_update_resubmit || "Cập nhật & Gửi duyệt lại")
                          : (t?.btn_submit || "Gửi hồ sơ xét duyệt")}
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-900 transition cursor-pointer"
              >
                <Edit3 className="h-5 w-5" />
                <span>{t?.btn_edit_bottom || "Chỉnh sửa thông tin hồ sơ"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
