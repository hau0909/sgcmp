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

import { useTranslation } from "@/components/providers/LanguageProvider";

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
  const { dict } = useTranslation();
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
            (dict.add_guard?.quota_exceeded ?? "Quota exceeded ({curr}/{max})")
              .replace("{curr}", String(curr))
              .replace("{max}", String(max))
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
      setErrorMessage(dict.add_guard?.error_avatar_format ?? "Avatar only supports JPG or PNG format.");
      event.target.value = "";
      return;
    }

    if (file.size > maximumSize) {
      setErrorMessage(dict.add_guard?.error_avatar_size ?? "Maximum avatar size is 2MB.");
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
        cccdFront: dict.add_guard?.error_cccd_format ?? "ID card image only supports JPG or PNG format.",
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
        cccdBack: dict.add_guard?.error_cccd_format ?? "ID card image only supports JPG or PNG format.",
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
      nextErrors.fullName = dict.add_guard?.validate_name_required ?? "Please enter full name.";
    } else {
      const name = formData.fullName;
      const nameRegex = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;

      if (name.startsWith(" ") || name.endsWith(" ")) {
        nextErrors.fullName = dict.add_guard?.validate_name_no_leading_trailing_space ?? "Full name must not have leading or trailing spaces.";
      } else if (/\s{2,}/.test(name)) {
        nextErrors.fullName = dict.add_guard?.validate_name_no_multiple_spaces ?? "Full name must not contain multiple consecutive spaces.";
      } else if (!nameRegex.test(name)) {
        nextErrors.fullName = dict.add_guard?.validate_name_letters_only ?? "Full name must contain only letters and spaces between words.";
      }
    }

    if (!formData.dateOfBirth) {
      nextErrors.dateOfBirth = dict.add_guard?.validate_dob_required ?? "Please select date of birth.";
    } else {
      const dobDate = new Date(formData.dateOfBirth);
      const today = new Date();

      // Reset hours to compare dates only
      today.setHours(0, 0, 0, 0);
      dobDate.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        nextErrors.dateOfBirth = dict.add_guard?.validate_dob_future ?? "Date of birth cannot be in the future.";
      } else {
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }

        if (age < 18) {
          nextErrors.dateOfBirth = dict.add_guard?.validate_dob_min_age ?? "Security guards must be at least 18 years old.";
        }
      }
    }

    if (!formData.identityNumber.trim()) {
      nextErrors.identityNumber = dict.add_guard?.validate_cccd_required ?? "Please enter ID card number.";
    } else if (!/^(\d{9}|\d{12})$/.test(formData.identityNumber.trim())) {
      nextErrors.identityNumber = dict.add_guard?.validate_cccd_format ?? "ID card number must be 9 or 12 digits.";
    }

    if (!formData.identityIssueDate) {
      nextErrors.identityIssueDate = dict.add_guard?.validate_issue_date_required ?? "Please select the ID card issue date.";
    } else {
      const issueDate = new Date(formData.identityIssueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      issueDate.setHours(0, 0, 0, 0);
      if (issueDate > today) {
        nextErrors.identityIssueDate = dict.add_guard?.validate_issue_date_future ?? "ID card issue date cannot be in the future.";
      }
    }

    if (!formData.identityIssuePlace.trim()) {
      nextErrors.identityIssuePlace = dict.add_guard?.validate_issue_place_required ?? "Please enter the ID card issue place.";
    }

    if (!formData.address.trim()) {
      nextErrors.address = dict.add_guard?.validate_address_required ?? "Please enter permanent address.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = dict.add_guard?.validate_phone_required ?? "Please enter phone number.";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phone.trim())) {
      nextErrors.phone = dict.add_guard?.validate_phone_invalid ?? "Invalid phone number.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = dict.add_guard?.validate_email_required ?? "Please enter email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = dict.add_guard?.validate_email_invalid ?? "Invalid email.";
    }

    if (!avatarFile) {
      nextErrors.avatar = dict.add_guard?.validate_avatar_required ?? "Please upload a staff ID photo.";
    }

    if (!cccdFrontFile) {
      nextErrors.cccdFront = dict.add_guard?.validate_cccd_front_required ?? "Please upload the ID card front image.";
    }

    if (!cccdBackFile) {
      nextErrors.cccdBack = dict.add_guard?.validate_cccd_back_required ?? "Please upload the ID card back image.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setErrorMessage(dict.add_guard?.validate_form_error ?? "Please review the invalid information.");
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
          accountResult.message || (dict.add_guard?.error_create_account ?? "Unable to create guard account."),
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
          throw new Error(uploadResult.message || (dict.add_guard?.error_upload_avatar ?? "Unable to upload guard photo."));
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
            uploadResult.message || (dict.add_guard?.error_upload_front ?? "Unable to upload ID card front image."),
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
            uploadResult.message || (dict.add_guard?.error_upload_back ?? "Unable to upload ID card back image."),
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
          informationResult.message || (dict.add_guard?.error_save_info ?? "Unable to save guard information."),
        );
      }

      setSuccessMessage(
        dict.add_guard?.success_message ?? "Guard account created successfully. A verification email has been sent.",
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
          : (dict.add_guard?.error_generic ?? "Unable to create guard account."),
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
              {dict.add_guard?.page_title}
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              {dict.add_guard?.page_desc}
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
                        alt={dict.add_guard?.avatar_label ?? "Staff photo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <Camera className="h-6 w-6" />
                        <span className="mt-2 text-sm font-bold">
                          {dict.add_guard?.avatar_upload}
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
                      aria-label={dict.add_guard?.avatar_remove_aria}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <p className="mt-5 text-base font-bold text-slate-950">
                  {dict.add_guard?.avatar_label}
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {dict.add_guard?.avatar_hint}
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
                {dict.add_guard?.section_personal}
              </SectionTitle>

              <div className="space-y-5">
                <InputField
                  label={dict.add_guard?.field_fullname ?? "Full Name"}
                  required
                  value={formData.fullName}
                  placeholder={dict.add_guard?.field_fullname_placeholder}
                  disabled={isFormDisabled}
                  onChange={(value) => handleChange("fullName", value)}
                  error={fieldErrors.fullName}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label={dict.add_guard?.field_dob ?? "Date of Birth"}
                    required
                    type="date"
                    value={formData.dateOfBirth}
                    disabled={isFormDisabled}
                    onChange={(value) => handleChange("dateOfBirth", value)}
                    error={fieldErrors.dateOfBirth}
                    max={todayStr}
                  />

                  <div>
                    <Label text={dict.add_guard?.field_gender ?? "Gender"} required />

                    <select
                      value={formData.gender}
                      disabled={isFormDisabled}
                      onChange={(event) =>
                        handleChange("gender", event.target.value)
                      }
                      className="mt-2 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    >
                      <option value="male">{dict.add_guard?.gender_male}</option>
                      <option value="female">{dict.add_guard?.gender_female}</option>
                    </select>
                  </div>
                </div>

                <InputField
                  label={dict.add_guard?.field_cccd ?? "National ID Number"}
                  required
                  value={formData.identityNumber}
                  placeholder={dict.add_guard?.field_cccd_placeholder}
                  disabled={isFormDisabled}
                  onChange={(value) =>
                    handleChange("identityNumber", value.replace(/\D/g, ""))
                  }
                  error={fieldErrors.identityNumber}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label={dict.add_guard?.field_issue_date ?? "ID Issue Date"}
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
                    label={dict.add_guard?.field_issue_place ?? "ID Issue Place"}
                    required
                    value={formData.identityIssuePlace}
                    placeholder={dict.add_guard?.field_issue_place_placeholder}
                    disabled={isFormDisabled}
                    onChange={(value) =>
                      handleChange("identityIssuePlace", value)
                    }
                    error={fieldErrors.identityIssuePlace}
                  />
                </div>

                <div>
                  <Label text={dict.add_guard?.field_cccd_images ?? "ID Card Images"} />
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
                              <span className="mt-1 text-xs font-semibold">{dict.add_guard?.cccd_front}</span>
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
                              <span className="mt-1 text-xs font-semibold">{dict.add_guard?.cccd_back}</span>
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
                  <Label text={dict.add_guard?.field_address ?? "Permanent Address"} required />
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {/* City */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">{dict.add_guard?.field_city}</label>
                      <select
                        value={selectedCityId}
                        disabled={isFormDisabled || loadingCities}
                        onChange={(e) => setSelectedCityId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      >
                        <option value="">{loadingCities ? dict.add_guard?.city_loading : dict.add_guard?.city_placeholder}</option>
                        {cities.map((c) => (
                          <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Ward */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">{dict.add_guard?.field_ward}</label>
                      <select
                        value={selectedWardId}
                        disabled={isFormDisabled || loadingWards || selectedCityId === ""}
                        onChange={(e) => setSelectedWardId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      >
                        <option value="">{loadingWards ? dict.add_guard?.ward_loading : selectedCityId === "" ? dict.add_guard?.ward_select_city_first : dict.add_guard?.ward_placeholder}</option>
                        {wards.map((w) => (
                          <option key={w.ward_id} value={w.ward_id}>{w.ward_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* Street */}
                  <div className="mt-2">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">{dict.add_guard?.field_street}</label>
                    <input
                      type="text"
                      value={streetInput}
                      disabled={isFormDisabled}
                      placeholder={dict.add_guard?.field_street_placeholder}
                      onChange={(e) => setStreetInput(e.target.value)}
                      className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  {/* Preview */}
                  {formData.address && (
                    <p className="mt-2 text-xs text-slate-500">
                      {dict.add_guard?.address_full_preview} <span className="font-semibold text-slate-700">{formData.address}</span>
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
                {dict.add_guard?.section_contact}
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label={dict.add_guard?.field_phone ?? "Phone Number"}
                  required
                  value={formData.phone}
                  placeholder={dict.add_guard?.field_phone_placeholder}
                  disabled={isFormDisabled}
                  onChange={(value) =>
                    handleChange("phone", value.replace(/[^\d+]/g, ""))
                  }
                  error={fieldErrors.phone}
                />

                <InputField
                  label={dict.add_guard?.field_email ?? "Email"}
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
                {dict.add_guard?.btn_cancel}
              </button>

              <button
                type="submit"
                disabled={isFormDisabled}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded bg-blue-800 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {dict.add_guard?.btn_submitting}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {dict.add_guard?.btn_submit}
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
