"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { BankAccount } from "@/types/BankAccount";
import { UpsertBankAccountPayload } from "@/features/payment/types";
import {
  requestCreateBankAccount,
  requestUpdateBankAccount,
} from "@/features/payment/api/payment.api";

// Popular Vietnamese banks for the dropdown
const BANK_OPTIONS = [
  { code: "mbbank", name: "Ngân hàng TMCP Quân đội (MBBank)" },
  { code: "vcb", name: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)" },
  { code: "tcb", name: "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)" },
  { code: "acb", name: "Ngân hàng TMCP Á Châu (ACB)" },
  { code: "bidv", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)" },
  { code: "vib", name: "Ngân hàng TMCP Quốc Tế Việt Nam (VIB)" },
  { code: "tpb", name: "Ngân hàng TMCP Tiên Phong (TPBank)" },
  { code: "ocb", name: "Ngân hàng TMCP Phương Đông (OCB)" },
  { code: "vpb", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)" },
  { code: "agribank", name: "Ngân hàng Nông nghiệp và PTNT Việt Nam (Agribank)" },
];

interface BankAccountFormDialogProps {
  mode: "add" | "edit";
  account?: BankAccount;
  onSuccess: () => void;
  onClose: () => void;
}

export default function BankAccountFormDialog({
  mode,
  account,
  onSuccess,
  onClose,
}: BankAccountFormDialogProps) {
  const [form, setForm] = useState<UpsertBankAccountPayload>({
    bank_code: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && account) {
      setForm({
        bank_code: account.bank_code,
        bank_name: account.bank_name,
        account_number: account.account_number,
        account_name: account.account_name,
      });
    }
  }, [mode, account]);

  const handleBankCodeChange = (code: string) => {
    const selected = BANK_OPTIONS.find((b) => b.code === code);
    setForm((prev) => ({
      ...prev,
      bank_code: code,
      bank_name: selected?.name ?? prev.bank_name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "add") {
        await requestCreateBankAccount(form);
      } else if (mode === "edit" && account) {
        await requestUpdateBankAccount(account.id, form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#c3c6d3] bg-[#eff4ff]">
          <h2 className="text-base font-bold text-[#0b1c30] font-headline">
            {mode === "add" ? "Thêm tài khoản ngân hàng" : "Cập nhật tài khoản ngân hàng"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#434751] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#dce9ff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Bank Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434751] font-body">
              Ngân hàng <span className="text-red-500">*</span>
            </label>
            <select
              value={form.bank_code}
              onChange={(e) => handleBankCodeChange(e.target.value)}
              required
              className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] bg-white focus:outline-none focus:border-[#2c5ead] transition-colors"
            >
              <option value="" disabled>
                -- Chọn ngân hàng --
              </option>
              {BANK_OPTIONS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bank Name (auto-filled, editable) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434751] font-body">
              Tên ngân hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.bank_name}
              onChange={(e) => setForm((p) => ({ ...p, bank_name: e.target.value }))}
              required
              placeholder="Nhập tên ngân hàng"
              className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors"
            />
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434751] font-body">
              Số tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.account_number}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setForm((p) => ({ ...p, account_number: val }));
              }}
              required
              placeholder="Nhập số tài khoản"
              className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] focus:outline-none focus:border-[#2c5ead] transition-colors"
            />
            <p className="text-[11px] text-[#737785]">
              Chỉ nhập các ký tự số (0-9).
            </p>
          </div>

          {/* Account Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#434751] font-body">
              Tên chủ tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.account_name}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\p{L}\s]/gu, "");
                setForm((p) => ({ ...p, account_name: val.toUpperCase() }));
              }}
              required
              placeholder="NGUYEN VAN A"
              className="h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] uppercase focus:outline-none focus:border-[#2c5ead] transition-colors"
            />
            <p className="text-[11px] text-[#737785]">
              Chỉ nhập chữ cái và dấu cách. Tên sẽ tự động viết hoa.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
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
