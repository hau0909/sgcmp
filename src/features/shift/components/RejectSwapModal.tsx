"use client";

import React, { useState } from "react";
import { X, AlertCircle, Loader2, XCircle } from "lucide-react";
import { requestRejectSwapRequest } from "../api/shift-swap.api";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface RejectSwapModalProps {
  isOpen: boolean;
  requestId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectSwapModal({
  isOpen,
  requestId,
  onClose,
  onSuccess,
}: RejectSwapModalProps) {
  const { dict } = useTranslation();
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !requestId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rejectionReason.trim()) {
      setErrorMsg(dict?.reject_swap_modal?.val_enter_reason || "Vui lòng nhập lý do từ chối yêu cầu.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await requestRejectSwapRequest(requestId, rejectionReason.trim());

      if (res.success) {
        setRejectionReason("");
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || (dict?.reject_swap_modal?.msg_reject_error || "Từ chối yêu cầu thất bại."));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (dict?.reject_swap_modal?.msg_error_generic || "Đã xảy ra lỗi khi từ chối yêu cầu."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <XCircle className="h-6 w-6 shrink-0" />
            <h3 className="font-bold text-base text-slate-900">
              {dict?.reject_swap_modal?.title || "Từ chối yêu cầu đổi ca"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {dict?.reject_swap_modal?.reason_label || "Lý do từ chối"} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={dict?.reject_swap_modal?.reason_placeholder || "Nhập lý do cụ thể từ chối yêu cầu này để bảo vệ được biết..."}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {dict?.reject_swap_modal?.btn_cancel || "Hủy bỏ"}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{dict?.reject_swap_modal?.btn_submitting || "Đang xử lý..."}</span>
                </>
              ) : (
                <span>{dict?.reject_swap_modal?.btn_confirm || "Xác nhận từ chối"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
