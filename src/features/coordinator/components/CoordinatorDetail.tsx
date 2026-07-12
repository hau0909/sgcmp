"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  Shield,
  Briefcase,
  CreditCard,
  Image as ImageIcon,
  Edit2,
  Save,
  X,
  AlertCircle,
  Camera,
  CheckCircle2
} from "lucide-react";
import { requestGetCoordinatorDetail, requestUpdateCoordinator } from "../api/coordinator.api";
import { requestGetCities, requestGetWards } from "@/features/address/api/address.api";
import { UpdateCoordinatorPayload, City, Ward } from "../types";
import {
  validateCoordinatorFullName,
  validateCoordinatorPhone,
  validateCoordinatorGender,
  validateCoordinatorAge,
  validateCoordinatorCity,
  validateCoordinatorWard,
  validateCoordinatorStreet,
  validateIdentityNumber,
  validateIdentityIssueDate,
  validateIdentityIssuePlace,
} from "../validator/coordinator.validator";

// Reusable SectionCard from AddForm style
function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-outline-variant bg-surface-container-lowest">
        <span className="text-primary w-4 h-4 flex items-center justify-center">{icon}</span>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-error animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{msg}</span>
    </div>
  );
}

// Display/Edit widget for Field Values
function FieldDisplay({ 
  label, 
  value, 
  isEditing, 
  onChange,
  type = "text",
  options,
  disabled = false,
  error
}: { 
  label: string, 
  value: string | React.ReactNode, 
  isEditing?: boolean,
  onChange?: (val: string) => void,
  type?: "text" | "date" | "select",
  options?: {label: string, value: string | number}[],
  disabled?: boolean,
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</span>
      {isEditing ? (
        type === "select" ? (
          <select 
            value={value as string || ""} 
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 min-h-[38px] bg-surface-container-low/30 border focus:outline-none focus:ring-1 rounded-lg text-sm font-medium text-on-surface outline-none disabled:opacity-50 transition-all ${
              error 
                ? "border-error focus:border-error focus:ring-error/30" 
                : "border-outline-variant/60 focus:border-primary focus:ring-primary"
            }`}
          >
            <option value="">Chọn một tùy chọn</option>
            {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input 
            type={type}
            value={value as string || ""}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 min-h-[38px] bg-surface-container-low/30 border focus:outline-none focus:ring-1 rounded-lg text-sm font-medium text-on-surface disabled:opacity-50 transition-all ${
              error 
                ? "border-error focus:border-error focus:ring-error/30" 
                : "border-outline-variant/60 focus:border-primary focus:ring-primary"
            }`}
          />
        )
      ) : (
        <div className="w-full px-3 py-2 min-h-[38px] bg-surface-container-low/30 border border-outline-variant/50 rounded-lg text-sm font-medium text-on-surface flex items-center">
          {value || <span className="text-on-surface-variant/50 italic">Đang cập nhật</span>}
        </div>
      )}
      <FieldError msg={error} />
    </div>
  );
}

export default function CoordinatorDetail({ coordinatorId }: { coordinatorId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Extend payload internally with temp fields
  interface internalEditPayload extends Partial<UpdateCoordinatorPayload> {
    city_id?: string | number;
    ward_id?: string | number;
    street?: string;
  }
  const [editForm, setEditForm] = useState<internalEditPayload>({});

  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [pendingWardName, setPendingWardName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string>("");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadToStorage = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) throw new Error(`Upload lỗi: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await requestGetCoordinatorDetail(coordinatorId);
      setData(response);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi lấy thông tin điều phối viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    requestGetCities()
      .then((res: any) => setCities(res?.cities || res || []))
      .catch(console.error);
  }, [coordinatorId]);

  // Load wards when city changes during edit
  useEffect(() => {
    if (!editForm.city_id || editForm.city_id === "") { 
      setWards([]); 
      return; 
    }
    setWardsLoading(true);
    requestGetWards(Number(editForm.city_id))
      .then((res: any) => {
        const loadedWards = res?.wards || res || [];
        setWards(loadedWards);
        // Match pending ward name if resolving after initial parse
        if (pendingWardName) {
          const matchWard = loadedWards.find((w: Ward) => w.ward_name === pendingWardName);
          if (matchWard) {
            setEditForm(prev => ({ ...prev, ward_id: matchWard.ward_id }));
          }
          setPendingWardName("");
        }
      })
      .catch(console.error)
      .finally(() => setWardsLoading(false));
  }, [editForm.city_id]);

  const handleEditToggle = () => {
    if (!data) return;
    
    // Parse address logic using ", " separator
    const rawAddress = data.profiles?.address || "";
    let initialStreet = rawAddress;
    let initialCityId: number | string = "";
    let initialWardId: number | string = "";
    
    const parts = rawAddress.split(", ").map((s: string) => s.trim());
    if (parts.length >= 2 && cities.length > 0) {
      const pCity = parts[parts.length - 1];
      const matchCity = cities.find(c => c.city_name === pCity);
      if (matchCity) {
        initialCityId = matchCity.city_id;
        if (parts.length >= 3) {
          const pWard = parts[parts.length - 2];
          initialStreet = parts.slice(0, parts.length - 2).join(", ");
          
          // If cities match, we might already have the wards loaded
          if (String(editForm.city_id) === String(initialCityId) && wards.length > 0) {
            const matchWard = wards.find(w => w.ward_name === pWard);
            if (matchWard) initialWardId = matchWard.ward_id;
          } else {
            setPendingWardName(pWard);
          }
        } else {
          initialStreet = parts.slice(0, parts.length - 1).join(", ");
        }
      }
    }

    setEditForm({
      fullName: data.profiles?.full_name || "",
      phoneNumber: data.profiles?.phone_number || "",
      gender: data.profiles?.gender || "",
      dateOfBirth: data.profiles?.date_of_birth || "",
      address: data.profiles?.address || "", 
      city_id: initialCityId,
      ward_id: initialWardId,
      street: initialStreet,
      identityId: data.identity?.identity_id || "",
      issueDate: data.identity?.issue_date || "",
      issuePlace: data.identity?.issue_place || "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
    setPendingWardName("");
    setAvatarFile(null);
    setAvatarPreview("");
    setFrontFile(null);
    setFrontPreview("");
    setBackFile(null);
    setBackPreview("");
    setErrors({});
  };

  const handleSaveEdit = async () => {
    try {
      setErrors({});
      
      // -- Bắt đầu Client Validation toàn bộ form --
      const newErrors: Record<string, string> = {};

      const fullNameErr = validateCoordinatorFullName(editForm.fullName || "");
      if (fullNameErr) newErrors.fullName = fullNameErr;

      const phoneErr = validateCoordinatorPhone(editForm.phoneNumber || "");
      if (phoneErr) newErrors.phoneNumber = phoneErr;

      const genderErr = validateCoordinatorGender(editForm.gender || "");
      if (genderErr) newErrors.gender = genderErr;

      const ageErr = validateCoordinatorAge(editForm.dateOfBirth || "");
      if (ageErr) newErrors.dateOfBirth = ageErr;

      const cityErr = validateCoordinatorCity(editForm.city_id ? Number(editForm.city_id) : "");
      if (cityErr) newErrors.city_id = cityErr;

      const wardErr = validateCoordinatorWard(editForm.ward_id ? Number(editForm.ward_id) : "");
      if (wardErr) newErrors.ward_id = wardErr;

      const streetErr = validateCoordinatorStreet(editForm.street || "");
      if (streetErr) newErrors.street = streetErr;

      const idErr = validateIdentityNumber(editForm.identityId || "");
      if (idErr) newErrors.identityId = idErr;

      const dateErr = validateIdentityIssueDate(editForm.issueDate || "", editForm.dateOfBirth || "");
      if (dateErr) newErrors.issueDate = dateErr;

      const placeErr = validateIdentityIssuePlace(editForm.issuePlace || "");
      if (placeErr) newErrors.issuePlace = placeErr;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      setIsSaving(true);
      
      const cityObj = cities.find((c) => c.city_id === Number(editForm.city_id));
      const wardObj = wards.find((w) => w.ward_id === Number(editForm.ward_id));
      const fullAddress = [editForm.street, wardObj?.ward_name, cityObj?.city_name].filter(Boolean).join(", ");
      
      const ext = (f: File) => f.name.split(".").pop()?.toLowerCase() || "jpg";
      const userId = data.profiles.user_id;

      let aUrl = "";
      let fUrl = "";
      let bUrl = "";

      if (avatarFile) aUrl = await uploadToStorage(avatarFile, "profiles", `${userId}/avatar.${ext(avatarFile)}`);
      if (frontFile) fUrl = await uploadToStorage(frontFile, "profiles", `${userId}/identity/front.${ext(frontFile)}`);
      if (backFile) bUrl = await uploadToStorage(backFile, "profiles", `${userId}/identity/back.${ext(backFile)}`);

      const finalPayload: UpdateCoordinatorPayload = {
        fullName: editForm.fullName || "",
        phoneNumber: editForm.phoneNumber || "",
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth,
        address: fullAddress,
        identityId: editForm.identityId || "",
        issueDate: editForm.issueDate || "",
        issuePlace: editForm.issuePlace || "",
        ...(aUrl && { avatarUrl: aUrl }),
        ...(fUrl && { frontUrl: fUrl }),
        ...(bUrl && { backUrl: bUrl }),
      };

      const res = await requestUpdateCoordinator(coordinatorId, finalPayload);
      if (res.success) {
        setIsEditing(false);
        await fetchDetail(); // refresh data
        setToastMessage("Cập nhật thông tin thành công!");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        if (res.field) {
          setErrors({ [res.field]: res.message });
        } else {
          alert(res.message);
        }
      }
    } catch (err: any) {
      alert("Cập nhật thất bại: " + (err?.message || "Lỗi không xác định"));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
        <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex flex-col items-center justify-center py-12">
          <p className="font-semibold text-lg">{error || "Không tìm thấy Điều phối viên"}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-surface text-on-surface shadow-sm border border-outline-variant hover:bg-surface-container rounded-lg">Quay lại</button>
        </div>
      </div>
    );
  }

  const profile = data?.profiles || {};
  const identity = data?.identity || {};

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hoạt động':
      case 'active':
        return { text: 'Hoạt động', bg: 'bg-[#bbf7d0]', color: 'text-[#166534]' };
      case 'tạm khóa':
      case 'locked':
        return { text: 'Tạm khóa', bg: 'bg-[#fef08a]', color: 'text-[#854d0e]' };
      default:
        return { text: 'Vô hiệu hóa', bg: 'bg-[#fecaca]', color: 'text-[#991b1b]' };
    }
  };
  const status = getStatusConfig(profile.status);

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col gap-1 border-b border-outline-variant/60 pb-4 mt-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant hover:text-primary transition-colors w-fit mb-1 cursor-pointer"
        >
          <ArrowLeft className="w-[15px] h-[15px]" />
          Quay lại danh sách
        </button>
        
        <div className="flex items-center justify-between mt-1">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
              Chi tiết Điều phối viên
            </h2>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body">
              Xem toàn bộ thông tin hồ sơ của điều phối viên.
            </p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 flex items-center gap-2 rounded-lg bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-4 py-2 flex items-center gap-2 rounded-lg bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Lưu thay đổi
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                disabled={loading}
                className="px-4 py-2 flex items-center gap-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid (3 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Loading overlay for saving */}
        {isSaving && (
          <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="border border-outline-variant rounded-2xl bg-surface-container-lowest p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex flex-col relative">
            
            {/* Avatar & Name */}
            <div className="flex flex-col items-center mt-2">
              <div 
                className={`w-24 h-24 rounded-full border-[3px] border-surface-container flex items-center justify-center overflow-hidden bg-primary/10 text-primary text-4xl font-bold mb-4 shadow-sm ring-1 ring-outline-variant/30 ${isEditing ? "cursor-pointer hover:border-primary transition-colors" : ""}`}
                onClick={() => isEditing && avatarInputRef.current?.click()}
              >
                {avatarPreview || profile.avatar_url ? (
                  <img src={avatarPreview || profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (isEditing ? editForm.fullName : profile.full_name)?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={(e) => handleImageChange(e, setAvatarFile, setAvatarPreview)} />
              
              {isEditing ? (
                <div className="w-full mb-1.5 flex flex-col items-center">
                  <input
                    type="text"
                    value={editForm.fullName || ""}
                    onChange={(e) => {
                      setEditForm({ ...editForm, fullName: e.target.value });
                      setErrors({ ...errors, fullName: "" });
                    }}
                    className={`w-full text-center text-xl font-bold text-on-surface bg-transparent border-b-2 outline-none px-2 py-1 transition-all ${
                      errors.fullName ? "border-error focus:border-error" : "border-primary/50 focus:border-primary"
                    }`}
                    placeholder="Họ và tên"
                  />
                  <FieldError msg={errors.fullName} />
                </div>
              ) : (
                <h2 className="text-xl font-bold text-on-surface text-center mb-1.5">
                  {profile.full_name}
                </h2>
              )}
              
              {/* Status Inline */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${status.bg} ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-outline-variant/40 mb-6" />

            {/* Quick Contact Block */}
            <div className="w-full space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/40">
                <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center shrink-0 border border-outline-variant/20 shadow-sm">
                  <Phone className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="flex flex-col w-full flex-1">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Số điện thoại</span>
                  {isEditing ? (
                    <div className="w-full flex flex-col gap-1">
                      <input
                        type="tel"
                        value={editForm.phoneNumber || ""}
                        onChange={(e) => {
                          setEditForm({...editForm, phoneNumber: e.target.value});
                          setErrors({...errors, phoneNumber: ""});
                        }}
                        className={`text-sm font-semibold font-mono text-primary w-full bg-transparent border-b outline-none transition-all ${
                          errors.phoneNumber ? "border-error focus:border-error" : "border-primary/50 focus:border-primary"
                        }`}
                      />
                      <FieldError msg={errors.phoneNumber} />
                    </div>
                  ) : (
                    <span className="text-sm font-semibold font-mono text-primary">{profile.phone_number || "---"}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/40">
                <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center shrink-0 border border-outline-variant/20 shadow-sm">
                  <Mail className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Email</span>
                  <span className="text-sm font-medium break-all text-on-surface-variant/70 italic cursor-not-allowed" title="Không thể thay đổi email">{profile.email || "---"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Thông tin cá nhân */}
          <SectionCard icon={<User />} title="Thông tin cá nhân">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldDisplay 
                label="Giới tính" 
                isEditing={isEditing}
                error={errors.gender}
                value={isEditing ? editForm.gender : (
                  profile.gender?.toLowerCase() === "male" || profile.gender?.toLowerCase() === "nam" ? "Nam" : 
                  profile.gender?.toLowerCase() === "female" || profile.gender?.toLowerCase() === "nữ" ? "Nữ" : 
                  profile.gender || "---"
                )}
                onChange={(val) => {
                  setEditForm({...editForm, gender: val});
                  setErrors({...errors, gender: ""});
                }}
                type="select"
                options={[
                  { label: "Nam", value: "Nam" },
                  { label: "Nữ", value: "Nữ" }
                ]}
              />
              <FieldDisplay 
                label="Ngày sinh" 
                isEditing={isEditing}
                error={errors.dateOfBirth}
                type="date"
                value={isEditing ? editForm.dateOfBirth : profile.date_of_birth} 
                onChange={(val) => {
                  setEditForm({...editForm, dateOfBirth: val});
                  setErrors({...errors, dateOfBirth: ""});
                }}
              />

              {/* Address Fields */}
              <div className="sm:col-span-2 mt-2">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldDisplay 
                      label="Tỉnh / Thành phố" 
                      isEditing={isEditing}
                      error={errors.city_id}
                      value={editForm.city_id || ""}
                      onChange={(val) => {
                        setEditForm({...editForm, city_id: val, ward_id: ""});
                        setErrors({...errors, city_id: ""});
                      }}
                      type="select"
                      options={cities.map(c => ({ label: c.city_name, value: c.city_id }))}
                    />
                    <FieldDisplay 
                      label="Phường / Xã" 
                      isEditing={isEditing}
                      error={errors.ward_id}
                      value={editForm.ward_id || ""}
                      onChange={(val) => {
                        setEditForm({...editForm, ward_id: val});
                        setErrors({...errors, ward_id: ""});
                      }}
                      type="select"
                      disabled={!editForm.city_id || wardsLoading}
                      options={wards.map(w => ({ label: w.ward_name, value: w.ward_id }))}
                    />
                    <div className="sm:col-span-2">
                      <FieldDisplay 
                        label="Địa chỉ chi tiết (số nhà, đường)" 
                        isEditing={isEditing}
                        error={errors.street}
                        value={editForm.street || ""} 
                        onChange={(val) => {
                          setEditForm({...editForm, street: val});
                          setErrors({...errors, street: ""});
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <FieldDisplay 
                    label="Địa chỉ liên hệ" 
                    value={profile.address} 
                  />
                )}
              </div>
            </div>
          </SectionCard>

          {/* Thông tin định danh & Ảnh CCCD */}
          <SectionCard icon={<CreditCard />} title="Thông tin định danh (CCCD/CMND)">
            <div className="flex flex-col gap-6">
              
              {/* Phần Text */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <FieldDisplay 
                    label="Số thẻ CCCD / CMND" 
                    isEditing={isEditing}
                    error={errors.identityId}
                    value={isEditing ? editForm.identityId : (identity?.identity_id ? <span className="font-mono text-primary font-bold tracking-wider">{identity.identity_id}</span> : "")} 
                    onChange={(val) => {
                      setEditForm({...editForm, identityId: val});
                      setErrors({...errors, identityId: ""});
                    }}
                  />
                </div>
                <FieldDisplay 
                  label="Ngày cấp" 
                  type="date"
                  isEditing={isEditing}
                  error={errors.issueDate}
                  value={isEditing ? editForm.issueDate : identity.issue_date} 
                  onChange={(val) => {
                    setEditForm({...editForm, issueDate: val});
                    setErrors({...errors, issueDate: ""});
                  }}
                />
                <FieldDisplay 
                  label="Nơi cấp" 
                  isEditing={isEditing}
                  error={errors.issuePlace}
                  value={isEditing ? editForm.issuePlace : identity.issue_place} 
                  onChange={(val) => {
                    setEditForm({...editForm, issuePlace: val});
                    setErrors({...errors, issuePlace: ""});
                  }}
                />
              </div>

              <div className="w-full h-px bg-outline-variant/50" />

              {/* Phần Ảnh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mặt trước CCCD</span>
                  <div className="w-full relative aspect-[1.6] rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center">
                    {frontPreview || identity.front_url ? (
                      <div 
                        className={`w-full h-full p-0.5 relative group ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={() => isEditing && frontInputRef.current?.click()}
                      >
                        <img 
                          src={frontPreview || identity.front_url} 
                          alt="CCCD Front" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {isEditing && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                              <Camera className="w-8 h-8 text-white" />
                           </div>
                        )}
                      </div>
                    ) : (
                      isEditing ? (
                        <div 
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors"
                          onClick={() => frontInputRef.current?.click()}
                        >
                           <ImageIcon className="w-6 h-6 text-on-surface-variant/50 mb-1" />
                           <span className="text-sm font-semibold text-primary">Tải lên mặt trước</span>
                        </div>
                      ) : (
                        <span className="text-sm text-on-surface-variant/50 font-medium">Chưa cập nhật ảnh</span>
                      )
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={frontInputRef} onChange={(e) => handleImageChange(e, setFrontFile, setFrontPreview)} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mặt sau CCCD</span>
                  <div className="w-full relative aspect-[1.6] rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center">
                    {backPreview || identity.back_url ? (
                      <div 
                        className={`w-full h-full p-0.5 relative group ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={() => isEditing && backInputRef.current?.click()}
                      >
                        <img 
                          src={backPreview || identity.back_url} 
                          alt="CCCD Back" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {isEditing && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer">
                              <Camera className="w-8 h-8 text-white" />
                           </div>
                        )}
                      </div>
                    ) : (
                      isEditing ? (
                        <div 
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors"
                          onClick={() => backInputRef.current?.click()}
                        >
                           <ImageIcon className="w-6 h-6 text-on-surface-variant/50 mb-1" />
                           <span className="text-sm font-semibold text-primary">Tải lên mặt sau</span>
                        </div>
                      ) : (
                        <span className="text-sm text-on-surface-variant/50 font-medium">Chưa cập nhật ảnh</span>
                      )
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={backInputRef} onChange={(e) => handleImageChange(e, setBackFile, setBackPreview)} />
                </div>
              </div>

            </div>
          </SectionCard>

        </div>
      </div>

      {/* Toast notification component */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-normal">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
