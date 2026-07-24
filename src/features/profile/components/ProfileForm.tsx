"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
  KeyRound,
} from "lucide-react";
import {
  requestGetUserProfile,
  requestLogout,
} from "@/features/auth/api/auth.api";
import { requestUpdateProfile } from "../api/profile.api";
import { useAuthStore } from "@/store/auth.store";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/components/providers/LanguageProvider";
import ResetPasswordModal from "./ResetPasswordModal";

export type ProfileData = {
  id?: string;
  email?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  role?: string;
};

export default function ProfileForm() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user_id);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLogoutPendingOnSuccess, setIsLogoutPendingOnSuccess] = useState(false);

  // Change password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { dict } = useTranslation();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup states for cancel
  const [backupFullName, setBackupFullName] = useState("");
  const [backupPhoneNumber, setBackupPhoneNumber] = useState("");
  const [backupGender, setBackupGender] = useState("");
  const [backupDateOfBirth, setBackupDateOfBirth] = useState("");
  const [backupAddress, setBackupAddress] = useState("");
  const [backupAvatarUrl, setBackupAvatarUrl] = useState("");

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const result = await requestGetUserProfile();
        if (active && result?.success && result?.data) {
          const data = result.data as ProfileData;
          setProfile(data);
          setFullName(data.full_name || "");
          setPhoneNumber(data.phone_number || "");
          setGender(data.gender || "");
          setDateOfBirth(
            data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
          );
          setAddress(data.address || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin hồ sơ:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (userId) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }

    return () => {
      active = false;
    };
  }, [userId]);

  const handleEnableEditing = () => {
    // Backup current values before editing
    setBackupFullName(fullName);
    setBackupPhoneNumber(phoneNumber);
    setBackupGender(gender);
    setBackupDateOfBirth(dateOfBirth);
    setBackupAddress(address);
    setBackupAvatarUrl(avatarUrl);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    // Restore backup values
    setFullName(backupFullName);
    setPhoneNumber(backupPhoneNumber);
    setGender(backupGender);
    setDateOfBirth(backupDateOfBirth);
    setAddress(backupAddress);
    setAvatarUrl(backupAvatarUrl);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setMessage(null);

    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const supabase = createClient();
        const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "";
        const path = `${userId}/avatar-${Date.now()}.${ext}`;

        const { data, error } = await supabase.storage
          .from("profiles")
          .upload(path, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          throw new Error(`Lỗi tải ảnh đại diện: ${error.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("profiles").getPublicUrl(data.path);
        finalAvatarUrl = publicUrl;
      }

      const result = await requestUpdateProfile({
        userId,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender,
        dateOfBirth: dateOfBirth || undefined,
        address: address.trim(),
        avatarUrl: finalAvatarUrl || undefined,
      });

      if (result.success) {
        setMessage({ type: "success", text: dict.pages.profile_form.update_success });
        setIsEditing(false);
        setAvatarFile(null);
        // Update profile state with new values
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                full_name: fullName.trim(),
                phone_number: phoneNumber.trim(),
                gender,
                date_of_birth: dateOfBirth,
                address: address.trim(),
                avatar_url: finalAvatarUrl,
              }
            : prev,
        );
      } else {
        setMessage({
          type: "error",
          text: result.message || "Cập nhật thất bại.",
        });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Đã xảy ra lỗi." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordResetSuccess = () => {
    setIsLogoutPendingOnSuccess(true);
    setMessage({
      type: "success",
      text:
        dict.pages.profile_form?.change_password_success ||
        "Đổi mật khẩu thành công! Bạn sẽ được đăng xuất để đăng nhập lại.",
    });
  };

  const handleModalOkClick = async () => {
    if (isLogoutPendingOnSuccess) {
      try {
        await requestLogout();
      } catch (e) {
        console.error("Logout error after password change:", e);
      } finally {
        clearAuth();
        setProfile(null);
        setMessage(null);
        setIsLogoutPendingOnSuccess(false);
        router.replace("/login");
        router.refresh();
      }
    } else {
      setMessage(null);
    }
  };

  const genderLabel = (value: string) => {
    switch (value) {
      case "Nam":
        return dict.pages.profile_form.gender_male;
      case "Nữ":
        return dict.pages.profile_form.gender_female;
      case "Khác":
        return dict.pages.profile_form.gender_other;
      default:
        return dict.pages.profile_form.not_updated;
    }
  };

  const inputBaseClass =
    "w-full h-11 px-4 rounded-xl border outline-none transition-all";
  const inputEditableClass = `${inputBaseClass} border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary`;
  const inputReadonlyClass = `${inputBaseClass} border-outline-variant/50 bg-surface-container-low text-on-surface cursor-default`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile && !isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-on-surface-variant">
          {dict.pages.profile_form.not_found}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Modal Notification instead of Alert */}
      {message && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            {message.type === "success" ? (
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            )}
            <h3 className="text-xl font-bold text-on-surface mb-2">
              {message.type === "success"
                ? dict.pages.profile_form.success_modal_title
                : dict.pages.profile_form.error_modal_title}
            </h3>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              {message.text}
            </p>
            <button
              type="button"
              onClick={handleModalOkClick}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold w-full hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
            >
              {isLogoutPendingOnSuccess
                ? dict.pages.profile_form?.ok || "OK"
                : dict.pages.profile_form.modal_close}
            </button>
          </div>
        </div>
      )}

      {/* Modal Đổi Mật Khẩu */}
      <ResetPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordResetSuccess}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {/* Header with Change Password & Edit Button */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8 flex-wrap gap-4">
          <h2 className="text-lg font-semibold text-on-surface">
            {dict.pages.profile_form.title}
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all cursor-pointer border border-amber-200/60"
              title={
                dict.pages.profile_form?.change_password || "Đổi mật khẩu"
              }
            >
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>
                {dict.pages.profile_form?.change_password || "Đổi mật khẩu"}
              </span>
            </button>
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEnableEditing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all cursor-pointer"
                title={dict.pages.profile_form.edit}
              >
                <Pencil className="w-4 h-4" />
                <span>{dict.pages.profile_form.edit}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEditing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition-all cursor-pointer"
                title={dict.pages.profile_form.cancel}
              >
                <X className="w-4 h-4" />
                <span>{dict.pages.profile_form.cancel}</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 pt-4 md:pt-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                <div className="relative">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container shadow-sm flex items-center justify-center bg-surface-container-low">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <UserCircle className="w-20 h-20 text-on-surface-variant/50" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        setAvatarUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    title={dict.pages.profile_form.update_avatar_title}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center flex flex-col gap-2 mt-2">
                  <h3 className="font-semibold text-lg text-on-surface">
                    {profile?.full_name || dict.pages.profile_form.not_updated}
                  </h3>
                  {/* Link Xem Hồ Sơ */}
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {dict.pages.profile_form.view_profile}
                  </Link>
                </div>
              </div>

              {/* Fields Section */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    {dict.pages.profile_form.full_name}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    readOnly={!isEditing}
                    className={
                      isEditing ? inputEditableClass : inputReadonlyClass
                    }
                    placeholder={dict.pages.profile_form.full_name_placeholder}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    {dict.pages.profile_form.email}
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    {dict.pages.profile_form.phone}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    readOnly={!isEditing}
                    className={
                      isEditing ? inputEditableClass : inputReadonlyClass
                    }
                    placeholder={dict.pages.profile_form.phone_placeholder}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    {dict.pages.profile_form.gender}
                  </label>
                  {isEditing ? (
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={inputEditableClass}
                    >
                      <option value="">{dict.pages.profile_form.gender_select}</option>
                      <option value="Nam">{dict.pages.profile_form.gender_male}</option>
                      <option value="Nữ">{dict.pages.profile_form.gender_female}</option>
                      <option value="Khác">{dict.pages.profile_form.gender_other}</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={genderLabel(gender)}
                      readOnly
                      className={inputReadonlyClass}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">
                    {dict.pages.profile_form.dob}
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={inputEditableClass}
                    />
                  ) : (
                    <input
                      type="text"
                      value={
                        dateOfBirth
                          ? new Date(dateOfBirth).toLocaleDateString("vi-VN")
                          : dict.pages.profile_form.not_updated
                      }
                      readOnly
                      className={inputReadonlyClass}
                    />
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-on-surface">
                    {dict.pages.profile_form.address}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    readOnly={!isEditing}
                    className={
                      isEditing ? inputEditableClass : inputReadonlyClass
                    }
                    placeholder={dict.pages.profile_form.address_placeholder}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons - Only visible in edit mode */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="px-6 py-2.5 text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl font-medium transition-all cursor-pointer"
                >
                  {dict.pages.profile_form.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-medium shadow-sm hover:bg-primary/90 hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? dict.pages.profile_form.saving : dict.pages.profile_form.save}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
