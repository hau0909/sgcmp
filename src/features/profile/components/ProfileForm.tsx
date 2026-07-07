"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserCircle, Camera, Loader2, CheckCircle2, AlertCircle, Pencil, X } from "lucide-react";
import { requestGetUserProfile } from "@/features/auth/api/auth.api";
import { requestUpdateProfile } from "../api/profile.api";
import { useAuthStore } from "@/store/auth.store";
import { createClient } from "@/lib/supabase/client";

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
  const userId = useAuthStore((state) => state.user_id);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
          setDateOfBirth(data.date_of_birth ? data.date_of_birth.split("T")[0] : "");
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

        const { data: { publicUrl } } = supabase.storage.from("profiles").getPublicUrl(data.path);
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
        setMessage({ type: "success", text: "Cập nhật hồ sơ thành công!" });
        setIsEditing(false);
        setAvatarFile(null);
        // Update profile state with new values
        setProfile((prev) => prev ? {
          ...prev,
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          gender,
          date_of_birth: dateOfBirth,
          address: address.trim(),
          avatar_url: finalAvatarUrl,
        } : prev);
      } else {
        setMessage({ type: "error", text: result.message || "Cập nhật thất bại." });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Đã xảy ra lỗi." });
    } finally {
      setIsSaving(false);
    }
  };

  const genderLabel = (value: string) => {
    switch (value) {
      case "Nam": return "Nam";
      case "Nữ": return "Nữ";
      case "Khác": return "Khác";
      default: return "Chưa cập nhật";
    }
  };

  const inputBaseClass = "w-full h-11 px-4 rounded-xl border outline-none transition-all";
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
        <p className="text-on-surface-variant">Không tìm thấy thông tin hồ sơ.</p>
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
              {message.type === "success" ? "Thành công" : "Thông báo"}
            </h3>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              {message.text}
            </p>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold w-full hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8">
          <h2 className="text-lg font-semibold text-on-surface">Thông tin cá nhân</h2>
          {!isEditing ? (
            <button
              type="button"
              onClick={handleEnableEditing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all cursor-pointer"
              title="Chỉnh sửa hồ sơ"
            >
              <Pencil className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelEditing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl transition-all cursor-pointer"
              title="Hủy chỉnh sửa"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
          )}
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
                  {isEditing && (
                    <>
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
                        className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-md hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                        title="Cập nhật ảnh đại diện"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                <div className="text-center flex flex-col gap-2 mt-2">
                  <h3 className="font-semibold text-lg text-on-surface">
                    {profile?.full_name || "Chưa cập nhật"}
                  </h3>
                  {/* Link Xem Hồ Sơ */}
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Xem hồ sơ
                  </Link>
                </div>
              </div>

              {/* Fields Section */}
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    readOnly={!isEditing}
                    className={isEditing ? inputEditableClass : inputReadonlyClass}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    readOnly={!isEditing}
                    className={isEditing ? inputEditableClass : inputReadonlyClass}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface">Giới tính</label>
                  {isEditing ? (
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className={inputEditableClass}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
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
                  <label className="text-sm font-medium text-on-surface">Ngày sinh</label>
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
                      value={dateOfBirth ? new Date(dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                      readOnly
                      className={inputReadonlyClass}
                    />
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-on-surface">Địa chỉ</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    readOnly={!isEditing}
                    className={isEditing ? inputEditableClass : inputReadonlyClass}
                    placeholder="Nhập địa chỉ"
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
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-medium shadow-sm hover:bg-primary/90 hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
