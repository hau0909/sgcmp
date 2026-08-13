"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, Loader2, AlertCircle, CheckCircle2, ShieldPlus } from "lucide-react";
import { requestCreateGuardAccount, requestCheckGuardQuota } from "@/features/guards/api/guard.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface AddGuardQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGuardQuickModal({
  isOpen,
  onClose,
  onSuccess,
}: AddGuardQuickModalProps) {
  const { dict } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // Reset form states when opened
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(false);

    // Check quota
    const checkQuota = async () => {
      try {
        const res = await requestCheckGuardQuota();
        if (res.success && res.data?.isExceeded) {
          setQuotaExceeded(true);
          const max = res.data.maxGuards;
          const curr = res.data.currentGuards;
          setQuotaMessage(
            (dict.add_guard?.quota_exceeded ?? "Giới hạn nhân viên bảo vệ đã đạt tối đa ({curr}/{max})")
              .replace("{curr}", String(curr))
              .replace("{max}", String(max))
          );
        } else {
          setQuotaExceeded(false);
          setQuotaMessage("");
        }
      } catch (err) {
        console.error("Lỗi kiểm tra giới hạn bảo vệ:", err);
      }
    };
    checkQuota();
  }, [isOpen, dict]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneNumber.trim();

    const nameRegex = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

    if (!trimmedName) {
      errors.fullName = dict.add_guard?.validate_name_required ?? "Vui lòng nhập họ và tên.";
    } else if (fullName.startsWith(" ") || fullName.endsWith(" ")) {
      errors.fullName = dict.add_guard?.validate_name_no_leading_trailing_space ?? "Họ và tên không được chứa khoảng trắng ở đầu hoặc cuối.";
    } else if (/\s{2,}/.test(fullName)) {
      errors.fullName = dict.add_guard?.validate_name_no_multiple_spaces ?? "Họ và tên không được chứa nhiều khoảng trắng liên tiếp.";
    } else if (!nameRegex.test(trimmedName)) {
      errors.fullName = dict.add_guard?.validate_name_letters_only ?? "Họ và tên chỉ được chứa chữ cái và khoảng trắng.";
    }

    if (!trimmedEmail) {
      errors.email = dict.add_guard?.validate_email_required ?? "Vui lòng nhập email.";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = dict.add_guard?.validate_email_invalid ?? "Email không hợp lệ.";
    }

    if (!trimmedPhone) {
      errors.phoneNumber = dict.add_guard?.validate_phone_required ?? "Vui lòng nhập số điện thoại.";
    } else if (!phoneRegex.test(trimmedPhone)) {
      errors.phoneNumber = dict.add_guard?.validate_phone_invalid ?? "Số điện thoại không hợp lệ (9-10 chữ số).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || quotaExceeded) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await requestCreateGuardAccount({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
      });

      if (!res.success) {
        throw new Error(res.message || "Không thể tạo tài khoản bảo vệ.");
      }

      setSuccessMessage(
        "Tạo tài khoản thành công! Email xác thực tài khoản đã được gửi đến bảo vệ."
      );

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Create guard error:", err);
      setErrorMessage(err.message || "Không thể tạo tài khoản bảo vệ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <ShieldPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Thêm nhân viên bảo vệ
              </h2>
              <p className="text-xs text-slate-500">
                Tạo tài khoản và gửi email xác thực đến nhân viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600 transition cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {quotaExceeded && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{quotaMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 font-medium animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 font-medium animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                  }
                }}
                disabled={isSubmitting || quotaExceeded}
                placeholder="VD: Nguyễn Văn A"
                className={`h-10 w-full rounded-lg border bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.fullName
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-blue-700"
                } disabled:cursor-not-allowed disabled:bg-slate-100`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                disabled={isSubmitting || quotaExceeded}
                placeholder="VD: guard@example.com"
                className={`h-10 w-full rounded-lg border bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-blue-700"
                } disabled:cursor-not-allowed disabled:bg-slate-100`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.email}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-500">
              Email sẽ nhận đường dẫn xác thực và hướng dẫn đăng nhập.
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ""));
                  if (fieldErrors.phoneNumber) {
                    setFieldErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }
                }}
                disabled={isSubmitting || quotaExceeded}
                placeholder="VD: 0912345678"
                maxLength={11}
                className={`h-10 w-full rounded-lg border bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100 ${
                  fieldErrors.phoneNumber
                    ? "border-red-500 focus:border-red-500"
                    : "border-slate-300 focus:border-blue-700"
                } disabled:cursor-not-allowed disabled:bg-slate-100`}
              />
            </div>
            {fieldErrors.phoneNumber && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.phoneNumber}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-blue-800 border border-blue-100">
            <p className="font-semibold mb-0.5">ℹ️ Quy trình sau khi tạo:</p>
            <p className="text-blue-700">
              Bảo vệ sẽ xác thực email $\rightarrow$ đăng nhập hoàn tất thông tin CCCD, địa chỉ, ảnh thẻ $\rightarrow$ gửi hồ sơ duyệt cho bạn.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || quotaExceeded}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Tạo và gửi thư xác thực</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
