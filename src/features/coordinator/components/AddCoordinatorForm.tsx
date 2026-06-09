"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Building2,
  ChevronDown,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AddCoordinatorFormData {
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  email: string;
  address: string;
  id_number: string;
  issue_date: string;
  issue_place: string;
}

const INITIAL: AddCoordinatorFormData = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  phone_number: "",
  email: "",
  address: "",
  id_number: "",
  issue_date: "",
  issue_place: "",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-outline-variant bg-surface-container-lowest">
        <span className="text-primary w-4 h-4 flex items-center justify-center">{icon}</span>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {/* Section body */}
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-body-sm font-body-sm text-on-surface-variant mb-1"
    >
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-3 pr-3 py-1.5 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
      />
    </div>
  );
}

function SelectInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none pl-3 pr-8 py-1.5 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-on-surface-variant pointer-events-none" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AddCoordinatorForm() {
  const router = useRouter();
  const [form, setForm] = useState<AddCoordinatorFormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: wire up API call, e.g. requestCreateCoordinator(companyId, form)
      console.log("Submit payload:", form);
      router.back();
    } catch (err) {
      console.error("Lỗi tạo điều phối viên:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Thông tin cơ bản ── */}
      <SectionCard
        icon={<User className="w-4 h-4" />}
        title="Thông tin cơ bản"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="full_name" required>
              Họ và tên
            </FieldLabel>
            <TextInput
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <FieldLabel htmlFor="date_of_birth" required>
              Ngày sinh
            </FieldLabel>
            <TextInput
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
            />
          </div>
          <div>
            <FieldLabel htmlFor="gender" required>
              Giới tính
            </FieldLabel>
            <SelectInput
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              placeholder="Chọn giới tính"
              options={[
                { label: "Nam", value: "male" },
                { label: "Nữ", value: "female" },
                { label: "Khác", value: "other" },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Thông tin liên hệ ── */}
      <SectionCard
        icon={<Phone className="w-4 h-4" />}
        title="Thông tin liên hệ"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="phone_number" required>
              Số điện thoại
            </FieldLabel>
            <TextInput
              id="phone_number"
              name="phone_number"
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div>
            <FieldLabel htmlFor="email" required>
              Email
            </FieldLabel>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@domain.com"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="address">
              Địa chỉ thường trú
            </FieldLabel>
            <TextInput
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ chi tiết"
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Thông tin định danh ── */}
      <SectionCard
        icon={<CreditCard className="w-4 h-4" />}
        title="Thông tin định danh"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="id_number" required>
              Số CCCD / Hộ chiếu
            </FieldLabel>
            <TextInput
              id="id_number"
              name="id_number"
              value={form.id_number}
              onChange={handleChange}
              placeholder="Nhập số giấy tờ"
            />
          </div>
          <div>
            <FieldLabel htmlFor="issue_date">
              Ngày cấp
            </FieldLabel>
            <TextInput
              id="issue_date"
              name="issue_date"
              type="date"
              value={form.issue_date}
              onChange={handleChange}
            />
          </div>
          <div>
            <FieldLabel htmlFor="issue_place">
              Nơi cấp
            </FieldLabel>
            <TextInput
              id="issue_place"
              name="issue_place"
              value={form.issue_place}
              onChange={handleChange}
              placeholder="Cục CS QLHC về TTXH"
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Action buttons ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="h-[36px] px-4 border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container text-body-sm font-body-sm transition-colors flex items-center gap-1.5 shadow-none"
        >
          <X className="w-[15px] h-[15px]" />
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="h-[36px] px-4 rounded bg-secondary hover:bg-primary text-on-secondary text-body-sm font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 duration-100"
        >
          <Save className="w-[15px] h-[15px]" />
          {submitting ? "Đang tạo..." : "Tạo tài khoản mới"}
        </button>
      </div>
    </form>
  );
}
