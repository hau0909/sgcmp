"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Mail, Save, User, X } from "lucide-react";

import {
  requestCreateGuardAccount,
  requestInsertGuardInformation,
  requestUploadGuardAvatar,
} from "@/features/guards/api/guard.api";

type Gender = "male" | "female";

type GuardFormData = {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;

  identityNumber: string;
  identityIssueDate: string;
  identityIssuePlace: string;

  address: string;
  phone: string;
  email: string;
};
const INITIAL_FORM_DATA: GuardFormData = {
  fullName: "",
  dateOfBirth: "",
  gender: "male",

  identityNumber: "",
  identityIssueDate: "",
  identityIssuePlace: "",

  address: "",
  phone: "",
  email: "",
};
export default function AddGuardPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<GuardFormData>(INITIAL_FORM_DATA);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const employeeCode = useMemo(() => {
    return "BV-004";
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview(null);
    setErrorMessage("");

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (field: keyof GuardFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrorMessage("");
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const acceptedTypes = ["image/jpeg", "image/png"];
    const maximumSize = 2 * 1024 * 1024;

    if (!acceptedTypes.includes(file.type)) {
      setErrorMessage("Ảnh chỉ hỗ trợ định dạng JPG hoặc PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > maximumSize) {
      setErrorMessage("Kích thước ảnh tối đa là 2MB.");
      event.target.value = "";
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview(null);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return "Vui lòng nhập họ và tên.";
    }

    if (!formData.dateOfBirth) {
      return "Vui lòng chọn ngày sinh.";
    }

    if (!formData.identityNumber.trim()) {
      return "Vui lòng nhập số CCCD/CMND.";
    }

    if (!/^(\d{9}|\d{12})$/.test(formData.identityNumber.trim())) {
      return "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
    }

    if (!formData.identityIssueDate) {
      return "Vui lòng chọn ngày cấp CCCD/CMND.";
    }

    if (!formData.identityIssuePlace.trim()) {
      return "Vui lòng nhập nơi cấp CCCD/CMND.";
    }

    if (!formData.address.trim()) {
      return "Vui lòng nhập địa chỉ thường trú.";
    }

    if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone.trim())) {
      return "Số điện thoại không hợp lệ.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Email không hợp lệ.";
    }

    if (!avatarFile) {
      return "Vui lòng tải ảnh thẻ nhân viên.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      /*
       * Bước 1: tạo Supabase Auth account cho Guard
       */
      const accountResult = await requestCreateGuardAccount({
        email: formData.email.trim().toLowerCase(),
        full_name: formData.fullName.trim(),
        phone_number: formData.phone.trim(),
        identity_id: formData.identityNumber.trim(),
      });

      if (!accountResult.success || !accountResult.data?.user_id) {
        throw new Error(
          accountResult.message || "Không thể tạo tài khoản bảo vệ.",
        );
      }

      const guardUserId = accountResult.data.user_id;

      /*
       * Bước 2: upload avatar
       */
      let avatar_url: string | null = null;

      if (avatarFile) {
        const uploadResult = await requestUploadGuardAvatar(
          avatarFile,
          guardUserId,
        );

        if (!uploadResult.success || !uploadResult.data?.public_url) {
          throw new Error(uploadResult.message || "Không thể tải ảnh bảo vệ.");
        }

        avatar_url = uploadResult.data.public_url;
      }

      /*
       * Bước 3: insert profiles, guards, identities
       */
      const informationResult = await requestInsertGuardInformation({
        user_id: guardUserId,

        full_name: formData.fullName.trim(),
        phone_number: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),

        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim(),

        avatar_url,

        identity_id: formData.identityNumber.trim(),
        identity_issue_date: formData.identityIssueDate,
        identity_issue_place: formData.identityIssuePlace.trim(),
      });

      if (!informationResult.success) {
        throw new Error(
          informationResult.message || "Không thể lưu thông tin bảo vệ.",
        );
      }

      setSuccessMessage(
        "Tạo tài khoản bảo vệ thành công. Email xác thực đã được gửi.",
      );
      resetForm();
      setTimeout(() => {
        router.push("/guards");
        setSuccessMessage("");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("Create Guard error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tạo tài khoản bảo vệ.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-6 flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-blue-800 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <div className="relative">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-blue-700 bg-blue-50/40 text-blue-800 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Ảnh thẻ bảo vệ"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera className="h-6 w-6" />
                        <span className="mt-2 text-sm font-bold">
                          Tải ảnh lên
                        </span>
                      </>
                    )}
                  </button>

                  {avatarPreview && (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRemoveAvatar}
                      className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                      aria-label="Xóa ảnh"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="mt-5 text-base font-bold text-slate-950">
                  Ảnh thẻ nhân viên
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Định dạng JPG, PNG. Kích thước tối đa 2MB.
                </p>
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
                  disabled={isSubmitting}
                  onChange={(value) => handleChange("fullName", value)}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Ngày sinh"
                    required
                    type="date"
                    value={formData.dateOfBirth}
                    disabled={isSubmitting}
                    onChange={(value) => handleChange("dateOfBirth", value)}
                  />

                  <div>
                    <Label text="Giới tính" required />

                    <select
                      value={formData.gender}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        handleChange("gender", event.target.value)
                      }
                      className="mt-2 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>

                <InputField
                  label="Số CCCD/CMND"
                  required
                  value={formData.identityNumber}
                  placeholder="Nhập 9 hoặc 12 số"
                  disabled={isSubmitting}
                  onChange={(value) =>
                    handleChange("identityNumber", value.replace(/\D/g, ""))
                  }
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Ngày cấp CCCD/CMND"
                    required
                    type="date"
                    value={formData.identityIssueDate}
                    disabled={isSubmitting}
                    onChange={(value) =>
                      handleChange("identityIssueDate", value)
                    }
                  />

                  <InputField
                    label="Nơi cấp CCCD/CMND"
                    required
                    value={formData.identityIssuePlace}
                    placeholder="Nhập nơi cấp"
                    disabled={isSubmitting}
                    onChange={(value) =>
                      handleChange("identityIssuePlace", value)
                    }
                  />
                </div>

                <InputField
                  label="Địa chỉ thường trú"
                  required
                  value={formData.address}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  onChange={(value) =>
                    handleChange("phone", value.replace(/[^\d+]/g, ""))
                  }
                />

                <InputField
                  label="Email"
                  required
                  type="email"
                  value={formData.email}
                  placeholder="email@example.com"
                  disabled={isSubmitting}
                  onChange={(value) => handleChange("email", value)}
                />
              </div>
            </section>

            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            )}

            <div className="-mx-6 flex justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-6 py-4 backdrop-blur">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => router.back()}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded bg-blue-800 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu hồ sơ
                  </>
                )}
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
  icon: ReactNode;
  children: ReactNode;
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
      {text}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function InputField({
  label,
  required = false,
  type = "text",
  value,
  placeholder,
  disabled = false,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
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
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}
