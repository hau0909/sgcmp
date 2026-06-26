"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  requestGetCompanyById,
  requestGetAvailableServices,
  requestAddCompanyService,
  requestDeleteCompanyService,
  requestUpdateCompanyProfile,
  requestUploadCompanyImage,
  requestGetCompanyActivityImages,
} from "@/features/company/api/company.api";
import { Service, CompanyServiceData } from "@/features/company/types";
import { useAuthStore } from "@/store/auth.store";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Edit,
  Save,
  X,
  FileText,
  Briefcase,
  Eye,
  Camera,
  Upload,
  ChevronRight,
  Plus,
  Trash,
  ChevronDown,
} from "lucide-react";

type EditSnapshot = {
  companyName: string;
  description: string;
  fullName: string;
  companyLicense: string;
  businessLicense: string;
  address: string;
  email: string;
  phone: string;
};

type EditField =
  | "company_name"
  | "description"
  | "business_license_no"
  | "registration_code"
  | "email"
  | "phone"
  | "address";

type FieldErrors = Partial<Record<EditField, string>>;

type ToastData = {
  type: "success" | "error";
  message: string;
};

type UploadedCompanyImage = {
  image_id?: string;
  company_id?: string;
  image_url?: string;
  image_type?: string;
  created_at?: string;
  file_path?: string;
};

export default function MyCompanyDetail() {
  const { company_id } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [isActivityGalleryOpen, setIsActivityGalleryOpen] = useState(false);
  const [loadingActivityGallery, setLoadingActivityGallery] = useState(false);
  const [allActivityImgs, setAllActivityImgs] = useState<string[]>([]);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingActivity, setUploadingActivity] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const activityInputRef = useRef<HTMLInputElement>(null);

  const toastShowTimerRef = useRef<number | null>(null);
  const toastHideTimerRef = useRef<number | null>(null);
  const toastClearTimerRef = useRef<number | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");

  const [fullName, setFullName] = useState("");
  const [companyLicense, setCompanyLicense] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [logoUrl, setLogoUrl] = useState(
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300",
  );
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
  );
  const [licenseImg, setLicenseImg] = useState(
    "https://images.unsplash.com/photo-1589330694653-ded6dfc7f6bb?q=80&w=600",
  );
  const [companyImgs, setCompanyImgs] = useState<string[]>([]);

  const [editSnapshot, setEditSnapshot] = useState<EditSnapshot | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [toast, setToast] = useState<ToastData | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const [activeViewerImg, setActiveViewerImg] = useState<string | null>(null);

  const [companyServices, setCompanyServices] = useState<CompanyServiceData[]>(
    [],
  );
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceId, setNewServiceId] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const baseEditControlClassName =
    "w-full text-sm border rounded-lg px-3 py-2 font-semibold text-slate-800 outline-hidden";

  const validateImageFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Vui lòng chọn file ảnh định dạng JPG, PNG hoặc WEBP.");
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error("Ảnh không được vượt quá 5MB.");
    }
  };

  const clearToastTimers = () => {
    if (toastShowTimerRef.current) {
      window.clearTimeout(toastShowTimerRef.current);
    }

    if (toastHideTimerRef.current) {
      window.clearTimeout(toastHideTimerRef.current);
    }

    if (toastClearTimerRef.current) {
      window.clearTimeout(toastClearTimerRef.current);
    }

    toastShowTimerRef.current = null;
    toastHideTimerRef.current = null;
    toastClearTimerRef.current = null;
  };

  const showToast = (type: ToastData["type"], message: string) => {
    clearToastTimers();

    setToastVisible(false);
    setToast({ type, message });

    toastShowTimerRef.current = window.setTimeout(() => {
      setToastVisible(true);
    }, 20);

    toastHideTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 2700);

    toastClearTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const closeToast = () => {
    clearToastTimers();

    setToastVisible(false);

    toastClearTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 250);
  };

  const hideToastImmediately = () => {
    clearToastTimers();
    setToastVisible(false);
    setToast(null);
  };

  const getUploadedImageUrl = (image: UploadedCompanyImage) => {
    return image?.image_url || "";
  };

  const getEditControlClassName = (field: EditField, extraClassName = "") => {
    const hasError = Boolean(fieldErrors[field]);

    return [
      baseEditControlClassName,
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
        : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20",
      extraClassName,
    ].join(" ");
  };

  const renderFieldError = (field: EditField) => {
    if (!fieldErrors[field]) return null;

    return (
      <p className="text-[11px] font-semibold text-red-500 leading-normal">
        {fieldErrors[field]}
      </p>
    );
  };

  const clearFieldError = (field: EditField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };
      delete next[field];

      return next;
    });
  };

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const isValidPhone = (value: string) => {
    return /^(0|\+84)[0-9]{9,10}$/.test(value);
  };

  const validateEditForm = () => {
    const nextErrors: FieldErrors = {};

    const trimmedFullName = fullName.trim();
    const trimmedDescription = description.trim();
    const trimmedBusinessLicense = businessLicense.trim();
    const trimmedCompanyLicense = companyLicense.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedFullName) {
      nextErrors.company_name = "Vui lòng nhập tên công ty.";
    }

    if (!trimmedDescription) {
      nextErrors.description = "Vui lòng nhập giới thiệu doanh nghiệp.";
    }

    if (!trimmedBusinessLicense) {
      nextErrors.business_license_no = "Vui lòng nhập mã số đăng ký.";
    }

    if (!trimmedCompanyLicense) {
      nextErrors.registration_code = "Vui lòng nhập mã số giấy phép.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Email không đúng định dạng.";
    }

    if (!trimmedPhone) {
      nextErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!isValidPhone(trimmedPhone)) {
      nextErrors.phone = "Số điện thoại phải bắt đầu bằng 0 hoặc +84.";
    }

    if (!trimmedAddress) {
      nextErrors.address = "Vui lòng nhập địa chỉ.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleServiceSelect = (serviceId: string) => {
    setNewServiceId(serviceId);
  };

  const handleStartEdit = () => {
    setEditSnapshot({
      companyName,
      description,
      fullName,
      companyLicense,
      businessLicense,
      address,
      email,
      phone,
    });

    setFieldErrors({});
    hideToastImmediately();
    setIsEditing(true);
  };

  const handleOpenActivityGallery = async () => {
    try {
      setIsActivityGalleryOpen(true);
      setLoadingActivityGallery(true);
      hideToastImmediately();

      const images = await requestGetCompanyActivityImages();

      const imageUrls = images
        .map((image: { image_url?: string }) => image.image_url)
        .filter(Boolean);

      setAllActivityImgs(imageUrls);
    } catch (err: any) {
      console.error("Lỗi khi lấy hình ảnh hoạt động:", err);
      showToast(
        "error",
        err.message || "Không thể lấy danh sách hình ảnh hoạt động.",
      );
    } finally {
      setLoadingActivityGallery(false);
    }
  };

  const handleCancelEdit = () => {
    if (editSnapshot) {
      setCompanyName(editSnapshot.companyName);
      setDescription(editSnapshot.description);
      setFullName(editSnapshot.fullName);
      setCompanyLicense(editSnapshot.companyLicense);
      setBusinessLicense(editSnapshot.businessLicense);
      setAddress(editSnapshot.address);
      setEmail(editSnapshot.email);
      setPhone(editSnapshot.phone);
    }

    setFieldErrors({});
    hideToastImmediately();
    setIsEditing(false);
  };

  const handleSelectLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const file = target.files?.[0];

    if (!file) return;

    try {
      validateImageFile(file);

      setUploadingLogo(true);
      hideToastImmediately();

      const uploadedImage = await requestUploadCompanyImage({
        file,
        image_type: "logo",
      });

      const imageUrl = getUploadedImageUrl(uploadedImage);

      if (!imageUrl) {
        throw new Error("Không nhận được đường dẫn logo sau khi tải lên.");
      }

      setLogoUrl(imageUrl);
      showToast("success", "Cập nhật logo công ty thành công.");
    } catch (err: any) {
      console.error("Lỗi khi upload logo:", err);
      showToast("error", err.message || "Không thể cập nhật logo công ty.");
    } finally {
      setUploadingLogo(false);
      target.value = "";
    }
  };

  const handleSelectBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const file = target.files?.[0];

    if (!file) return;

    try {
      validateImageFile(file);

      setUploadingBanner(true);
      hideToastImmediately();

      const uploadedImage = await requestUploadCompanyImage({
        file,
        image_type: "banner",
      });

      const imageUrl = getUploadedImageUrl(uploadedImage);

      if (!imageUrl) {
        throw new Error("Không nhận được đường dẫn ảnh bìa sau khi tải lên.");
      }

      setBannerUrl(imageUrl);
      showToast("success", "Cập nhật ảnh bìa công ty thành công.");
    } catch (err: any) {
      console.error("Lỗi khi upload banner:", err);
      showToast("error", err.message || "Không thể cập nhật ảnh bìa công ty.");
    } finally {
      setUploadingBanner(false);
      target.value = "";
    }
  };

  const handleSelectActivityImages = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const target = e.currentTarget;
    const files = Array.from(target.files ?? []);

    if (files.length === 0) return;

    try {
      files.forEach(validateImageFile);

      setUploadingActivity(true);
      hideToastImmediately();

      const uploadedImages = await Promise.all(
        files.map((file) =>
          requestUploadCompanyImage({
            file,
            image_type: "other",
          }),
        ),
      );

      const imageUrls = uploadedImages
        .map((image) => getUploadedImageUrl(image))
        .filter(Boolean);

      if (imageUrls.length === 0) {
        throw new Error("Không nhận được đường dẫn hình ảnh sau khi tải lên.");
      }

      setCompanyImgs((prev) => [...imageUrls, ...prev]);

      showToast(
        "success",
        `Tải lên ${imageUrls.length} hình ảnh hoạt động thành công.`,
      );
    } catch (err: any) {
      console.error("Lỗi khi upload hình ảnh hoạt động:", err);
      showToast("error", err.message || "Không thể tải hình ảnh hoạt động.");
    } finally {
      setUploadingActivity(false);
      target.value = "";
    }
  };

  const handleRemoveActivityImage = (index: number) => {
    setCompanyImgs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    hideToastImmediately();

    const isValid = validateEditForm();

    if (!isValid) {
      showToast("error", "Vui lòng kiểm tra lại các thông tin chưa hợp lệ.");
      return;
    }

    try {
      setSaving(true);

      await requestUpdateCompanyProfile({
        company_name: fullName.trim(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        business_license_no: businessLicense.trim(),
        registration_code: companyLicense.trim(),
      });

      setCompanyName(fullName.trim());
      setFullName(fullName.trim());
      setDescription(description.trim());
      setEmail(email.trim());
      setPhone(phone.trim());
      setAddress(address.trim());
      setBusinessLicense(businessLicense.trim());
      setCompanyLicense(companyLicense.trim());

      setIsEditing(false);
      setEditSnapshot(null);
      setFieldErrors({});

      showToast("success", "Cập nhật thông tin công ty thành công.");
    } catch (err: any) {
      console.error("Lỗi khi cập nhật công ty:", err);
      showToast(
        "error",
        err.message || "Không thể cập nhật thông tin công ty.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newServiceId || !newServicePrice || !company_id) return;

    const numericPrice = parseInt(newServicePrice.replace(/\D/g, ""), 10);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert("Vui lòng nhập giá dịch vụ hợp lệ.");
      return;
    }

    try {
      await requestAddCompanyService(company_id, {
        serviceId: newServiceId,
        description: newServiceDesc,
        price: numericPrice,
      });

      const updatedData = await requestGetCompanyById(company_id);

      if (updatedData && updatedData.services) {
        setCompanyServices(updatedData.services);
      }

      setNewServiceId("");
      setNewServiceDesc("");
      setNewServicePrice("");
      setIsAddServiceOpen(false);
    } catch (err: any) {
      console.error("Lỗi khi thêm dịch vụ:", err);
      alert(err.message || "Không thể thêm dịch vụ. Vui lòng thử lại.");
    }
  };

  const handleRemoveService = async (serviceId?: string) => {
    if (!company_id || !serviceId) return;

    try {
      await requestDeleteCompanyService(company_id, serviceId);

      const updatedData = await requestGetCompanyById(company_id);

      if (updatedData && updatedData.services) {
        setCompanyServices(updatedData.services);
      }
    } catch (err: any) {
      console.error("Lỗi khi xóa dịch vụ:", err);
      alert(err.message || "Không thể xóa dịch vụ.");
    }
  };

  useEffect(() => {
    return () => {
      clearToastTimers();
    };
  }, []);

  useEffect(() => {
    if (!company_id) {
      return;
    }

    const fetchCompanyData = async () => {
      try {
        setLoading(true);

        const [data, servs] = await Promise.all([
          requestGetCompanyById(company_id),
          requestGetAvailableServices(),
        ]);

        if (data) {
          setCompanyName(data.name || "");
          setFullName(data.name || "");
          setDescription(data.description || "");
          setCompanyLicense(data.companyLicenseNo || "");
          setBusinessLicense(data.businessLicenseNo || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");

          if (data.logoUrl) setLogoUrl(data.logoUrl);
          if (data.bannerUrl) setBannerUrl(data.bannerUrl);
          if (data.licenseFileUrl) setLicenseImg(data.licenseFileUrl);
          if (data.activityImgs) setCompanyImgs(data.activityImgs);
          if (data.services) setCompanyServices(data.services);
        }

        if (servs) {
          setAvailableServices(servs);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin công ty:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [company_id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-16 font-sans bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-xs text-slate-500 font-semibold mt-2">
          Đang tải thông tin công ty...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-16 font-sans bg-slate-50 min-h-screen text-slate-800">
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectLogo}
      />

      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectBanner}
      />

      <input
        ref={activityInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelectActivityImages}
      />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative">
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />

          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Camera className="w-3.5 h-3.5" />
            {uploadingBanner ? "Đang tải..." : "Thay đổi ảnh bìa"}
          </button>
        </div>

        <div className="px-6 pb-6 pt-4 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="flex shrink-0 flex-col items-center gap-2 self-center sm:self-start -mt-16 sm:-mt-20 z-20">
              <div className="relative group">
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
                />

                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingLogo ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Upload className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            <div className="pb-1 space-y-1">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
                  {isEditing ? fullName || "Tên công ty" : companyName}
                </h1>

                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> ĐÃ XÁC MINH
                </span>
              </div>

              <p className="text-sm text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" /> Nhà cung cấp
                dịch vụ an ninh doanh nghiệp
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" /> Hủy
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-slate-500" /> Chỉnh sửa thông
                tin
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-3 border-blue-600 pl-2.5">
              Giới thiệu doanh nghiệp
            </h2>

            {isEditing ? (
              <div className="space-y-1">
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearFieldError("description");
                  }}
                  placeholder="Nhập giới thiệu doanh nghiệp..."
                  className={getEditControlClassName(
                    "description",
                    "rounded-xl px-3.5 py-3 resize-none leading-relaxed",
                  )}
                />

                {renderFieldError("description")}
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed text-justify font-medium">
                {description || "Chưa có giới thiệu doanh nghiệp."}
              </p>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-3 border-blue-600 pl-2.5">
              Thông tin công ty
            </h2>

            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="flex-1 w-full space-y-3.5">
                <div className="grid grid-cols-12 gap-2 text-sm items-start">
                  <span className="col-span-4 font-bold text-slate-400 flex items-center gap-1.5 pt-2">
                    <Building2 className="w-4 h-4 text-slate-300" /> Tên công ty
                  </span>

                  {isEditing ? (
                    <div className="col-span-8 space-y-1">
                      <input
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          clearFieldError("company_name");
                        }}
                        placeholder="Nhập tên công ty"
                        className={getEditControlClassName("company_name")}
                      />

                      {renderFieldError("company_name")}
                    </div>
                  ) : (
                    <span className="col-span-8 text-slate-800 font-bold">
                      {fullName}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 text-sm items-start">
                  <span className="col-span-4 font-bold text-slate-400 flex items-center gap-1.5 pt-2">
                    <FileText className="w-4 h-4 text-slate-300" /> Mã số đăng
                    ký
                  </span>

                  {isEditing ? (
                    <div className="col-span-8 space-y-1">
                      <input
                        value={businessLicense}
                        onChange={(e) => {
                          setBusinessLicense(e.target.value);
                          clearFieldError("business_license_no");
                        }}
                        placeholder="Nhập mã số đăng ký"
                        className={getEditControlClassName(
                          "business_license_no",
                        )}
                      />

                      {renderFieldError("business_license_no")}
                    </div>
                  ) : (
                    <span className="col-span-8 text-slate-800 font-semibold">
                      {businessLicense}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 text-sm items-start">
                  <span className="col-span-4 font-bold text-slate-400 flex items-center gap-1.5 pt-2">
                    <Briefcase className="w-4 h-4 text-slate-300" /> Mã số giấy
                    phép
                  </span>

                  {isEditing ? (
                    <div className="col-span-8 space-y-1">
                      <input
                        value={companyLicense}
                        onChange={(e) => {
                          setCompanyLicense(e.target.value);
                          clearFieldError("registration_code");
                        }}
                        placeholder="Nhập mã số giấy phép"
                        className={getEditControlClassName("registration_code")}
                      />

                      {renderFieldError("registration_code")}
                    </div>
                  ) : (
                    <span className="col-span-8 text-slate-800 font-mono font-bold">
                      {companyLicense}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 text-sm items-start">
                  <span className="col-span-4 font-bold text-slate-400 flex items-center gap-1.5 pt-2">
                    <Mail className="w-4 h-4 text-slate-300" /> Email
                  </span>

                  {isEditing ? (
                    <div className="col-span-8 space-y-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearFieldError("email");
                        }}
                        placeholder="Nhập email"
                        className={getEditControlClassName("email")}
                      />

                      {renderFieldError("email")}
                    </div>
                  ) : (
                    <span className="col-span-8 text-blue-600 font-semibold hover:underline break-all">
                      {email}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 text-sm items-start">
                  <span className="col-span-4 font-bold text-slate-400 flex items-center gap-1.5 pt-2">
                    <Phone className="w-4 h-4 text-slate-300" /> Số điện thoại
                  </span>

                  {isEditing ? (
                    <div className="col-span-8 space-y-1">
                      <input
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          clearFieldError("phone");
                        }}
                        placeholder="Nhập số điện thoại"
                        className={getEditControlClassName("phone")}
                      />

                      {renderFieldError("phone")}
                    </div>
                  ) : (
                    <span className="col-span-8 text-slate-800 font-mono font-semibold">
                      {phone}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 text-sm items-start">
                  <span className="col-span-4 font-bold text-slate-400 flex items-center gap-1.5 pt-2">
                    <MapPin className="w-4 h-4 text-slate-300" /> Địa chỉ
                  </span>

                  {isEditing ? (
                    <div className="col-span-8 space-y-1">
                      <textarea
                        rows={3}
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          clearFieldError("address");
                        }}
                        placeholder="Nhập địa chỉ"
                        className={getEditControlClassName(
                          "address",
                          "resize-none",
                        )}
                      />

                      {renderFieldError("address")}
                    </div>
                  ) : (
                    <span className="col-span-8 text-slate-700 font-semibold leading-relaxed">
                      {address}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full md:w-36 flex flex-col items-center gap-2.5 self-center md:self-start bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-3xs">
                <div
                  onClick={() => setActiveViewerImg(licenseImg)}
                  className="w-24 h-32 border border-slate-200 bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 shadow-3xs group relative"
                >
                  <img
                    src={licenseImg}
                    alt="License Thumbnail"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveViewerImg(licenseImg)}
                  className="w-full py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-3xs"
                >
                  Xem giấy phép
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-3 border-blue-600 pl-2.5">
                Dịch vụ cung cấp
              </h2>

              <button
                type="button"
                onClick={() => setIsAddServiceOpen(true)}
                className="px-3.5 py-1.5 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 active:bg-blue-100 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-3xs cursor-pointer font-sans"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm dịch vụ
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2 w-1/3">Tên dịch vụ</th>
                    <th className="pb-3 w-5/12">Mô tả</th>
                    <th className="pb-3 pr-2 w-1/4 text-right">Giá dịch vụ</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {companyServices.map((service) => (
                    <tr
                      key={service.serviceId}
                      className="group hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-4 pl-2">
                        <div className="font-bold text-slate-800 text-sm">
                          {service.name}
                        </div>

                        {service.baseDescription && (
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5 leading-normal max-w-[280px]">
                            {service.baseDescription}
                          </div>
                        )}
                      </td>

                      <td className="py-4 pr-4">
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {service.description}
                        </p>
                      </td>

                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-sm font-extrabold text-blue-600">
                            {typeof service.price === "number"
                              ? service.price.toLocaleString("vi-VN") + "đ"
                              : service.price}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveService(service.serviceId)
                            }
                            className="p-1 text-slate-300 hover:text-red-500 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Xóa dịch vụ"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {companyServices.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-8 text-center text-sm text-slate-400 font-medium"
                      >
                        Chưa có dịch vụ nào được đăng ký
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-3 border-blue-600 pl-2.5">
                Hình ảnh hoạt động
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenActivityGallery}
                  className="text-[11px] font-bold text-slate-500 hover:text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  Xem thêm <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {companyImgs.slice(0, 6).map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  onClick={() => setActiveViewerImg(img)}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all border border-slate-200 bg-slate-50 group relative"
                >
                  <img
                    src={img}
                    alt={`Activity ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Eye className="w-4 h-4 text-white" />
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveActivityImage(index);
                    }}
                    className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-1 text-slate-500 opacity-0 shadow-sm transition-all hover:text-red-500 group-hover:opacity-100"
                    title="Xóa ảnh khỏi giao diện"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => activityInputRef.current?.click()}
                disabled={uploadingActivity}
                className="aspect-square rounded-xl border border-dashed border-blue-300 bg-blue-50/50 text-blue-600 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploadingActivity ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}

                <span className="text-[10px] font-bold">
                  {uploadingActivity ? "Đang tải" : "Thêm ảnh"}
                </span>
              </button>
            </div>

            {companyImgs.length === 0 && (
              <p className="text-xs text-slate-400 font-medium text-center py-4">
                Chưa có hình ảnh hoạt động.
              </p>
            )}
          </section>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[80] w-[320px] rounded-2xl border bg-white px-4 py-3 shadow-2xl transition-all duration-300 ease-out ${
            toastVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-[120%] opacity-0"
          } ${toast.type === "success" ? "border-green-200" : "border-red-200"}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                toast.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <div className="flex-1">
              <p
                className={`text-xs font-extrabold uppercase tracking-wide ${
                  toast.type === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {toast.type === "success" ? "Thành công" : "Thất bại"}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={closeToast}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isActivityGalleryOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6">
          <div className="mx-auto flex h-full max-w-6xl flex-col rounded-2xl border border-white/10 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                  Tất cả hình ảnh hoạt động
                </h3>

                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  {allActivityImgs.length} hình ảnh
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsActivityGalleryOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loadingActivityGallery ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                    >
                      <div className="h-full w-full bg-linear-to-r from-slate-100 via-slate-200 to-slate-100" />
                    </div>
                  ))}
                </div>
              ) : allActivityImgs.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {allActivityImgs.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setActiveViewerImg(img)}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={img}
                        alt={`Activity ${index + 1}`}
                        className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition-all group-hover:opacity-100">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm font-semibold text-slate-400">
                    Chưa có hình ảnh hoạt động.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddServiceOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Thêm dịch vụ cung cấp
              </h3>

              <button
                type="button"
                onClick={() => setIsAddServiceOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Tên dịch vụ *
                </label>

                <div className="relative">
                  <select
                    required
                    value={newServiceId}
                    onChange={(e) => handleServiceSelect(e.target.value)}
                    className="w-full text-sm border border-slate-200 bg-white rounded-xl pl-3.5 pr-10 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden font-semibold text-slate-800 appearance-none cursor-pointer"
                  >
                    <option
                      value=""
                      disabled
                      className="text-slate-400 font-medium"
                    >
                      --- Chọn dịch vụ ---
                    </option>

                    {availableServices.map((s) => (
                      <option
                        key={s.service_id}
                        value={s.service_id}
                        className="text-slate-700 font-medium"
                      >
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {newServiceId && (
                  <p className="text-[11px] text-slate-500 italic mt-1 font-medium bg-slate-50 border border-slate-100 rounded-lg p-2.5 leading-normal">
                    <span className="font-bold not-italic text-slate-600">
                      Ý nghĩa:{" "}
                    </span>
                    {
                      availableServices.find(
                        (s) => s.service_id === newServiceId,
                      )?.description
                    }
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Mô tả dịch vụ
                </label>

                <textarea
                  rows={3}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Nhập mô tả chi tiết dịch vụ..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Giá dịch vụ *
                </label>

                <input
                  type="text"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="Ví dụ: 5.000.000đ"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Thêm dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeViewerImg && (
        <div
          onClick={() => setActiveViewerImg(null)}
          className="fixed inset-0 z-[90] bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={activeViewerImg}
              alt="High res preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/10 shadow-2xl"
            />

            <button
              type="button"
              onClick={() => setActiveViewerImg(null)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 font-bold text-sm bg-black/40 hover:bg-black/60 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
