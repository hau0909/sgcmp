"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  requestGetCompanyById,
  requestGetAvailableServices,
  requestAddCompanyService,
  requestDeleteCompanyService,
  requestUpdateCompanyProfile,
  requestUploadCompanyImage,
  requestGetCompanyActivityImages,
  requestCreateCompanyPublishRequest,
} from "@/features/company/api/company.api";
import { requestCheckSubscription } from "@/features/subscription/api/subscription.api";
import { CompanyStatus } from "@/types/Enum";
import { Service, CompanyServiceData } from "@/features/company/types";
import { useAuthStore } from "@/store/auth.store";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { requestGetCities, requestGetWards } from "@/features/address";
import { City, Ward } from "@/features/address/types";
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
  Plus,
  Trash,
  ChevronDown,
  Download,
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
  const { dict } = useTranslation();
  const { company_id } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [status, setStatus] = useState<CompanyStatus | "">("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [publishNote, setPublishNote] = useState("");
  const [submittingPublish, setSubmittingPublish] = useState(false);

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

  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [editCityId, setEditCityId] = useState<number | "">("");
  const [editWardId, setEditWardId] = useState<number | "">("");
  const [editStreet, setEditStreet] = useState("");

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
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);

  const [companyServices, setCompanyServices] = useState<CompanyServiceData[]>(
    [],
  );
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceId, setNewServiceId] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  useEffect(() => {
    let active = true;
    const fetchCities = async () => {
      try {
        const res = await requestGetCities();
        if (active && res?.success && res.cities) {
          setCities(res.cities);
        }
      } catch (err) {
        console.error("Failed to load cities", err);
      }
    };
    fetchCities();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (editCityId === "") {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await requestGetWards(Number(editCityId));
        if (active && res?.success && res.wards) {
          setWards(res.wards);
        }
      } catch (err) {
        console.error("Failed to load wards", err);
      }
    };
    fetchWards();
    return () => {
      active = false;
    };
  }, [editCityId]);

  const baseEditControlClassName =
    "w-full text-sm border rounded-lg px-3 py-2 font-semibold text-on-surface bg-surface-container-lowest outline-hidden";

  const validateImageFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(dict.company_detail.validation.image_type);
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error(dict.company_detail.validation.image_size);
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
        ? "border-error focus:border-error focus:ring-1 focus:ring-error/20"
        : "border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary/20",
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
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (!trimmedFullName) {
      nextErrors.company_name = dict.company_detail.validation.name_required;
    }

    if (!trimmedDescription) {
      nextErrors.description = dict.company_detail.validation.desc_required;
    }

    if (!trimmedEmail) {
      nextErrors.email = dict.company_detail.validation.email_required;
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = dict.company_detail.validation.email_invalid;
    }

    if (!trimmedPhone) {
      nextErrors.phone = dict.company_detail.validation.phone_required;
    } else if (!isValidPhone(trimmedPhone)) {
      nextErrors.phone = dict.company_detail.validation.phone_invalid;
    }

    if (!editStreet.trim() || editCityId === "" || editWardId === "") {
      nextErrors.address = dict.company_detail.validation.address_required;
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

    const parts = address.split(",").map(p => p.trim());
    if (parts.length >= 3) {
      const parsedCity = parts[parts.length - 1];
      const parsedWard = parts[parts.length - 2];
      const parsedStreet = parts.slice(0, parts.length - 2).join(", ");

      const foundCity = cities.find(c => c.city_name === parsedCity);
      if (foundCity) {
        setEditCityId(foundCity.city_id);
        requestGetWards(foundCity.city_id).then(res => {
          if (res?.success && res.wards) {
            setWards(res.wards);
            const foundWard = res.wards.find((w: Ward) => w.ward_name === parsedWard);
            if (foundWard) setEditWardId(foundWard.ward_id);
          }
        });
      } else {
        setEditCityId("");
        setEditWardId("");
      }
      setEditStreet(parsedStreet);
    } else {
      setEditStreet(address);
      setEditCityId("");
      setEditWardId("");
    }

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
    } catch (err) {
      console.error("Lỗi khi lấy hình ảnh hoạt động:", err);
      const errMsg = err instanceof Error ? err.message : dict.company_detail.messages.activity_error;
      showToast(
        "error",
        errMsg,
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
        throw new Error(dict.company_detail.messages.logo_error);
      }

      setLogoUrl(imageUrl);
      showToast("success", dict.company_detail.messages.logo_success);
    } catch (err) {
      console.error("Lỗi khi upload logo:", err);
      const errMsg = err instanceof Error ? err.message : dict.company_detail.messages.logo_error;
      showToast("error", errMsg);
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
        throw new Error(dict.company_detail.messages.banner_error);
      }

      setBannerUrl(imageUrl);
      showToast("success", dict.company_detail.messages.banner_success);
    } catch (err) {
      console.error("Lỗi khi upload banner:", err);
      const errMsg = err instanceof Error ? err.message : dict.company_detail.messages.banner_error;
      showToast("error", errMsg);
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
        throw new Error(dict.company_detail.messages.activity_error);
      }

      setCompanyImgs((prev) => [...imageUrls, ...prev]);

      showToast(
        "success",
        dict.company_detail.messages.activity_success.replace("{0}", imageUrls.length.toString()),
      );
    } catch (err) {
      console.error("Lỗi khi upload hình ảnh hoạt động:", err);
      const errMsg = err instanceof Error ? err.message : dict.company_detail.messages.activity_error;
      showToast("error", errMsg);
    } finally {
      setUploadingActivity(false);
      target.value = "";
    }
  };

  const handleRemoveActivityImage = (index: number) => {
    setCompanyImgs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadLicenseFile = async (url: string) => {
    if (!url) return;
    try {
      let extension = "pdf";
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const lastPart = pathname.substring(pathname.lastIndexOf('/') + 1);
        if (lastPart.includes('.')) {
          extension = lastPart.split('.').pop() || "pdf";
        }
      } catch (err) {
        console.error("Lỗi khi phân tích định dạng file:", err);
      }
      
      const filename = `giay-phep-kinh-doanh.${extension}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải file");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("CORS/network block, fallback sang mở tab mới:", err);
      window.open(url, "_blank");
    }
  };

  const handleSaveEdit = async () => {
    hideToastImmediately();

    const isValid = validateEditForm();

    if (!isValid) {
      showToast("error", dict.company_detail.messages.invalid_info);
      return;
    }

    const selectedCity = cities.find(c => c.city_id === Number(editCityId))?.city_name || "";
    const selectedWard = wards.find(w => w.ward_id === Number(editWardId))?.ward_name || "";
    const newAddressStr = [editStreet.trim(), selectedWard, selectedCity].filter(Boolean).join(", ");

    try {
      setSaving(true);

      await requestUpdateCompanyProfile({
        company_name: fullName.trim(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: newAddressStr,
      });

      setCompanyName(fullName.trim());
      setFullName(fullName.trim());
      setDescription(description.trim());
      setEmail(email.trim());
      setPhone(phone.trim());
      setAddress(newAddressStr);
      setBusinessLicense(businessLicense.trim());
      setCompanyLicense(companyLicense.trim());

      setIsEditing(false);
      setEditSnapshot(null);
      setFieldErrors({});

      showToast("success", dict.company_detail.messages.update_success);
    } catch (err) {
      console.error("Lỗi khi cập nhật công ty:", err);
      const errMsg = err instanceof Error ? err.message : dict.company_detail.messages.update_error;
      showToast(
        "error",
        errMsg,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPublishRequest = async () => {
    if (!company_id) return;

    try {
      setSubmittingPublish(true);
      hideToastImmediately();

      await requestCreateCompanyPublishRequest(company_id, {
        note: publishNote.trim() || undefined,
      });

      setStatus("pending_publish");
      setIsConfirmModalOpen(false);
      setPublishNote("");
      showToast("success", dict.company_detail.messages.publish_success);
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu công khai:", err);
      showToast("error", dict.company_detail.messages.publish_error);
    } finally {
      setSubmittingPublish(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newServiceId || !newServicePrice || !company_id) return;

    const numericPrice = parseInt(newServicePrice.replace(/\D/g, ""), 10);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert(dict.company_detail.messages.service_price_invalid);
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
    } catch (err) {
      console.error("Lỗi khi thêm dịch vụ:", err);
      const errMsg = err instanceof Error ? err.message : dict.company_detail.messages.service_add_error;
      alert(errMsg);
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
    } catch (err) {
      console.error("Lỗi khi xóa dịch vụ:", err);
      const errMsg = err instanceof Error ? err.message : dict.company_detail.messages.service_delete_error;
      alert(errMsg);
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

        const [data, servs, subCheck] = await Promise.all([
          requestGetCompanyById(company_id),
          requestGetAvailableServices(),
          requestCheckSubscription(company_id).catch((err) => {
            console.error("Lỗi khi kiểm tra gói dịch vụ:", err);
            return { isActive: false, subscription: null, hasSubscription: false };
          }),
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
          if (data.status) setStatus(data.status);
        }

        if (servs) {
          setAvailableServices(servs);
        }

        if (subCheck) {
          setHasActiveSubscription(!!subCheck.isActive);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin công ty:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [company_id]);

  const DEFAULT_LOGO =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300";
  const DEFAULT_BANNER =
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200";

  const hasLogo = logoUrl && logoUrl !== DEFAULT_LOGO;
  const hasBanner = bannerUrl && bannerUrl !== DEFAULT_BANNER;
  const hasOtherImages = companyImgs && companyImgs.length >= 2;
  const hasServices = companyServices && companyServices.length >= 1;

  const isProfileComplete =
    hasLogo && hasBanner && hasOtherImages && hasServices && hasActiveSubscription;

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-16 font-sans bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-xs text-slate-500 font-semibold mt-2">
          {dict.company_detail.loading}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 font-body text-on-surface relative">
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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            {dict.company_detail.header.title}
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant font-medium mt-1">
            {dict.company_detail.header.desc}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low active:bg-surface-container-high transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <X className="w-3.5 h-3.5 text-on-surface-variant" /> {dict.company_detail.buttons.cancel}
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-on-primary transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? dict.company_detail.buttons.saving : dict.company_detail.buttons.save}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low active:bg-surface-container-high transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-on-surface-variant" /> {dict.company_detail.buttons.edit}
            </button>
          )}
        </div>
      </div>

      {status && (
        <div
          className={`p-4 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs ${status === "published"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : status === "pending_publish"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : status === "active"
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : status === "pending_register"
                  ? "bg-purple-50 border-purple-200 text-purple-800"
                  : status === "rejected"
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl mt-0.5 ${status === "published"
                ? "bg-emerald-100 text-emerald-600"
                : status === "pending_publish"
                  ? "bg-amber-100 text-amber-600"
                  : status === "active"
                    ? "bg-blue-100 text-blue-600"
                    : status === "pending_register"
                      ? "bg-purple-100 text-purple-600"
                      : status === "rejected"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-slate-100 text-slate-600"
                }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold">
                {dict.company_detail.status.title}{" "}
                {status === "published"
                  ? dict.company_detail.status.published
                  : status === "pending_publish"
                    ? dict.company_detail.status.pending_publish
                    : status === "active"
                      ? dict.company_detail.status.active
                      : status === "pending_register"
                        ? dict.company_detail.status.pending_register
                        : status === "rejected"
                          ? dict.company_detail.status.rejected
                          : dict.company_detail.status.draft}
              </h3>
              <p className="text-xs opacity-90 leading-relaxed">
                {status === "published"
                  ? dict.company_detail.status.published_desc
                  : status === "pending_publish"
                    ? dict.company_detail.status.pending_publish_desc
                    : status === "active"
                      ? dict.company_detail.status.active_desc
                      : status === "pending_register"
                        ? dict.company_detail.status.pending_register_desc
                        : status === "rejected"
                          ? dict.company_detail.status.rejected_desc
                          : dict.company_detail.status.draft_desc}
              </p>

              {status === "active" && (
                <div className="bg-blue-100/50 border border-blue-200/60 rounded-xl p-3 mt-2 space-y-2 text-xs font-semibold text-blue-900 max-w-xl">
                  <h4 className="font-bold text-[13px] text-blue-950">
                    {dict.company_detail.status.checklist_title}
                  </h4>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasLogo ? "bg-emerald-500 text-white" : "bg-blue-200 text-blue-800"}`}
                      >
                        {hasLogo ? "✓" : "○"}
                      </span>
                      <span>
                        {hasLogo ? dict.company_detail.status.logo_done : dict.company_detail.status.logo_pending}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasBanner ? "bg-emerald-500 text-white" : "bg-blue-200 text-blue-800"}`}
                      >
                        {hasBanner ? "✓" : "○"}
                      </span>
                      <span>
                        {hasBanner ? dict.company_detail.status.banner_done : dict.company_detail.status.banner_pending}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasOtherImages ? "bg-emerald-500 text-white" : "bg-blue-200 text-blue-800"}`}
                      >
                        {hasOtherImages ? "✓" : "○"}
                      </span>
                      <span>
                        {hasOtherImages
                          ? dict.company_detail.status.activities_done.replace("{0}", companyImgs.length.toString())
                          : dict.company_detail.status.activities_pending.replace("{0}", companyImgs.length.toString())}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasServices ? "bg-emerald-500 text-white" : "bg-blue-200 text-blue-800"}`}
                      >
                        {hasServices ? "✓" : "○"}
                      </span>
                      <span>
                        {hasServices
                          ? dict.company_detail.status.services_done.replace("{0}", companyServices.length.toString())
                          : dict.company_detail.status.services_pending}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${hasActiveSubscription ? "bg-emerald-500 text-white" : "bg-blue-200 text-blue-800"}`}
                      >
                        {hasActiveSubscription ? "✓" : "○"}
                      </span>
                      <span>
                        {hasActiveSubscription ? (
                          dict.company_detail.status.sub_done
                        ) : (
                          <span>
                            {dict.company_detail.status.sub_pending}
                            <Link href="/billing" className="text-blue-600 hover:underline font-bold">
                              {dict.company_detail.status.sub_link}
                            </Link>
                            )
                          </span>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          {status === "active" && (
            <button
              type="button"
              disabled={!isProfileComplete}
              onClick={() => setIsConfirmModalOpen(true)}
              className={`lg:self-center px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap self-start cursor-pointer ${isProfileComplete
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                }`}
            >
              <Upload className="w-3.5 h-3.5" /> {dict.company_detail.status.submit_publish}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col space-y-6">
        {/* Section 1: Branding Images (Ảnh đại diện & Ảnh bìa) */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-l-3 border-primary pl-2.5">
            {dict.company_detail.sections.branding}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ảnh đại diện (Avatar) */}
            <div className="md:col-span-1 flex flex-col items-center justify-between border border-outline-variant rounded-xl p-4 bg-surface-container-low/50 relative group">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-surface shadow-sm bg-surface">
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploadingLogo ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Upload className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs font-bold text-on-surface">
                  {dict.company_detail.sections.avatar}
                </span>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  {dict.company_detail.sections.avatar_desc}
                </p>
              </div>
            </div>

            {/* Ảnh bìa (Banner) */}
            <div className="md:col-span-2 flex flex-col justify-between border border-outline-variant rounded-xl p-4 bg-surface-container-low/50 relative group">
              <div className="relative h-28 w-full rounded-2xl overflow-hidden shadow-sm bg-slate-900">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-102"
                  style={{ backgroundImage: `url(${bannerUrl})` }}
                />

                <div className="absolute inset-0 bg-slate-950/20" />

                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="absolute top-2 right-2 bg-surface-container-lowest/90 hover:bg-surface-container-lowest text-on-surface rounded-lg p-1.5 text-xs shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Camera className="w-3.5 h-3.5 text-on-surface-variant" />
                </button>
              </div>

              <div className="mt-3">
                <span className="text-xs font-bold text-on-surface">
                  {dict.company_detail.sections.banner}
                </span>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  {dict.company_detail.sections.banner_desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Giới thiệu doanh nghiệp */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-l-3 border-primary pl-2.5">
              {dict.company_detail.sections.intro}
            </h2>

            {!isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="text-on-surface-variant hover:text-primary border border-outline-variant rounded-lg p-1 hover:bg-surface-container-low transition-all cursor-pointer"
                title={dict.company_detail.tooltips.edit_desc}
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-1">
              <textarea
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearFieldError("description");
                }}
                placeholder={dict.company_detail.sections.intro_placeholder}
                className={getEditControlClassName(
                  "description",
                  "rounded-xl px-3.5 py-3 resize-none leading-relaxed",
                )}
              />

              {renderFieldError("description")}
            </div>
          ) : (
            <p className="text-sm text-on-surface leading-relaxed text-justify font-medium">
              {description || dict.company_detail.sections.intro_empty}
            </p>
          )}
        </section>

        {/* Section 3: Thông tin chi tiết */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-l-3 border-primary pl-2.5">
            {dict.company_detail.sections.details}
          </h2>

          <div className="space-y-3.5">
            <div className="grid grid-cols-12 gap-2 text-sm items-start">
              <span className="col-span-4 font-bold text-on-surface-variant flex items-center gap-1.5 pt-2">
                <Building2 className="w-4 h-4 text-outline" /> {dict.company_detail.sections.company_name}
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
                <span className="col-span-8 text-on-surface font-bold uppercase">
                  {fullName}
                </span>
              )}
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm items-start">
              <span className="col-span-4 font-bold text-on-surface-variant flex items-center gap-1.5 pt-2">
                <FileText className="w-4 h-4 text-outline" /> {dict.company_detail.sections.reg_code}
              </span>

              {isEditing ? (
                <div className="col-span-8 space-y-1">
                  <input
                    value={businessLicense}
                    readOnly
                    disabled
                    placeholder={dict.company_detail.sections.reg_code_empty}
                    className={`${getEditControlClassName("business_license_no")} bg-surface-variant/50 cursor-not-allowed opacity-60`}
                  />
                </div>
              ) : (
                <span className="col-span-8 text-on-surface font-semibold">
                  {businessLicense}
                </span>
              )}
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm items-start">
              <span className="col-span-4 font-bold text-on-surface-variant flex items-center gap-1.5 pt-2">
                <Briefcase className="w-4 h-4 text-outline" /> {dict.company_detail.sections.license_code}
              </span>

              {isEditing ? (
                <div className="col-span-8 space-y-1">
                  <input
                    value={companyLicense}
                    readOnly
                    disabled
                    placeholder={dict.company_detail.sections.license_code_empty}
                    className={`${getEditControlClassName("registration_code")} bg-surface-variant/50 cursor-not-allowed opacity-60`}
                  />
                </div>
              ) : (
                <span className="col-span-8 text-on-surface font-mono font-bold">
                  {companyLicense}
                </span>
              )}
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm items-start">
              <span className="col-span-4 font-bold text-on-surface-variant flex items-center gap-1.5 pt-2">
                <Mail className="w-4 h-4 text-outline" /> {dict.company_detail.sections.email}
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
                <span className="col-span-8 text-primary font-semibold hover:underline break-all">
                  {email}
                </span>
              )}
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm items-start">
              <span className="col-span-4 font-bold text-on-surface-variant flex items-center gap-1.5 pt-2">
                <Phone className="w-4 h-4 text-outline" /> {dict.company_detail.sections.phone}
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
                <span className="col-span-8 text-on-surface font-mono font-semibold">
                  {phone}
                </span>
              )}
            </div>

            <div className="grid grid-cols-12 gap-2 text-sm items-start">
              <span className="col-span-4 font-bold text-on-surface-variant flex items-center gap-1.5 pt-2">
                <MapPin className="w-4 h-4 text-outline" /> {dict.company_detail.sections.address}
              </span>

              {isEditing ? (
                <div className="col-span-8 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        value={editCityId}
                        onChange={(e) => {
                          setEditCityId(e.target.value === "" ? "" : Number(e.target.value));
                          setEditWardId("");
                          clearFieldError("address");
                        }}
                        className={`${getEditControlClassName("address")} appearance-none`}
                      >
                        <option value="" disabled className="text-slate-400 font-medium">
                          {dict.company_detail.modals.city_placeholder}
                        </option>
                        {cities.map((city) => (
                          <option key={city.city_id} value={city.city_id}>
                            {city.city_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={editWardId}
                        onChange={(e) => {
                          setEditWardId(e.target.value === "" ? "" : Number(e.target.value));
                          clearFieldError("address");
                        }}
                        disabled={editCityId === ""}
                        className={`${getEditControlClassName("address")} appearance-none disabled:opacity-50`}
                      >
                        <option value="" disabled className="text-slate-400 font-medium">
                          {dict.company_detail.modals.ward_placeholder}
                        </option>
                        {wards.map((ward) => (
                          <option key={ward.ward_id} value={ward.ward_id}>
                            {ward.ward_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editStreet}
                      onChange={(e) => {
                        setEditStreet(e.target.value);
                        clearFieldError("address");
                      }}
                      placeholder={dict.company_detail.modals.street_placeholder}
                      className={getEditControlClassName("address")}
                    />
                  </div>
                  {renderFieldError("address")}
                </div>
              ) : (
                <span className="col-span-8 text-on-surface font-semibold leading-relaxed">
                  {address}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Giấy phép hoạt động (Business License Card Redesign) */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-l-3 border-primary pl-2.5">
            {dict.company_detail.sections.license}
          </h2>

          {licenseImg ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full">
                {/* Thumbnail */}
                <div
                  onClick={() => setActiveViewerImg(licenseImg)}
                  className="w-16 h-20 shrink-0 border border-outline-variant rounded-lg overflow-hidden bg-surface-container-lowest shadow-3xs flex items-center justify-center relative group cursor-pointer hover:opacity-90"
                >
                  <img
                    src={licenseImg}
                    alt="License Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-on-surface">
                    {dict.company_detail.sections.business_license}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {dict.company_detail.sections.license_status}
                  </p>
                </div>
              </div>

              {/* Actions and Change Button Next To It */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveViewerImg(licenseImg)}
                  className="p-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-all shadow-3xs cursor-pointer"
                  title={dict.company_detail.tooltips.view_license}
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadLicenseFile(licenseImg)}
                  className="p-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-container-low transition-all shadow-3xs cursor-pointer"
                  title={dict.company_detail.tooltips.download_license}
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "error",
                      dict.company_detail.sections.license_admin_edit,
                    )
                  }
                  className="p-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-error hover:border-error/35 rounded-lg hover:bg-error/5 transition-all shadow-3xs cursor-pointer"
                  title={dict.company_detail.tooltips.delete_license}
                >
                  <Trash className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-outline-variant/60 mx-1" />

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "error",
                      dict.company_detail.sections.license_admin_update,
                    )
                  }
                  className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary transition-all text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  title={dict.company_detail.tooltips.change_license}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {dict.company_detail.tooltips.change_license}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() =>
                showToast(
                  "error",
                  dict.company_detail.sections.license_admin_submit,
                )
              }
              className="border-2 border-dashed border-outline-variant/60 hover:border-primary rounded-xl p-8 text-center cursor-pointer hover:bg-surface-container-low transition-all flex flex-col items-center justify-center group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-on-surface">
                {dict.company_detail.sections.license_upload}
              </span>
              <p className="text-xs text-on-surface-variant mt-1">
                {dict.company_detail.sections.license_upload_desc}
              </p>
            </div>
          )}
        </section>

        {/* Section 5: Hình ảnh hoạt động */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/60 pb-2">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-l-3 border-primary pl-2.5">
              {dict.company_detail.sections.activities}
            </h2>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleOpenActivityGallery}
                className="text-[11px] transition-all duration-300 font-bold text-on-surface-variant hover:text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                {dict.company_detail.sections.view_more}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {companyImgs.slice(0, 6).map((img, index) => (
              <div
                key={`${img}-${index}`}
                onClick={() => setActiveViewerImg(img)}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all border border-outline-variant bg-surface-container-low group relative shadow-sm"
              >
                <img
                  src={img}
                  alt={`Activity ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <Eye className="w-4 h-4 text-white" />
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveActivityImage(index);
                  }}
                  className="absolute top-1.5 right-1.5 rounded-full bg-surface-container-lowest/90 p-1 text-on-surface-variant opacity-0 shadow-sm transition-all hover:text-error group-hover:opacity-100 cursor-pointer"
                  title={dict.company_detail.tooltips.delete_image}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => activityInputRef.current?.click()}
              disabled={uploadingActivity}
              className="aspect-square rounded-xl border border-dashed border-primary/40 bg-primary/5 text-primary flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {uploadingActivity ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Upload className="w-5 h-5" />
              )}

              <span className="text-[10px] font-bold">
                {uploadingActivity ? "Đang tải" : "Thêm ảnh"}
              </span>
            </button>
          </div>

          {companyImgs.length === 0 && (
            <p className="text-xs text-on-surface-variant font-medium text-center py-4">
              {dict.company_detail.modals.gallery_empty}
            </p>
          )}
        </section>

        {/* Section 6: Dịch vụ cung cấp */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/60 pb-4">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest border-l-3 border-primary pl-2.5">
              {dict.company_detail.sections.services}
            </h2>

            <button
              type="button"
              onClick={() => setIsAddServiceOpen(true)}
              className="px-3.5 py-1.5 border border-primary/20 bg-primary/10 hover:bg-primary/15 text-primary active:bg-primary/25 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer font-sans"
            >
              <Plus className="w-3.5 h-3.5" /> {dict.company_detail.sections.add_service}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/60 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-1/3">Tên dịch vụ</th>
                  <th className="pb-3 w-5/12">Mô tả</th>
                  <th className="pb-3 pr-2 w-1/4 text-right">Giá dịch vụ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/40">
                {companyServices.map((service) => (
                  <tr
                    key={service.serviceId}
                    className="group hover:bg-surface-container-low transition-colors"
                  >
                    <td className="py-4 pl-2">
                      <div className="font-bold text-on-surface text-sm">
                        {service.name}
                      </div>

                      {service.baseDescription && (
                        <div className="text-[11px] text-on-surface-variant font-medium mt-0.5 leading-normal max-w-[280px]">
                          {service.baseDescription}
                        </div>
                      )}
                    </td>

                    <td className="py-4 pr-4">
                      <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                        {service.description}
                      </p>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm font-extrabold text-primary">
                          {typeof service.price === "number"
                            ? service.price.toLocaleString("vi-VN") + "đ"
                            : service.price}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.serviceId)}
                          className="p-1 text-on-surface-variant/40 hover:text-error rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
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
                      className="py-8 text-center text-sm text-on-surface-variant font-medium"
                    >
                      {dict.company_detail.sections.no_services}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[80] w-[320px] rounded-2xl border bg-white px-4 py-3 shadow-2xl transition-all duration-300 ease-out ${toastVisible
            ? "translate-x-0 opacity-100"
            : "translate-x-[120%] opacity-0"
            } ${toast.type === "success" ? "border-green-200" : "border-red-200"}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
            />

            <div className="flex-1">
              <p
                className={`text-xs font-extrabold uppercase tracking-wide ${toast.type === "success" ? "text-green-700" : "text-red-600"
                  }`}
              >
                {toast.type === "success" ? dict.company_detail.toast.success : dict.company_detail.toast.failed}
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
                  {dict.company_detail.modals.gallery_title}
                </h3>

                <p className="mt-0.5 text-xs font-medium text-slate-400">
                  {dict.company_detail.modals.gallery_count.replace("{0}", allActivityImgs.length.toString())}
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
                    {dict.company_detail.modals.gallery_empty}
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
                {dict.company_detail.modals.add_service_title}
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
                  {dict.company_detail.modals.service_name}
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
                      {dict.company_detail.modals.select_service}
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
                      {dict.company_detail.modals.service_meaning}
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
                  {dict.company_detail.modals.service_desc_label}
                </label>

                <textarea
                  rows={3}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder={dict.company_detail.modals.service_desc_placeholder}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  {dict.company_detail.modals.service_price_label}
                </label>

                <input
                  type="text"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder={dict.company_detail.modals.service_price_placeholder}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {dict.company_detail.sections.cancel}
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {dict.company_detail.modals.add_service_btn}
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

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 transform transition-all scale-100">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {dict.company_detail.modals.publish_title}
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg p-1 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                {dict.company_detail.modals.publish_desc}
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">
                  {dict.company_detail.modals.note_label}
                </label>
                <textarea
                  rows={3}
                  value={publishNote}
                  onChange={(e) => setPublishNote(e.target.value)}
                  placeholder={dict.company_detail.modals.note_placeholder}
                  className="w-full text-sm border border-outline-variant rounded-xl px-3 py-2 font-medium text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary/20 outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={submittingPublish}
                className="px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-all text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {dict.company_detail.sections.cancel}
              </button>
              <button
                type="button"
                onClick={handleSubmitPublishRequest}
                disabled={submittingPublish}
                className="px-4 py-2 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submittingPublish ? dict.company_detail.modals.sending : dict.company_detail.modals.confirm_send}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
