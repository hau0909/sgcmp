"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { requestCreateService, requestUpdateService } from "../api/service.api";
import type { Service } from "@/types/Service";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface ServiceFormDialogProps {
  mode: "add" | "edit";
  service?: Service;
  onSuccess: (message?: string) => void;
  onClose: () => void;
}

export default function ServiceFormDialog({
  mode,
  service,
  onSuccess,
  onClose,
}: ServiceFormDialogProps) {
  const { dict } = useTranslation();
  const [form, setForm] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && service) {
      setForm({
        name: service.name,
        description: service.description || "",
      });
    }
  }, [mode, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    
    try {
      if (mode === "add") {
        const result = await requestCreateService({
          name: form.name.trim(),
          description: form.description.trim(),
        });
        if (!result.success) {
          setFormError(result.message);
          return;
        }
        onSuccess(dict.admin_services.create_success);
      } else if (mode === "edit" && service) {
        const result = await requestUpdateService(service.service_id, {
          name: form.name.trim(),
          description: form.description.trim(),
        });
        if (!result.success) {
          setFormError(result.message);
          return;
        }
        onSuccess(dict.admin_services.update_success);
      }
    } catch (err: any) {
      setFormError(err?.message || dict.admin_services.error_generic);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden font-body border border-slate-200">
        {/* Dialog Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d3] bg-[#eff4ff]">
          <h2 className="text-base font-bold text-[#0b1c30] font-headline">
            {mode === "add" ? dict.admin_services.add_dialog_title : dict.admin_services.edit_dialog_title}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-[#434751] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#dce9ff] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialog Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Tên dịch vụ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434751] font-body">
              {dict.admin_services.name_label} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={dict.admin_services.name_placeholder}
              required
              disabled={submitting}
              className={`h-10 rounded-lg border px-3 text-sm text-[#0b1c30] bg-white focus:outline-none transition-colors disabled:opacity-60 placeholder:text-[#434751]/60 ${
                form.name.length > 50
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#c3c6d3] focus:border-[#2c5ead]"
              }`}
            />
            <p
              className={`text-[11px] text-right ${
                form.name.length > 50 ? "text-red-600 font-medium" : "text-[#737785]"
              }`}
            >
              {form.name.length}/50
            </p>
          </div>

          {/* Mô tả */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434751] font-body">
              {dict.admin_services.desc_label} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={dict.admin_services.desc_placeholder}
              rows={3}
              required
              disabled={submitting}
              className={`w-full min-h-[80px] rounded-lg border px-3 py-2.5 text-sm text-[#0b1c30] bg-white focus:outline-none transition-colors disabled:opacity-60 placeholder:text-[#434751]/60 resize-none ${
                form.description.length > 150
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#c3c6d3] focus:border-[#2c5ead]"
              }`}
            />
            <p
              className={`text-[11px] text-right ${
                form.description.length > 150
                  ? "text-red-600 font-medium"
                  : "text-[#737785]"
              }`}
            >
              {form.description.length}/150
            </p>
          </div>

          {/* Error message */}
          {formError && (
            <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2 mt-1 border border-red-100">
              {formError}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors cursor-pointer"
            >
              {dict.admin_services.cancel}
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                form.name.length > 50 ||
                form.description.length > 150
              }
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "add" ? dict.admin_services.confirm_create : dict.admin_services.confirm_edit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
