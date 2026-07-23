"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { requestResetPassword } from "@/features/auth/api/auth.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ResetPasswordModalProps) {
  const { dict } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field errors
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setCurrentPasswordError(null);
      setNewPasswordError(null);
      setConfirmPasswordError(null);
      setGeneralError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    setGeneralError(null);

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError(
        dict.pages.profile_form?.current_password_required ||
          "Vui lòng nhập mật khẩu hiện tại.",
      );
      hasError = true;
    }

    if (!newPassword) {
      setNewPasswordError(
        dict.pages.registration?.err_password_required ||
          "Vui lòng nhập mật khẩu mới.",
      );
      hasError = true;
    } else if (newPassword.length < 8) {
      setNewPasswordError(
        dict.pages.registration?.err_password_short ||
          "Mật khẩu phải có ít nhất 8 ký tự.",
      );
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        dict.pages.registration?.err_confirm_required ||
          "Vui lòng xác nhận mật khẩu mới.",
      );
      hasError = true;
    } else if (newPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError(
        dict.pages.registration?.err_confirm_mismatch ||
          "Mật khẩu xác nhận không khớp.",
      );
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const res = await requestResetPassword({
        currentPassword,
        password: newPassword,
        confirmPassword,
      });

      if (res?.success) {
        onClose();
        onSuccess();
      } else {
        const msg = res?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.";
        if (msg.includes("hiện tại") || msg.toLowerCase().includes("current")) {
          setCurrentPasswordError(msg);
        } else {
          setGeneralError(msg);
        }
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface">
              {dict.pages.profile_form?.change_password_title ||
                "Đổi mật khẩu tài khoản"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {dict.pages.registration?.password_hint ||
                "Mật khẩu phải có ít nhất 8 ký tự."}
            </p>
          </div>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Current Password Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">
              {dict.pages.profile_form?.current_password || "Mật khẩu hiện tại"}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) setCurrentPasswordError(null);
                }}
                className={`w-full h-11 pl-10 pr-10 rounded-xl border text-sm outline-none transition-all ${
                  currentPasswordError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    : "border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder={
                  dict.pages.profile_form?.current_password_placeholder ||
                  "Nhập mật khẩu hiện tại"
                }
              />
              <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {currentPasswordError && (
              <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in fade-in duration-150">
                <span>{currentPasswordError}</span>
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">
              {dict.pages.profile_form?.new_password || "Mật khẩu mới"}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError(null);
                }}
                className={`w-full h-11 pl-10 pr-10 rounded-xl border text-sm outline-none transition-all ${
                  newPasswordError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    : "border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder={
                  dict.pages.profile_form?.new_password_placeholder ||
                  "Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                }
              />
              <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {newPasswordError && (
              <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in fade-in duration-150">
                <span>{newPasswordError}</span>
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-on-surface">
              {dict.pages.profile_form?.confirm_new_password ||
                "Xác nhận mật khẩu mới"}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                className={`w-full h-11 pl-10 pr-10 rounded-xl border text-sm outline-none transition-all ${
                  confirmPasswordError
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    : "border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary"
                }`}
                placeholder={
                  dict.pages.profile_form?.confirm_new_password_placeholder ||
                  "Nhập lại mật khẩu mới"
                }
              />
              <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1 animate-in fade-in duration-150">
                <span>{confirmPasswordError}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-on-surface-variant bg-surface-container-low hover:bg-surface-container rounded-xl font-medium text-sm transition-all cursor-pointer"
            >
              {dict.pages.profile_form.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-medium text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {dict.pages.profile_form?.change_password || "Đổi mật khẩu"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
