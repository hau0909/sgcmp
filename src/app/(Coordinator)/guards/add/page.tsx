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
import { requestGetCities, requestGetWards } from "@/features/address";
import type { City, Ward } from "@/features/address/types";

import {
  requestCreateGuardAccount,
  requestInsertGuardInformation,
  requestUploadGuardAvatar,
  requestUploadGuardFile,
  requestCheckGuardQuota,
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
  const cccdFrontInputRef = useRef<HTMLInputElement>(null);
  const cccdBackInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<GuardFormData>(INITIAL_FORM_DATA);

  // Address dropdowns
  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | "">("");
  const [selectedWardId, setSelectedWardId] = useState<number | "">("");
  const [streetInput, setStreetInput] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);

  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState("");

  useEffect(() => {
    const checkQuota = async () => {
      try {
        const res = await requestCheckGuardQuota();
        if (res.success && res.data?.isExceeded) {
          setQuotaExceeded(true);
          const max = res.data.maxGuards;
          const curr = res.data.currentGuards;
          setQuotaMessage(
            `Công ty đã đạt giới hạn số lượng bảo vệ được phép (${curr}/${max}). Vui lòng nâng cấp gói sử dụng dịch vụ trước khi thêm bảo vệ mới.`
          );
        }
      } catch (error) {
        console.error("Lỗi kiểm tra giới hạn bảo vệ:", error);
      }
    };
    checkQuota();
  }, []);

  // Load cities
  useEffect(() => {
    async function loadCities() {
      try {
        setLoadingCities(true);
        const res = await requestGetCities();
        if (res?.success && res.cities) setCities(res.cities);
      } catch (err) {
        console.error("Failed to load cities:", err);
      } finally {
        setLoadingCities(false);
      }
    }
    loadCities();
  }, []);

  // Load wards when city changes
  useEffect(() => {
    setSelectedWardId("");
    setWards([]);
    if (selectedCityId === "") return;
    async function loadWards() {
      try {
        setLoadingWards(true);
        const res = await requestGetWards(Number(selectedCityId));
        if (res?.success && res.wards) setWards(res.wards);
      } catch (err) {
        console.error("Failed to load wards:", err);
      } finally {
        setLoadingWards(false);
      }
    }
    loadWards();
  }, [selectedCityId]);

  // Auto-build address string from street + ward + city
  useEffect(() => {
    const parts: string[] = [];
    if (streetInput.trim()) parts.push(streetInput.trim());
    if (selectedWardId !== "") {
      const ward = wards.find((w) => w.ward_id === selectedWardId);
      if (ward) parts.push(ward.ward_name);
    }
    if (selectedCityId !== "") {
      const city = cities.find((c) => c.city_id === selectedCityId);
      if (city) parts.push(city.city_name);
    }
    handleChange("address", parts.join(", "));
  }, [streetInput, selectedWardId, selectedCityId, wards, cities]);

  const isFormDisabled = isSubmitting || quotaExceeded;

  const employeeCode = useMemo(() => {
    return "BV-004";
  }, []);

  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    if (cccdFrontPreview) {
      URL.revokeObjectURL(cccdFrontPreview);
    }
    if (cccdBackPreview) {
      URL.revokeObjectURL(cccdBackPreview);
    }

    setAvatarFile(null);
    setAvatarPreview(null);
    setCccdFrontFile(null);
    setCccdFrontPreview(null);
    setCccdBackFile(null);
    setCccdBackPreview(null);
    setErrorMessage("");
    setFieldErrors({});

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    if (cccdFrontInputRef.current) {
      cccdFrontInputRef.current.value = "";
    }
    if (cccdBackInputRef.current) {
      cccdBackInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    return () => {
      if (cccdFrontPreview) {
        URL.revokeObjectURL(cccdFrontPreview);
      }
    };
  }, [cccdFrontPreview]);

  useEffect(() => {
    return () => {
      if (cccdBackPreview) {
        URL.revokeObjectURL(cccdBackPreview);
      }
    };
  }, [cccdBackPreview]);

  const handleChange = (field: keyof GuardFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
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
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.avatar;
      return next;
    });
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

  const handleCccdFrontChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const acceptedTypes = ["image/jpeg", "image/png"];

    if (!acceptedTypes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        cccdFront: "Ảnh CCCD chỉ hỗ trợ định dạng JPG hoặc PNG.",
      }));
      event.target.value = "";
      return;
    }

    if (cccdFrontPreview) {
      URL.revokeObjectURL(cccdFrontPreview);
    }

    setCccdFrontFile(file);
    setCccdFrontPreview(URL.createObjectURL(file));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.cccdFront;
      return next;
    });
    setErrorMessage("");
  };

  const handleRemoveCccdFront = () => {
    if (cccdFrontPreview) {
      URL.revokeObjectURL(cccdFrontPreview);
    }

    setCccdFrontFile(null);
    setCccdFrontPreview(null);

    if (cccdFrontInputRef.current) {
      cccdFrontInputRef.current.value = "";
    }
  };

  const handleCccdBackChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const acceptedTypes = ["image/jpeg", "image/png"];

    if (!acceptedTypes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        cccdBack: "Ảnh CCCD chỉ hỗ trợ định dạng JPG hoặc PNG.",
      }));
      event.target.value = "";
      return;
    }

    if (cccdBackPreview) {
      URL.revokeObjectURL(cccdBackPreview);
    }

    setCccdBackFile(file);
    setCccdBackPreview(URL.createObjectURL(file));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.cccdBack;
      return next;
    });
    setErrorMessage("");
  };

  const handleRemoveCccdBack = () => {
    if (cccdBackPreview) {
      URL.revokeObjectURL(cccdBackPreview);
    }

    setCccdBackFile(null);
    setCccdBackPreview(null);

    if (cccdBackInputRef.current) {
      cccdBackInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName) {
      nextErrors.fullName = "Vui lòng nhập họ và tên.";
    } else {
      const name = formData.fullName;
      const nameRegex = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;

      if (name.startsWith(" ") || name.endsWith(" ")) {
        nextErrors.fullName = "Họ và tên không được chứa khoảng trắng ở đầu hoặc cuối.";
      } else if (/\s{2,}/.test(name)) {
        nextErrors.fullName = "Họ và tên không được chứa nhiều khoảng trắng liên tiếp.";
      } else if (!nameRegex.test(name)) {
        nextErrors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng giữa các từ.";
      }
    }

    if (!formData.dateOfBirth) {
      nextErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
    } else {
      const dobDate = new Date(formData.dateOfBirth);
      const today = new Date();

      // Reset hours to compare dates only
      today.setHours(0, 0, 0, 0);
      dobDate.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        nextErrors.dateOfBirth = "Ngày sinh không được ở tương lai.";
      } else {
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }

        if (age < 18) {
          nextErrors.dateOfBirth = "Nhân viên bảo vệ phải từ 18 tuổi trở lên.";
        }
      }
    }

    if (!formData.identityNumber.trim()) {
      nextErrors.identityNumber = "Vui lòng nhập số CCCD/CMND.";
    } else if (!/^(\d{9}|\d{12})$/.test(formData.identityNumber.trim())) {
      nextErrors.identityNumber = "CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
    }

    if (!formData.identityIssueDate) {
      nextErrors.identityIssueDate = "Vui lòng chọn ngày cấp CCCD/CMND.";
    } else {
      const issueDate = new Date(formData.identityIssueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      issueDate.setHours(0, 0, 0, 0);
      if (issueDate > today) {
        nextErrors.identityIssueDate = "Ngày cấp CCCD/CMND không được ở tương lai.";
      }
    }

    if (!formData.identityIssuePlace.trim()) {
      nextErrors.identityIssuePlace = "Vui lòng nhập nơi cấp CCCD/CMND.";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ thường trú.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone.trim())) {
      nextErrors.phone = "Số điện thoại không hợp lệ.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Email không hợp lệ.";
    }

    if (!avatarFile) {
      nextErrors.avatar = "Vui lòng tải ảnh thẻ nhân viên.";
    }

    if (!cccdFrontFile) {
      nextErrors.cccdFront = "Vui lòng tải ảnh mặt trước CCCD.";
    }

    if (!cccdBackFile) {
      nextErrors.cccdBack = "Vui lòng tải ảnh mặt sau CCCD.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setErrorMessage("Vui lòng kiểm tra lại các thông tin chưa hợp lệ.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
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
       * Bước 2.5: upload CCCD images
       */
      let frontUrl: string | null = null;
      let backUrl: string | null = null;

      if (cccdFrontFile) {
        const uploadResult = await requestUploadGuardFile(
          cccdFrontFile,
          guardUserId,
          "cccd_front",
        );

        if (!uploadResult.success || !uploadResult.data?.public_url) {
          throw new Error(
            uploadResult.message || "Không thể tải ảnh mặt trước CCCD.",
          );
        }

        frontUrl = uploadResult.data.public_url;
      }

      if (cccdBackFile) {
        const uploadResult = await requestUploadGuardFile(
          cccdBackFile,
          guardUserId,
          "cccd_back",
        );

        if (!uploadResult.success || !uploadResult.data?.public_url) {
          throw new Error(
            uploadResult.message || "Không thể tải ảnh mặt sau CCCD.",
          );
        }

        backUrl = uploadResult.data.public_url;
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
        front_url: frontUrl,
        back_url: backUrl,
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

        {quotaExceeded && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm flex items-center gap-2 animate-fade-in">
            <svg
              className="h-5 w-5 text-red-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{quotaMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
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
                  disabled={isFormDisabled}
                />

                <div className="relative">
                  <button
                    type="button"
                    disabled={isFormDisabled}
                    onClick={() => !isFormDisabled && avatarInputRef.current?.click()}
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
                      disabled={isFormDisabled}
                      onClick={handleRemoveAvatar}
                      className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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

                {fieldErrors.avatar && (
                  <p className="mt-2 text-xs font-semibold text-red-500">
                    {fieldErrors.avatar}
                  </p>
                )}
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
                  disabled={isFormDisabled}
                  onChange={(value) => handleChange("fullName", value)}
                  error={fieldErrors.fullName}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Ngày sinh"
                    required
                    type="date"
                    value={formData.dateOfBirth}
                    disabled={isFormDisabled}
                    onChange={(value) => handleChange("dateOfBirth", value)}
                    error={fieldErrors.dateOfBirth}
                    max={todayStr}
                  />

                  <div>
                    <Label text="Giới tính" required />

                    <select
                      value={formData.gender}
                      disabled={isFormDisabled}
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
                  disabled={isFormDisabled}
                  onChange={(value) =>
                    handleChange("identityNumber", value.replace(/\D/g, ""))
                  }
                  error={fieldErrors.identityNumber}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label="Ngày cấp CCCD/CMND"
                    required
                    type="date"
                    value={formData.identityIssueDate}
                    disabled={isFormDisabled}
                    onChange={(value) =>
                      handleChange("identityIssueDate", value)
                    }
                    error={fieldErrors.identityIssueDate}
                    max={todayStr}
                  />

                  <InputField
                    label="Nơi cấp CCCD/CMND"
                    required
                    value={formData.identityIssuePlace}
                    placeholder="Nhập nơi cấp"
                    disabled={isFormDisabled}
                    onChange={(value) =>
                      handleChange("identityIssuePlace", value)
                    }
                    error={fieldErrors.identityIssuePlace}
                  />
                </div>

                <div>
                  <Label text="Ảnh CCCD/CMND" />
                  <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    {/* Front CCCD Image */}
                    <div>
                      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-slate-50 p-4">
                        <input
                          ref={cccdFrontInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleCccdFrontChange}
                          className="hidden"
                          disabled={isFormDisabled}
                        />
                        <div
                          onClick={() => !isFormDisabled && cccdFrontInputRef.current?.click()}
                          className={`relative w-full aspect-video flex items-center justify-center overflow-hidden rounded-md border-2 border-dashed bg-white cursor-pointer hover:border-blue-700 transition ${
                            fieldErrors.cccdFront ? "border-red-500" : "border-slate-300"
                          } ${isFormDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          {cccdFrontPreview ? (
                            <>
                              <img
                                src={cccdFrontPreview}
                                alt="Mặt trước CCCD"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                disabled={isFormDisabled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCccdFront();
                                }}
                                className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center text-slate-500 hover:text-blue-800 transition">
                              <Camera className="h-8 w-8" />
                              <span className="mt-1 text-xs font-semibold">Mặt trước CCCD</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {fieldErrors.cccdFront && (
                        <p className="mt-1 text-xs font-semibold text-red-500">
                          {fieldErrors.cccdFront}
                        </p>
                      )}
                    </div>

                    {/* Back CCCD Image */}
                    <div>
                      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-slate-50 p-4">
                        <input
                          ref={cccdBackInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleCccdBackChange}
                          className="hidden"
                          disabled={isFormDisabled}
                        />
                        <div
                          onClick={() => !isFormDisabled && cccdBackInputRef.current?.click()}
                          className={`relative w-full aspect-video flex items-center justify-center overflow-hidden rounded-md border-2 border-dashed bg-white cursor-pointer hover:border-blue-700 transition ${
                            fieldErrors.cccdBack ? "border-red-500" : "border-slate-300"
                          } ${isFormDisabled ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          {cccdBackPreview ? (
                            <>
                              <img
                                src={cccdBackPreview}
                                alt="Mặt sau CCCD"
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                disabled={isFormDisabled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCccdBack();
                                }}
                                className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center text-slate-500 hover:text-blue-800 transition">
                              <Camera className="h-8 w-8" />
                              <span className="mt-1 text-xs font-semibold">Mặt sau CCCD</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {fieldErrors.cccdBack && (
                        <p className="mt-1 text-xs font-semibold text-red-500">
                          {fieldErrors.cccdBack}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address: City + Ward + Street */}
                <div>
                  <Label text="Địa chỉ thường trú" required />
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {/* City */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Tỉnh / Thành phố</label>
                      <select
                        value={selectedCityId}
                        disabled={isFormDisabled || loadingCities}
                        onChange={(e) => setSelectedCityId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      >
                        <option value="">{loadingCities ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
                        {cities.map((c) => (
                          <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Ward */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Phường / Xã</label>
                      <select
                        value={selectedWardId}
                        disabled={isFormDisabled || loadingWards || selectedCityId === ""}
                        onChange={(e) => setSelectedWardId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      >
                        <option value="">{loadingWards ? "Đang tải..." : selectedCityId === "" ? "Chọn tỉnh trước" : "Chọn phường/xã"}</option>
                        {wards.map((w) => (
                          <option key={w.ward_id} value={w.ward_id}>{w.ward_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Street */}
                  <div className="mt-2">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Số nhà, tên đường</label>
                    <input
                      type="text"
                      value={streetInput}
                      disabled={isFormDisabled}
                      placeholder="VD: 123 Nguyễn Văn A"
                      onChange={(e) => setStreetInput(e.target.value)}
                      className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  {/* Preview */}
                  {formData.address && (
                    <p className="mt-2 text-xs text-slate-500">
                      Địa chỉ đầy đủ: <span className="font-semibold text-slate-700">{formData.address}</span>
                    </p>
                  )}
                  {fieldErrors.address && (
                    <p className="mt-1 text-xs font-semibold text-red-500">{fieldErrors.address}</p>
                  )}
                </div>
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
                  disabled={isFormDisabled}
                  onChange={(value) =>
                    handleChange("phone", value.replace(/[^\d+]/g, ""))
                  }
                  error={fieldErrors.phone}
                />

                <InputField
                  label="Email"
                  required
                  type="email"
                  value={formData.email}
                  placeholder="email@example.com"
                  disabled={isFormDisabled}
                  onChange={(value) => handleChange("email", value)}
                  error={fieldErrors.email}
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
                disabled={isFormDisabled}
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
  error,
  max,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  error?: string;
  max?: string;
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
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-10 w-full rounded border bg-white px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${error
          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
          : "border-slate-300 focus:border-blue-700 focus:ring-blue-100"
          }`}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
