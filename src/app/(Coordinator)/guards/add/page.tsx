"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Mail, Save, User, X } from "lucide-react";

type FormData = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  identityNumber: string;
  address: string;
  phone: string;
  email: string;
  experience: string;
  height: string;
  weight: string;
  position: string;
  skills: string[];
};

export default function AddGuardPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    dateOfBirth: "",
    gender: "Nam",
    identityNumber: "",
    address: "",
    phone: "",
    email: "",
    experience: "0",
    height: "170",
    weight: "65",
    position: "",
    skills: [],
  });

  const employeeCode = useMemo(() => {
    return "BV-004";
  }, []);

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("New guard data:", {
      code: employeeCode,
      ...formData,
    });

    router.push("/guards");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-6 flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-blue-800 shadow-sm transition hover:bg-blue-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-slate-950">
              Thêm mới nhân viên bảo vệ
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Tạo hồ sơ nhân sự mới trong hệ thống quản lý điều phối.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 lg:grid-cols-[300px_1fr]"
        >
          <div className="space-y-5">
            <section className="rounded-md border border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <button
                  type="button"
                  className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-dashed border-blue-700 bg-blue-50/40 text-blue-800 transition hover:bg-blue-50"
                >
                  <Camera className="h-6 w-6" />
                  <span className="mt-2 text-sm font-bold">Tải ảnh lên</span>
                </button>

                <p className="mt-5 text-base font-bold text-slate-950">
                  Ảnh thẻ nhân viên
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Định dạng JPG, PNG. Kích thước tối đa 2MB.
                </p>
              </div>
            </section>

            <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-slate-700">
                Thông tin hệ thống
              </h2>

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-700">
                    Mã nhân viên <br />
                    <span className="text-slate-500">(Auto)</span>
                  </p>

                  <div className="rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-950">
                    {employeeCode}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-700">
                    Trạng thái
                  </p>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    Bản nháp
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
              <SectionTitle icon={<User className="h-4 w-4" />}>
                Thông tin cá nhân
              </SectionTitle>

              <div className="space-y-5">
                <InputField
                  label="Họ và tên"
                  required
                  value={formData.fullName}
                  placeholder="Nhập họ và tên đầy đủ"
                  onChange={(value) => handleChange("fullName", value)}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Ngày sinh"
                    required
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(value) => handleChange("dateOfBirth", value)}
                  />

                  <div>
                    <Label text="Giới tính" />
                    <div className="relative mt-2">
                      <select
                        value={formData.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                  </div>
                </div>

                <InputField
                  label="Số CCCD/CMND"
                  required
                  value={formData.identityNumber}
                  placeholder="Nhập 12 số CCCD"
                  onChange={(value) => handleChange("identityNumber", value)}
                />

                <InputField
                  label="Địa chỉ thường trú"
                  value={formData.address}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  onChange={(value) => handleChange("address", value)}
                />
              </div>
            </section>

            <section className="rounded-md border border-slate-300 bg-white p-5 shadow-sm">
              <SectionTitle icon={<Mail className="h-4 w-4" />}>
                Thông tin liên hệ
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Số điện thoại"
                  required
                  value={formData.phone}
                  placeholder="09xx xxx xxx"
                  onChange={(value) => handleChange("phone", value)}
                />

                <InputField
                  label="Email"
                  type="email"
                  value={formData.email}
                  placeholder="email@example.com"
                  onChange={(value) => handleChange("email", value)}
                />
              </div>
            </section>

            <div className=" bottom-0 -mx-6 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={() => router.back()}
                className="cursor-pointer flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Hủy
              </button>

              <button
                type="submit"
                className="cursor-pointer flex h-10 items-center justify-center gap-2 rounded bg-blue-800 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900"
              >
                <Save className="h-4 w-4" />
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3 text-blue-800">
      {icon}
      <h2 className="text-sm font-bold text-slate-950">{children}</h2>
    </div>
  );
}

function Label({
  text,
  required = false,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function InputField({
  label,
  required = false,
  type = "text",
  value,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label text={label} required={required} />

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
