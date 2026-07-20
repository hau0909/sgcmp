"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { Plan } from "@/types/Plan";
import {
  requestCreatePlan,
  requestUpdatePlan,
} from "@/features/subscription/api/subscription.api";

interface PlanFormDialogProps {
  mode: "add" | "edit";
  plan?: Plan;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PlanFormDialog({
  mode,
  plan,
  onSuccess,
  onClose,
}: PlanFormDialogProps) {
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [durationDays, setDurationDays] = useState<string>("30");
  const [maxCoordinators, setMaxCoordinators] = useState<string>("");
  const [maxGuards, setMaxGuards] = useState<string>("");
  const [featuresText, setFeaturesText] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && plan) {
      setPlanName(plan.plan_name || "");
      setDescription(plan.description || "");
      setPrice(plan.price !== undefined ? String(plan.price) : "");
      setDurationDays(plan.duration_days !== undefined ? String(plan.duration_days) : "30");
      setMaxCoordinators(plan.max_coordinators !== null ? String(plan.max_coordinators) : "");
      setMaxGuards(plan.max_guards !== null ? String(plan.max_guards) : "");
      
      // Parse features
      let feats: string[] = [];
      const planFeatures = plan.features as any;
      if (planFeatures) {
        if (Array.isArray(planFeatures)) {
          feats = planFeatures;
        } else if (typeof planFeatures === "object") {
          if (Array.isArray(planFeatures.features)) {
            feats = planFeatures.features;
          }
        } else if (typeof planFeatures === "string") {
          try {
            const parsed = JSON.parse(planFeatures);
            if (Array.isArray(parsed)) {
              feats = parsed;
            } else if (parsed && parsed.features) {
              feats = parsed.features;
            }
          } catch {
            feats = planFeatures.split(",").map((f: string) => f.trim()).filter(Boolean);
          }
        }
      }

      setFeaturesText(feats.join("\n"));
    }
  }, [mode, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation checks
    if (planName.trim().length > 50) {
      setError("Tên gói dịch vụ không được vượt quá 50 ký tự.");
      setLoading(false);
      return;
    }

    if (description.length > 200) {
      setError("Mô tả ngắn không được vượt quá 200 ký tự.");
      setLoading(false);
      return;
    }

    if (Number(price) > 1000000000) {
      setError("Giá dịch vụ không được vượt quá 1.000.000.000 VND.");
      setLoading(false);
      return;
    }

    if (Number(durationDays) > 365) {
      setError("Thời hạn gói không được vượt quá 365 ngày (01 năm).");
      setLoading(false);
      return;
    }

    if (maxCoordinators !== "" && Number(maxCoordinators) > 100000) {
      setError("Giới hạn điều phối viên không được vượt quá 100.000 tài khoản.");
      setLoading(false);
      return;
    }

    if (maxGuards !== "" && Number(maxGuards) > 100000) {
      setError("Giới hạn bảo vệ không được vượt quá 100.000 tài khoản.");
      setLoading(false);
      return;
    }

    if (featuresText.length > 500) {
      setError("Tổng độ dài danh sách tính năng không được vượt quá 500 ký tự.");
      setLoading(false);
      return;
    }

    // Parse features text
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      plan_name: planName.trim(),
      description: description.trim() || null,
      price: Number(price),
      duration_days: Number(durationDays),
      max_coordinators: maxCoordinators === "" ? null : Number(maxCoordinators),
      max_guards: maxGuards === "" ? null : Number(maxGuards),
      features,
      is_active: true,
    };

    try {
      if (mode === "add") {
        const res = await requestCreatePlan(payload);
        if (!res.success) {
          throw new Error(res.error || "Không thể tạo gói dịch vụ");
        }
      } else if (mode === "edit" && plan) {
        const res = await requestUpdatePlan(plan.plan_id, payload);
        if (!res.success) {
          throw new Error(res.error || "Không thể cập nhật gói dịch vụ");
        }
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d3] bg-[#eff4ff]">
          <h2 className="text-base font-bold text-[#0b1c30] font-headline">
            {mode === "add" ? "Thêm gói dịch vụ mới" : "Cập nhật gói dịch vụ"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#434751] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#dce9ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Plan Name */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#434751] font-body">
                Tên gói dịch vụ <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-[#737785]">{planName.length}/50</span>
            </div>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
              maxLength={50}
              placeholder="Ví dụ: Gói Cơ Bản, Gói Chuyên Nghiệp"
              className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#434751] font-body">
                Mô tả ngắn
              </label>
              <span className="text-[10px] text-[#737785]">{description.length}/200</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              placeholder="Mô tả tóm tắt về gói dịch vụ..."
              rows={2}
              className="rounded-lg border border-[#c3c6d3] p-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors resize-none"
            />
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434751] font-body">
                Giá dịch vụ (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0}
                max={1000000000}
                placeholder="Nhập giá tiền"
                className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434751] font-body">
                Thời hạn gói (Ngày) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
                min={1}
                max={3650}
                placeholder="Ví dụ: 30, 90, 365"
                className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors"
              />
            </div>
          </div>

          {/* Max Coordinators & Max Guards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434751] font-body">
                Giới hạn điều phối viên (Coordinators)
              </label>
              <input
                type="number"
                value={maxCoordinators}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaxCoordinators(val === "" ? "" : String(Math.max(0, parseInt(val) || 0)));
                }}
                min={0}
                max={100000}
                placeholder="Không giới hạn"
                className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors"
              />
              <p className="text-[10px] text-[#737785]">Để trống nếu không giới hạn.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#434751] font-body">
                Giới hạn bảo vệ (Guards)
              </label>
              <input
                type="number"
                value={maxGuards}
                onChange={(e) => {
                  const val = e.target.value;
                  setMaxGuards(val === "" ? "" : String(Math.max(0, parseInt(val) || 0)));
                }}
                min={0}
                max={100000}
                placeholder="Không giới hạn"
                className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors"
              />
              <p className="text-[10px] text-[#737785]">Để trống nếu không giới hạn.</p>
            </div>
          </div>

          {/* Features list */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#434751] font-body">
                Các tính năng nổi bật (Mỗi dòng một tính năng)
              </label>
              <span className="text-[10px] text-[#737785]">{featuresText.length}/500</span>
            </div>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              maxLength={500}
              placeholder="Quản lý tối đa 20 bảo vệ.&#10;Lên lịch trực ca cơ bản.&#10;Check-in/Check-out ca làm."
              rows={4}
              className="rounded-lg border border-[#c3c6d3] p-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors resize-y font-body"
            />
          </div>


          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2 border border-red-200">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#c3c6d3]/60 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "add" ? "Thêm mới" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
