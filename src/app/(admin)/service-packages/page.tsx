"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Package,
  Plus,
  Pencil,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  TriangleAlert,
  Users,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import { Plan } from "@/types/Plan";
import {
  requestGetAllPlans,
  requestUpdatePlan,
  requestDeletePlan,
} from "@/features/subscription/api/subscription.api";
import PlanFormDialog from "@/features/subscription/components/PlanFormDialog";
import { formatPrice } from "@/utils/formatPrice";

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({
  plan,
  onConfirm,
  onCancel,
  deleting,
}: {
  plan: Plan;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] font-headline">
                Xác nhận xóa gói dịch vụ
              </h3>
              <p className="text-sm text-[#434751] mt-1 font-body">
                Bạn có chắc muốn xóa gói dịch vụ{" "}
                <span className="font-bold text-[#0b1c30]">
                  {plan.plan_name}
                </span>
                ? Thao tác này không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium font-body">
              <span className="font-bold">Lưu ý:</span> Gói dịch vụ này sẽ bị ẩn khỏi hệ thống. Các doanh nghiệp đang sử dụng vẫn có thể tiếp tục dùng cho đến khi hết hạn, nhưng doanh nghiệp mới sẽ không thể đăng ký gói này nữa.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Xóa gói dịch vụ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  deletingId,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  deletingId: number | null;
  onEdit: (p: Plan) => void;
  onDelete: (p: Plan) => void;
}) {
  // Parse features safely
  let parsedFeatures: string[] = [];
  const planFeatures = plan.features as any;
  if (planFeatures) {
    if (Array.isArray(planFeatures)) {
      parsedFeatures = planFeatures;
    } else if (typeof planFeatures === "object") {
      if (Array.isArray(planFeatures.features)) {
        parsedFeatures = planFeatures.features;
      }
    } else if (typeof planFeatures === "string") {
      try {
        const parsed = JSON.parse(planFeatures);
        if (Array.isArray(parsed)) {
          parsedFeatures = parsed;
        } else if (parsed && parsed.features) {
          parsedFeatures = parsed.features;
        }
      } catch {
        parsedFeatures = planFeatures.split(",").map((f: string) => f.trim()).filter(Boolean);
      }
    }
  }

  return (
    <div
      className="bg-white rounded-2xl border border-primary/30 border-l-4 border-l-primary flex flex-col overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-primary/10 text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30] leading-tight font-headline">
                {plan.plan_name}
              </h3>
              <span className="text-[10px] font-bold text-[#434751] uppercase tracking-wider font-mono">
                Hạn {plan.duration_days} ngày
              </span>
            </div>
          </div>
        </div>

        {plan.description && (
          <p className="text-xs text-[#434751] mt-3 font-body min-h-[32px] line-clamp-2">
            {plan.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[#c3c6d3]/60" />

      {/* Body / Limits and price */}
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
            Giá gói dịch vụ
          </span>
          <span className="text-base font-extrabold text-[#0b1c30]">
            {formatPrice(plan.price)} <span className="text-xs text-[#434751] font-medium">VND</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
            Giới hạn điều phối
          </span>
          <span className="text-xs font-semibold text-[#0b1c30]">
            {plan.max_coordinators !== null ? `${plan.max_coordinators} tài khoản` : "Không giới hạn"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
            Giới hạn bảo vệ
          </span>
          <span className="text-xs font-semibold text-[#0b1c30]">
            {plan.max_guards !== null ? `${plan.max_guards} tài khoản` : "Không giới hạn"}
          </span>
        </div>

        {parsedFeatures.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-[#434751] uppercase tracking-wider">
              Tính năng nổi bật
            </span>
            <ul className="flex flex-col gap-1.5 pl-1">
              {parsedFeatures.slice(0, 3).map((feat, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-[#434751] font-medium leading-relaxed">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.is_active ? "text-primary" : "text-gray-400"}`} />
                  <span className="line-clamp-1">{feat}</span>
                </li>
              ))}
              {parsedFeatures.length > 3 && (
                <li className="text-[10px] text-primary font-bold pl-5">
                  + {parsedFeatures.length - 3} tính năng khác...
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="border-t border-[#c3c6d3]/60 px-5 py-3 flex items-center justify-between gap-2 bg-[#eff4ff]/30">
        <button
          onClick={() => onDelete(plan)}
          disabled={deletingId === plan.plan_id}
          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {deletingId === plan.plan_id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Xóa
        </button>

        <button
          onClick={() => onEdit(plan)}
          className="h-8 px-4 rounded-lg text-xs font-semibold text-[#434751] bg-white hover:bg-[#dce9ff] border border-[#c3c6d3] transition-colors flex items-center justify-center shadow-sm"
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Sửa
        </button>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServicePackagesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>();

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestGetAllPlans();
      // Ensure res is array
      setPlans(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách gói dịch vụ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenAdd = () => {
    setDialogMode("add");
    setEditingPlan(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setDialogMode("edit");
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    if (dialogMode === "add") {
      showToast("Thêm gói dịch vụ mới thành công!", "success");
    } else {
      showToast("Cập nhật gói dịch vụ thành công!", "success");
    }
    fetchPlans();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.plan_id);
      setError(null);
      const res = await requestDeletePlan(deleteTarget.plan_id);
      if (!res.success) {
        throw new Error(res.error || "Xóa gói dịch vụ thất bại");
      }
      showToast(`Đã xóa gói dịch vụ "${deleteTarget.plan_name}" thành công!`, "success");
      setDeleteTarget(null);
      await fetchPlans();
    } catch (err: any) {
      showToast(
        err?.message || "Không thể xóa gói dịch vụ. Gói dịch vụ này có thể đã được đăng ký sử dụng bởi các doanh nghiệp.",
        "error"
      );
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2c5ead]/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-[#2c5ead]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0b1c30] font-headline">
              Quản lý Gói Dịch Vụ
            </h1>
            <p className="text-xs text-[#434751] font-body">
              Thiết lập và điều chỉnh các gói dịch vụ đăng ký tài khoản doanh nghiệp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="h-9 px-3 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#c3c6d3] transition-colors flex items-center gap-2 disabled:opacity-50"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm gói dịch vụ
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-[#434751]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Đang tải danh sách...</span>
        </div>
      ) : plans.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-dashed border-[#c3c6d3]">
          <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] flex items-center justify-center">
            <Package className="w-7 h-7 text-[#2c5ead]/40" />
          </div>
          <p className="text-sm text-[#434751] font-medium">
            Chưa cấu hình gói dịch vụ nào trên hệ thống.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-1 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo gói dịch vụ đầu tiên
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.plan_id}
              plan={plan}
              deletingId={deletingId}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && plans.length > 0 && (
        <p className="text-xs text-[#434751] font-body">
          Tổng số {plans.length} gói dịch vụ đang hoạt động
        </p>
      )}

      {/* Form Dialog */}
      {dialogOpen && (
        <PlanFormDialog
          mode={dialogMode}
          plan={editingPlan}
          onSuccess={handleFormSuccess}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          plan={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deletingId === deleteTarget.plan_id}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {toastType === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
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
