"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Landmark,
  Plus,
  Pencil,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  TriangleAlert,
  Star,
} from "lucide-react";
import { BankAccount } from "@/types/BankAccount";
import {
  requestGetAllBankAccounts,
  requestSwitchActiveBankAccount,
  requestDeactivateBankAccount,
  requestDeleteBankAccount,
} from "@/features/payment/api/payment.api";
import BankAccountFormDialog from "@/features/payment/component/BankAccountFormDialog";

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({
  account,
  onConfirm,
  onCancel,
  deleting,
}: {
  account: BankAccount;
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
                Xác nhận xóa tài khoản
              </h3>
              <p className="text-sm text-[#434751] mt-1 font-body">
                Bạn có chắc muốn xóa tài khoản{" "}
                <span className="font-bold text-[#0b1c30]">
                  {account.account_number}
                </span>{" "}
                ({account.bank_name})?
              </p>
            </div>
          </div>

          {account.is_active && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">
                <span className="font-bold">Cảnh báo:</span> Đây là tài khoản
                đang <span className="font-bold">hoạt động</span>. Sau khi xóa,
                chức năng thanh toán sẽ tạm thời ngưng hoạt động.
              </p>
            </div>
          )}

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
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bank Account Card ────────────────────────────────────────────────────────

const getBankLogoUrl = (code: string) => {
  const map: Record<string, string> = {
    mbbank: "MB",
    vcb: "VCB",
    tcb: "TCB",
    acb: "ACB",
    bidv: "BIDV",
    vib: "VIB",
    tpb: "TPB",
    ocb: "OCB",
    vpb: "VPB",
    agribank: "VBA",
  };
  const mapped = map[code.toLowerCase()] || code.toUpperCase();
  return `https://cdn.vietqr.io/img/${mapped}.png`;
};

function BankAccountCard({
  account,
  switchingId,
  deletingId,
  onActivate,
  onDeactivate,
  onEdit,
  onDelete,
}: {
  account: BankAccount;
  switchingId: string | null;
  deletingId: string | null;
  onActivate: (acc: BankAccount) => void;
  onDeactivate: (acc: BankAccount) => void;
  onEdit: (acc: BankAccount) => void;
  onDelete: (acc: BankAccount) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const abbrev = account.bank_code.slice(0, 4).toUpperCase();
  const logoUrl = getBankLogoUrl(account.bank_code);

  return (
    <div
      className={`bg-white rounded-2xl border flex flex-col overflow-hidden shadow-sm transition-all duration-200
        ${
          account.is_active
            ? "border-primary/40 shadow-primary/10 border-l-4 border-l-primary"
            : "border-[#c3c6d3] hover:border-primary/40"
        }`}
    >
      {/* Card Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* Bank logo + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#c3c6d3]/40 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {!imgError ? (
                <img
                  src={logoUrl}
                  alt={account.bank_name}
                  className="w-14 h-14 object-contain p-1"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-xs font-black text-primary tracking-tight leading-tight text-center">
                  {abbrev}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0b1c30] leading-tight font-headline">
                {account.bank_name}
              </p>
              <p className="text-xs text-[#434751] mt-0.5 font-body">
                {account.bank_code.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Status badge */}
          {account.is_active ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              Đang hoạt động
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#434751] shrink-0">
              Ngừng hoạt động
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[#c3c6d3]/60" />

      {/* Card Body */}
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#434751] uppercase tracking-widest">
            Chủ tài khoản
          </span>
          <span className="text-xs font-bold text-[#0b1c30] uppercase">
            {account.account_name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#434751] uppercase tracking-widest">
            Số tài khoản
          </span>
          <span className="text-sm font-bold text-[#0b1c30] font-mono tracking-wide">
            {account.account_number}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#434751] uppercase tracking-widest">
            Vai trò
          </span>
          {account.is_active ? (
            <span className="flex items-center gap-1 text-xs font-bold text-primary">
              Mặc định
            </span>
          ) : (
            <span className="text-xs text-[#434751] font-medium">—</span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-[#c3c6d3]/60 px-5 py-3 flex items-center justify-between gap-2 bg-[#eff4ff]/30">
        {/* Left: Delete / History */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(account)}
            disabled={deletingId === account.id}
            className="h-8 px-3 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {deletingId === account.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Xóa
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {account.is_active ? (
            <button
              onClick={() => onDeactivate(account)}
              disabled={switchingId === account.id}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-[#434751] bg-white hover:bg-gray-50 border border-[#c3c6d3] transition-colors flex items-center justify-center shadow-sm w-auto disabled:opacity-60"
            >
              {switchingId === account.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Ngừng hoạt động</span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onActivate(account)}
              disabled={switchingId === account.id}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-[#2c5ead] bg-white hover:bg-[#dce9ff] border border-[#c3c6d3] transition-colors flex items-center gap-1.5 disabled:opacity-60 shadow-sm"
            >
              {switchingId === account.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Đặt làm mặc định
            </button>
          )}

          <button
            onClick={() => onEdit(account)}
            className="h-8 px-3 rounded-lg text-xs font-semibold text-[#434751] bg-white hover:bg-[#dce9ff] border border-[#c3c6d3] transition-colors flex items-center justify-center shadow-sm w-8 sm:w-auto sm:px-3"
            title="Chỉnh sửa"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1.5">Chỉnh sửa</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingAccount, setEditingAccount] = useState<
    BankAccount | undefined
  >();

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestGetAllBankAccounts();
      if (res.success) setAccounts(res.data);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenAdd = () => {
    setDialogMode("add");
    setEditingAccount(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (account: BankAccount) => {
    setDialogMode("edit");
    setEditingAccount(account);
    setDialogOpen(true);
  };

  const handleSwitchActive = async (account: BankAccount) => {
    try {
      setSwitchingId(account.id);
      setError(null);
      await requestSwitchActiveBankAccount(account.id);
      await fetchAccounts();
    } catch (err: any) {
      setError(err?.message ?? "Không thể kích hoạt tài khoản.");
    } finally {
      setSwitchingId(null);
    }
  };

  const handleDeactivate = async (account: BankAccount) => {
    try {
      setSwitchingId(account.id);
      setError(null);
      await requestDeactivateBankAccount(account.id);
      await fetchAccounts();
    } catch (err: any) {
      setError(err?.message ?? "Không thể ngừng hoạt động tài khoản.");
    } finally {
      setSwitchingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      setError(null);
      const res = await requestDeleteBankAccount(deleteTarget.id);
      if (!res.success) throw new Error("Xóa thất bại");
      setDeleteTarget(null);
      await fetchAccounts();
    } catch (err: any) {
      setError(err?.message ?? "Không thể xóa tài khoản.");
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  const hasActive = accounts.some((a) => a.is_active);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2c5ead]/10 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-[#2c5ead]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0b1c30] font-headline">
              Tài khoản Ngân hàng
            </h1>
            <p className="text-xs text-[#434751] font-body">
              Quản lý tài khoản nhận thanh toán của hệ thống
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAccounts}
            disabled={loading}
            className="h-9 px-3 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#c3c6d3] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* No active account warning */}
      {!loading && accounts.length > 0 && !hasActive && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 font-medium">
            <span className="font-bold">
              Chưa có tài khoản nào được kích hoạt.
            </span>{" "}
            Chức năng thanh toán gói dịch vụ hiện không khả dụng. Vui lòng đặt
            một tài khoản làm mặc định.
          </p>
        </div>
      )}

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
          <span className="text-sm font-medium">Đang tải...</span>
        </div>
      ) : accounts.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-dashed border-[#c3c6d3]">
          <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] flex items-center justify-center">
            <Landmark className="w-7 h-7 text-[#2c5ead]/40" />
          </div>
          <p className="text-sm text-[#434751] font-medium">
            Chưa có tài khoản ngân hàng nào.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-1 h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm tài khoản đầu tiên
          </button>
        </div>
      ) : (
        /* Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Active account first */}
          {[...accounts]
            .sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0))
            .map((acc) => (
              <BankAccountCard
                key={acc.id}
                account={acc}
                switchingId={switchingId}
                deletingId={deletingId}
                onActivate={handleSwitchActive}
                onDeactivate={handleDeactivate}
                onEdit={handleOpenEdit}
                onDelete={setDeleteTarget}
              />
            ))}
        </div>
      )}

      {/* Stats */}
      {!loading && accounts.length > 0 && (
        <p className="text-xs text-[#434751] font-body">
          Tổng {accounts.length} tài khoản —{" "}
          {hasActive ? (
            <span className="text-primary font-semibold">1 đang hoạt động</span>
          ) : (
            <span className="text-amber-600 font-semibold">
              Chưa có tài khoản mặc định
            </span>
          )}
        </p>
      )}

      {/* Form Dialog */}
      {dialogOpen && (
        <BankAccountFormDialog
          mode={dialogMode}
          account={editingAccount}
          onSuccess={fetchAccounts}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          account={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deletingId === deleteTarget.id}
        />
      )}
    </div>
  );
}
