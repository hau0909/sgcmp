"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { requestGetUserProfile, requestRegisterAccount } from "@/features/auth/api/auth.api";
import { RegisterPayload } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/client";
import { requestSubmitRegistration } from "../api/registration.api";
import StepperHeader from "./StepperHeader";
import StepPersonal from "./StepPersonal";
import StepCompany from "./StepCompany";
import StepReview from "./StepReview";
import StepSignUp from "./StepSignUp";

const generateUUID = (): string => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function RegisterCompanyStepper() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user_id);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  // Signup payload collected from StepSignUp (guest flow)
  const [signupPayload, setSignupPayload] = useState<RegisterPayload | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal + CCCD
    fullName: "",
    phoneNumber: "",
    email: "",
    avatarFile: null as File | null,
    avatarUrl: "",
    identityId: "",
    issueDate: "",
    issuePlace: "",
    frontFile: null as File | null,
    frontUrl: "",
    backFile: null as File | null,
    backUrl: "",

    // Step 2: Company Info + Docs
    companyName: "",
    businessLicenseNo: "",
    cityId: "" as number | "",
    wardId: "" as number | "",
    street: "",
    companyEmail: "",
    companyPhone: "",
    description: "",
    logoFile: null as File | null,
    logoUrl: "",
    licenseFile: null as File | null,
    licenseUrl: "",
    galleryFiles: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch and populate profile details based on logged-in userId
  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        try {
          setAuthLoading(true);

          // 1. Check if user already owns a company
          const { data: compData, error: compErr } = await supabase
            .from("companies")
            .select("company_id")
            .eq("owner_id", userId)
            .maybeSingle();

          if (compErr) {
            console.error("Check existing company error:", compErr);
          }

          if (compData) {
            setHasRegistered(true);
            setAuthLoading(false);
            return;
          }

          // 2. Fetch profile details
          const result = await requestGetUserProfile();
          if (result?.success && result?.data) {
            const p = result.data;
            setUser({ id: userId, email: p.email || "" });
            setFormData((prev) => ({
              ...prev,
              email: p.email || "",
              fullName: prev.fullName || p.full_name || "",
              phoneNumber: prev.phoneNumber || p.phone_number || "",
            }));
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error("Fetch profile error:", err);
          setUser(null);
        } finally {
          setAuthLoading(false);
        }
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    };
    fetchProfile();
  }, [userId, supabase]);

  // When user is not logged in, show signup step first (step 1 of 4)
  // isGuestFlow = true means we render the 4-step flow with signup as step 1
  const isGuestFlow = !authLoading && !user;

  // Steps definition changes based on auth state
  const steps = isGuestFlow
    ? ["Thiết lập tài khoản", "Thông tin cá nhân & CCCD", "Thông tin doanh nghiệp & Giấy phép", "Xác nhận & Gửi"]
    : ["Thông tin cá nhân & CCCD", "Thông tin doanh nghiệp & Giấy phép", "Xác nhận & Gửi"];

  // In guest flow, the form steps start at index 2 (step 2 = personal info)
  // so we offset: guestStep 1 = signup, guestStep 2 = personal, 3 = company, 4 = review
  // In logged-in flow: step 1 = personal, 2 = company, 3 = review
  const formStep = isGuestFlow ? currentStep - 1 : currentStep;

  const handleSignUpSuccess = (data: RegisterPayload) => {
    // Store signup data — actual API call happens at final submit
    setSignupPayload(data);
    // Pre-populate formData fields from signup payload so StepPersonal displays them
    setFormData((prev) => ({
      ...prev,
      email: data.email,
      fullName: prev.fullName || data.fullName,
      phoneNumber: prev.phoneNumber || data.phoneNumber,
    }));
    // Advance to personal info step
    setCurrentStep(2);
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  // Step Validations
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Họ và tên không được để trống";
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    if (!formData.identityId.trim()) {
      newErrors.identityId = "Số CCCD/CMND không được để trống";
    } else if (!/^[0-9]{9}$|^[0-9]{12}$/.test(formData.identityId.trim())) {
      newErrors.identityId = "Số CCCD/CMND phải gồm 9 hoặc 12 chữ số";
    }

    if (!formData.issueDate) newErrors.issueDate = "Vui lòng chọn ngày cấp";
    if (!formData.issuePlace.trim()) newErrors.issuePlace = "Vui lòng nhập nơi cấp";

    if (!formData.frontFile && !formData.frontUrl) {
      newErrors.frontFile = "Vui lòng upload mặt trước CCCD";
    }
    if (!formData.backFile && !formData.backUrl) {
      newErrors.backFile = "Vui lòng upload mặt sau CCCD";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) newErrors.companyName = "Tên công ty không được để trống";
    if (!formData.businessLicenseNo.trim()) {
      newErrors.businessLicenseNo = "Mã số doanh nghiệp không được để trống";
    }

    if (formData.cityId === "") newErrors.cityId = "Vui lòng chọn Tỉnh/Thành phố";
    if (formData.wardId === "") newErrors.wardId = "Vui lòng chọn Phường/Xã";
    if (!formData.street.trim()) newErrors.street = "Vui lòng nhập địa chỉ chi tiết";

    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = "Email liên hệ không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = "Email liên hệ không hợp lệ";
    }

    if (!formData.companyPhone.trim()) {
      newErrors.companyPhone = "SĐT doanh nghiệp không được để trống";
    }

    if (!formData.logoFile && !formData.logoUrl) {
      newErrors.logoFile = "Vui lòng upload logo doanh nghiệp";
    }
    if (!formData.licenseFile && !formData.licenseUrl) {
      newErrors.licenseFile = "Vui lòng upload giấy phép kinh doanh";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!consentChecked) {
      newErrors.consent = "Bạn cần đồng ý với các điều khoản cam đoan trên";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (formStep === 1) {
      if (validateStep1()) setCurrentStep((prev) => prev + 1);
    } else if (formStep === 2) {
      if (validateStep2()) setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Storage Uploader Helper
  const uploadToStorage = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw new Error(`Upload storage error: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  };

  // Final submit handler
  const handleSubmit = async () => {
    if (!validateStep3()) return;

    // In logged-in flow: must have user
    if (!isGuestFlow && !user) {
      setErrors({ general: "Phiên đăng nhập chưa được xác nhận. Vui lòng tải lại trang." });
      return;
    }

    // In guest flow: must have signup payload
    if (isGuestFlow && !signupPayload) {
      setErrors({ general: "Thông tin tài khoản bị thiếu. Vui lòng quay lại bước đầu tiên." });
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      // In guest flow: call requestRegisterAccount first to create account & send verification email
      let guestUid: string | null = null;
      if (isGuestFlow && signupPayload) {
        const registerResult = await requestRegisterAccount({
          ...signupPayload,
          registrationType: "company",
          companyName: formData.companyName,
          businessLicenseNo: formData.businessLicenseNo,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
        });
        if (!registerResult.success) {
          const msg = registerResult.message || "Đăng ký tài khoản thất bại. Vui lòng thử lại.";
          setErrors({ general: msg });
          return;
        }
        // Extract the newly created userId from Supabase signUp response
        guestUid = registerResult.account?.user?.id ?? null;
        if (!guestUid) {
          setErrors({ general: "Không thể xác định ID tài khoản. Vui lòng thử lại." });
          return;
        }
      }

      const uid = user?.id ?? guestUid!;

      // Client-side generate UUID for company ID
      const companyId = generateUUID();

      // 1. Upload Step 1 files to 'profiles' bucket if they are raw files
      let finalAvatarUrl = formData.avatarUrl;
      if (formData.avatarFile) {
        const ext = formData.avatarFile.name.split(".").pop()?.toLowerCase() || "";
        finalAvatarUrl = await uploadToStorage(formData.avatarFile, "profiles", `${uid}/avatar.${ext}`);
      }

      let finalFrontUrl = formData.frontUrl;
      if (formData.frontFile) {
        const ext = formData.frontFile.name.split(".").pop()?.toLowerCase() || "";
        finalFrontUrl = await uploadToStorage(formData.frontFile, "profiles", `${uid}/identity/front.${ext}`);
      }

      let finalBackUrl = formData.backUrl;
      if (formData.backFile) {
        const ext = formData.backFile.name.split(".").pop()?.toLowerCase() || "";
        finalBackUrl = await uploadToStorage(formData.backFile, "profiles", `${uid}/identity/back.${ext}`);
      }

      // 2. Upload Step 2 files to 'companies' bucket
      let finalLogoUrl = formData.logoUrl;
      if (formData.logoFile) {
        const ext = formData.logoFile.name.split(".").pop()?.toLowerCase() || "";
        finalLogoUrl = await uploadToStorage(formData.logoFile, "companies", `${companyId}/images/logo.${ext}`);
      }

      let finalLicenseUrl = formData.licenseUrl;
      if (formData.licenseFile) {
        const ext = formData.licenseFile.name.split(".").pop()?.toLowerCase() || "";
        finalLicenseUrl = await uploadToStorage(formData.licenseFile, "companies", `${companyId}/lisence.${ext}`);
      }

      // 3. Upload gallery images to 'companies' bucket in parallel
      const galleryUrls = await Promise.all(
        formData.galleryFiles.map((file, idx) => {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          return uploadToStorage(file, "companies", `${companyId}/images/gallery-${idx}.${ext}`);
        })
      );

      // 4. Construct API payload
      const payload = {
        userId: uid,
        profile: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          avatarUrl: finalAvatarUrl || null,
        },
        identity: {
          identityId: formData.identityId,
          issueDate: formData.issueDate,
          issuePlace: formData.issuePlace,
          frontUrl: finalFrontUrl,
          backUrl: finalBackUrl,
        },
        company: {
          companyId: companyId,
          companyName: formData.companyName,
          businessLicenseNo: formData.businessLicenseNo,
          licenseFileUrl: finalLicenseUrl || null,
          address: {
            city_id: Number(formData.cityId),
            ward_id: Number(formData.wardId),
            street: formData.street,
          },
          email: formData.companyEmail,
          phone: formData.companyPhone,
          description: formData.description || null,
        },
        images: [] as { imageUrl: string; imageType: "logo" | "banner" | "other" }[],
      };

      // Push logo URL into images table if created
      if (finalLogoUrl) {
        payload.images.push({
          imageUrl: finalLogoUrl,
          imageType: "logo" as const,
        });
      }

      // First gallery photo is banner, others are other images
      galleryUrls.forEach((url, index) => {
        payload.images.push({
          imageUrl: url,
          imageType: index === 0 ? ("banner" as const) : ("other" as const),
        });
      });

      // 5. Submit to backend
      const res = await requestSubmitRegistration(payload);

      if (res?.success && res.registrationCode) {
        setSuccessCode(res.registrationCode);
      } else {
        setErrors({ general: res?.message || "Đăng ký thất bại. Vui lòng thử lại." });
      }
    } catch (err: any) {
      console.error("Submit registration error:", err);
      setErrors({ general: err?.message || "Lỗi hệ thống khi gửi thông tin đăng ký." });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (hasRegistered) {
    return (
      <div className="max-w-md mx-auto p-6 bg-surface-container-lowest border border-outline-variant rounded-xl text-center shadow-sm space-y-4 animate-scale-in">
        <AlertCircle className="w-12 h-12 text-warning mx-auto" />
        <h3 className="text-lg font-bold text-on-surface">Đơn đăng ký đã tồn tại</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Tài khoản của bạn đã gửi hồ sơ đăng ký doanh nghiệp hoặc đã liên kết với một doanh nghiệp trên hệ thống. Không thể gửi thêm hồ sơ mới.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-primary hover:bg-primary-container text-white py-2 px-6 rounded-lg text-sm font-semibold transition-all"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Render Success Screen
  if (successCode) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-surface-container-lowest border border-outline-variant rounded-xl text-center shadow-lg space-y-6 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">Hồ sơ đã được gửi thành công!</h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Hồ sơ đăng ký doanh nghiệp bảo vệ của bạn đã được tiếp nhận và đưa vào danh sách chờ duyệt.
          </p>
        </div>

        <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl max-w-sm mx-auto">
          <span className="text-xs text-on-surface-variant block uppercase tracking-wider font-semibold mb-1">
            Mã hồ sơ đăng ký
          </span>
          <span className="font-mono text-lg font-bold text-primary tracking-wider">
            {successCode}
          </span>
        </div>

        <p className="text-xs text-on-surface-variant/80 max-w-md mx-auto leading-relaxed">
          * Thông thường quá trình xét duyệt hồ sơ pháp lý sẽ mất từ 1 - 2 ngày làm việc. Chúng tôi sẽ gửi thông báo email cho người đại diện khi có kết quả.
        </p>

        <div className="pt-2 flex justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="border border-outline-variant hover:bg-surface-container-low text-on-surface py-2.5 px-6 rounded-xl text-sm font-semibold transition-all"
          >
            Về Trang Chủ
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="bg-primary hover:bg-primary-container text-white py-2.5 px-6 rounded-xl text-sm font-semibold transition-all"
          >
            Kiểm Tra Hồ Sơ
          </button>
        </div>
      </div>
    );
  }

  // steps and formStep are computed above based on isGuestFlow

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ProgressBar Stepper */}
      <StepperHeader currentStep={currentStep} steps={steps} />

      {/* Main Form Glass Card */}
      <div className="glass-card rounded-2xl border border-outline-variant/30 px-6 py-8 md:px-10 md:py-10 shadow-lg relative overflow-hidden">
        {errors.general && (
          <div className="mb-6 rounded-lg border border-error bg-error/5 p-4 text-sm font-semibold text-error flex items-start gap-2 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Render Step View */}
        {isGuestFlow && currentStep === 1 && (
          <StepSignUp onSuccess={handleSignUpSuccess} />
        )}
        {formStep === 1 && (
          <StepPersonal
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            clearError={clearError}
          />
        )}
        {formStep === 2 && (
          <StepCompany
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            clearError={clearError}
          />
        )}
        {formStep === 3 && (
          <StepReview
            formData={formData}
            consentChecked={consentChecked}
            setConsentChecked={setConsentChecked}
            errors={errors}
          />
        )}

        {/* Footer Actions Button — hidden on signup step (step handles its own submit) */}
        {!(isGuestFlow && currentStep === 1) && (
          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-between items-center">
            <button
              type="button"
              onClick={handlePrev}
              disabled={submitting}
              className={`flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg border border-outline-variant transition-all
                ${
                  currentStep === 1
                    ? "opacity-0 pointer-events-none"
                    : "text-on-surface hover:bg-surface-container-low disabled:opacity-50"
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            {formStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary hover:bg-primary-container text-white py-2 px-6 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 active:scale-[0.98]"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-primary hover:bg-primary-container text-white py-2.5 px-8 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi hồ sơ đăng ký</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
