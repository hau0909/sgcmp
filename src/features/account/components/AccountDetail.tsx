"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Clock,
  Settings,
  Ban,
  AlertTriangle,
  X,
} from "lucide-react";
import { requestGetAccountDetail, requestBanAccount } from "../api/account.api";
import type { Profile } from "@/types/Profile";
import type { ReasonBan } from "@/types/ReasonBan";
import type { UserRole, GeneralStatus } from "@/types/Enum";
import { useTranslation } from "@/components/providers/LanguageProvider";

const formatDate = (dateStr: string | null, dict: any) => {
  if (!dateStr) return dict.admin_accounts.not_updated || "Chưa cập nhật";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const getRoleLabel = (role: UserRole, dict: any): string => {
  switch (role) {
    case "admin":
      return dict.admin_accounts.admin || "Admin";
    case "customer":
      return dict.admin_accounts.customer || "Khách hàng";
    case "company-admin":
      return dict.admin_accounts.company_admin || "Quản lý DN";
    case "guard":
      return dict.admin_accounts.guard || "Bảo vệ";
    case "coordinator":
      return dict.admin_accounts.coordinator || "Điều phối";
    default:
      return role;
  }
};

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case "admin":
      return {
        bg: "bg-[#ede9fe]",
        text: "text-[#6d28d9]",
        dot: "bg-[#8b5cf6]",
      };
    case "customer":
      return {
        bg: "bg-[#dbeafe]",
        text: "text-[#1e40af]",
        dot: "bg-[#3b82f6]",
      };
    case "company-admin":
      return {
        bg: "bg-[#fef3c7]",
        text: "text-[#b45309]",
        dot: "bg-[#f59e0b]",
      };
    case "guard":
      return {
        bg: "bg-[#d1fae5]",
        text: "text-[#065f46]",
        dot: "bg-[#10b981]",
      };
    case "coordinator":
      return {
        bg: "bg-[#fce7f3]",
        text: "text-[#9d174d]",
        dot: "bg-[#ec4899]",
      };
    default:
      return {
        bg: "bg-[#f3f4f6]",
        text: "text-[#374151]",
        dot: "bg-[#9ca3af]",
      };
  }
};

const getStatusBadge = (status: GeneralStatus, dict: any) => {
  if (status === "active") {
    return {
      label: dict.admin_bank_accounts.active_status || "Active",
      bg: "bg-[#dcfce7]",
      text: "text-[#166534]",
      dot: "bg-[#22c55e]",
    };
  }
  if (status === "banned") {
    return {
      label: dict.admin_accounts.lock_account ? (dict.admin_accounts.lock_account.includes("Khóa") ? "Bị khóa" : "Banned") : "Banned",
      bg: "bg-[#fef2f2] border border-[#fca5a5]",
      text: "text-[#991b1b]",
      dot: "bg-[#ef4444]",
    };
  }
  return {
    label: dict.admin_bank_accounts.inactive_status || "Inactive",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    dot: "bg-[#ef4444]",
  };
};

export default function AccountDetail({ userId }: { userId: string }) {
  const { dict } = useTranslation();
  const router = useRouter();
  const [account, setAccount] = React.useState<Profile | null>(null);
  const [banReason, setBanReason] = React.useState<ReasonBan | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isBanning, setIsBanning] = React.useState(false);
  const [reasonInput, setReasonInput] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleConfirmBan = async () => {
    if (!reasonInput.trim()) {
      setReasonError(dict.admin_accounts.reason_required);
      return;
    }
    try {
      setIsBanning(true);
      const res = await requestBanAccount(userId, reasonInput.trim());
      if (res.success) {
        setToastMessage({ text: res.message || dict.admin_accounts.lock_success, type: "success" });
        setIsConfirmOpen(false);
        setAccount(prev => prev ? { ...prev, status: "banned" as GeneralStatus } : null);
        setBanReason({
          reason_ban_id: "",
          user_id: userId,
          reason: reasonInput.trim(),
          banned_by: "",
        });
        setReasonInput("");
        setReasonError(null);
      } else {
        setToastMessage({ text: res.error || dict.admin_accounts.lock_fail, type: "error" });
      }
    } catch (err: any) {
      console.error("Error banning account:", err);
      setToastMessage({ text: err.message || dict.admin_accounts.lock_error, type: "error" });
    } finally {
      setIsBanning(false);
    }
  };

  React.useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        const res = await requestGetAccountDetail(userId);
        setAccount(res.account);
        if (res.banReason) {
          setBanReason(res.banReason);
        }
      } catch (err: any) {
        console.error("Error fetching account detail:", err);
        setError(err.message || dict.admin_accounts.error_load_detail);
      } finally {
        setError(null);
        setLoading(false);
      }
    };
    if (userId) {
      fetchAccount();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{dict.admin_accounts.loading_detail}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-error font-medium gap-4">
          <p>{dict.admin_accounts.error_load_detail}: {error || dict.admin_accounts.error_not_found}</p>
          <button
            onClick={() => router.push("/accounts")}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{dict.admin_accounts.back_to_list}</span>
          </button>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(account.role);
  const statusBadge = getStatusBadge(account.status, dict);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/accounts")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            {dict.admin_accounts.title_detail}
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {dict.admin_accounts.desc_detail}
          </p>
        </div>

        {account.status !== "banned" && (
          <button
            type="button"
            onClick={() => {
              setReasonInput("");
              setReasonError(null);
              setIsConfirmOpen(true);
            }}
            className="ml-auto flex items-center justify-center gap-2 rounded-lg border-2 bg-blue-800 px-4 py-2 font-medium text-white transition-all duration-300 hover:bg-blue-900 cursor-pointer animate-in fade-in duration-300"
          >
            <Ban className="shrink-0" size={20} />
            <span>{dict.admin_accounts.lock_account}</span>
          </button>
        )}
      </div>

      {/* Banned Alert Banner */}
      {account.status === "banned" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-900 flex items-start gap-4 shadow-sm">
          <div className="p-2.5 bg-red-100 rounded-xl text-red-600 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-red-800">{dict.admin_accounts.account_locked_title}</h4>
            {banReason?.reason ? (
              <p className="text-sm text-red-700">
                <span className="font-semibold">{dict.admin_accounts.lock_reason}</span> {banReason.reason}
              </p>
            ) : (
              <p className="text-sm text-red-700">{dict.admin_accounts.no_lock_reason}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-surface-container-high border-4 border-white shadow-md flex items-center justify-center overflow-hidden mb-4 relative">
              {account.avatar_url ? (
                <img
                  src={account.avatar_url}
                  alt={account.full_name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-16 h-16 text-on-surface-variant/50" />
              )}
            </div>

            <h3 className="text-xl font-bold text-on-surface mb-1">
              {account.full_name || dict.admin_accounts.not_updated}
            </h3>

            <div className="flex flex-col gap-2 mt-3 items-center">
              <span
                className={`inline-flex items-center gap-1.5 ${roleBadge.bg} ${roleBadge.text} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot} shrink-0`}
                />
                {getRoleLabel(account.role, dict)}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} shrink-0`}
                />
                {statusBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-outline-variant px-6 py-4 bg-surface-container-low/50">
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                {dict.admin_accounts.personal_info}
              </h4>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <p className="text-sm font-medium text-on-surface">
                  {account.email}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {dict.admin_accounts.phone}
                </label>
                <p className="text-sm font-medium text-on-surface">
                  {account.phone_number || dict.admin_accounts.not_updated}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <UserCircle className="w-3.5 h-3.5" /> {dict.admin_accounts.gender}
                </label>
                <p className="text-sm font-medium text-on-surface">
                  {account.gender || dict.admin_accounts.not_updated}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {dict.admin_accounts.dob}
                </label>
                <p className="text-sm font-medium text-on-surface">
                  {formatDate(account.date_of_birth, dict)}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {dict.admin_accounts.address}
                </label>
                <p className="text-sm font-medium text-on-surface">
                  {account.address || dict.admin_accounts.not_updated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ban Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-center text-on-surface mb-2">{dict.admin_accounts.lock_confirm_title}</h3>
              <p className="text-sm text-center text-on-surface-variant/80 mb-4">
                {dict.admin_accounts.lock_confirm_desc}
              </p>

              <div className="text-left space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {dict.admin_accounts.lock_reason_label} <span className="text-error">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => {
                    setReasonInput(e.target.value);
                    if (reasonError) setReasonError(null);
                  }}
                  placeholder={dict.admin_accounts.lock_reason_placeholder}
                  className={`w-full p-3 text-sm rounded-xl border ${
                    reasonError ? "border-error focus:ring-error" : "border-outline-variant focus:border-primary"
                  } bg-surface focus:outline-none focus:ring-1 text-on-surface resize-none`}
                />
                {reasonError && (
                  <p className="text-xs text-error font-medium">{reasonError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setReasonInput("");
                  setReasonError(null);
                }}
                disabled={isBanning}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm disabled:opacity-50 cursor-pointer"
              >
                {dict.admin_accounts.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                disabled={isBanning}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-error hover:bg-error/90 text-white transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isBanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{dict.admin_accounts.processing}</span>
                  </>
                ) : (
                  <span>{dict.admin_accounts.confirm}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-[999] animate-in fade-in slide-in-from-bottom-5 ${toastMessage.type === "success" ? "bg-emerald-950 text-emerald-200 border border-emerald-800" : "bg-red-950 text-red-200 border border-red-800"}`}>
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
