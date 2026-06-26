"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  requestGetCompanyById,
  requestGetAvailableServices,
  requestAddCompanyService,
  requestDeleteCompanyService,
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

export default function MyCompanyDetail() {
  const { company_id } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const activityInputRef = useRef<HTMLInputElement>(null);

  // 1. Core State
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");

  // 2. Company Details State
  const [fullName, setFullName] = useState("");
  const [companyLicense, setCompanyLicense] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // 3. Image URLs State
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

  // 4. Edit Snapshot
  const [editSnapshot, setEditSnapshot] = useState<EditSnapshot | null>(null);

  // 5. UI Modals / Modes State
  const [activeViewerImg, setActiveViewerImg] = useState<string | null>(null);

  // 6. Services State
  const [companyServices, setCompanyServices] = useState<CompanyServiceData[]>(
    [],
  );
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  // 7. Add Service Modal State
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [newServiceId, setNewServiceId] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const editInputClassName =
    "col-span-8 text-sm border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden";

  const editTextareaClassName =
    "col-span-8 text-sm border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden resize-none";

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

    setIsEditing(true);
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

    setIsEditing(false);
  };

  const handleSelectLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLogoUrl(previewUrl);

    console.log("Selected logo file:", file);

    // TODO:
    // Gắn API upload logo ở đây nếu muốn lưu ngay sau khi chọn.
    // await requestUploadCompanyImage(company_id, file, "logo");

    e.target.value = "";
  };

  const handleSelectBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setBannerUrl(previewUrl);

    console.log("Selected banner file:", file);

    // TODO:
    // Gắn API upload banner ở đây nếu muốn lưu ngay sau khi chọn.
    // await requestUploadCompanyImage(company_id, file, "banner");

    e.target.value = "";
  };

  const handleSelectActivityImages = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) return;

    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setCompanyImgs((prev) => [...previewUrls, ...prev]);

    console.log("Selected activity image files:", files);

    // TODO:
    // Gắn API upload nhiều hình ảnh hoạt động ở đây nếu muốn lưu ngay sau khi chọn.
    // await requestUploadCompanyActivityImages(company_id, files);

    e.target.value = "";
  };

  const handleRemoveActivityImage = (index: number) => {
    setCompanyImgs((prev) => prev.filter((_, i) => i !== index));

    // TODO:
    // Nếu ảnh đã lưu DB thì cần gọi API delete company_imgs theo image_id.
  };

  const handleSaveEdit = async () => {
    if (!company_id) return;

    try {
      setSaving(true);

      const payload = {
        companyName: fullName,
        description,
        businessLicense,
        companyLicense,
        email,
        phone,
        address,
      };

      console.log("Update company info payload:", payload);

      // TODO:
      // Gắn API update thông tin công ty ở đây.
      // Ví dụ:
      // await requestUpdateCompanyInfo(company_id, payload);
      //
      // API này chỉ update thông tin chữ:
      // - company_name
      // - description
      // - business_license_no
      // - company_license_no
      // - email
      // - phone
      // - address

      setCompanyName(fullName);
      setIsEditing(false);
      setEditSnapshot(null);

      alert("Đã lưu thay đổi thông tin công ty.");
    } catch (err: any) {
      console.error("Lỗi khi cập nhật công ty:", err);
      alert(err.message || "Không thể cập nhật thông tin công ty.");
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

      {/* 1. Header & Cover Section */}
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
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" /> Thay đổi ảnh bìa
          </button>
        </div>

        <div className="px-6 pb-6 pt-4 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative -mt-16 sm:-mt-20 shrink-0 z-10 group">
              <img
                src={logoUrl}
                alt="Company Logo"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
              />

              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
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

      {/* 2. Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 2.1: Giới thiệu */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-3 border-blue-600 pl-2.5">
              Giới thiệu doanh nghiệp
            </h2>

            {isEditing ? (
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập giới thiệu doanh nghiệp..."
                className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl px-3.5 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-hidden font-medium resize-none leading-relaxed"
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed text-justify font-medium">
                {description || "Chưa có giới thiệu doanh nghiệp."}
              </p>
            )}
          </section>

          {/* Card 2.2: Thông tin công ty */}
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
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập tên công ty"
                      className={editInputClassName}
                    />
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
                    <input
                      value={businessLicense}
                      onChange={(e) => setBusinessLicense(e.target.value)}
                      placeholder="Nhập mã số đăng ký"
                      className={editInputClassName}
                    />
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
                    <input
                      value={companyLicense}
                      onChange={(e) => setCompanyLicense(e.target.value)}
                      placeholder="Nhập mã số giấy phép"
                      className={editInputClassName}
                    />
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
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email"
                      className={editInputClassName}
                    />
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
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className={editInputClassName}
                    />
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
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ"
                      className={editTextareaClassName}
                    />
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

          {/* Card 2.3: Dịch vụ cung cấp */}
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

        {/* Right Columns */}
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-3 border-blue-600 pl-2.5">
                Hình ảnh hoạt động
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
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
                </div>
              ))}

              <button
                type="button"
                onClick={() => activityInputRef.current?.click()}
                className="aspect-square rounded-xl border border-dashed border-blue-300 bg-blue-50/50 text-blue-600 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[10px] font-bold">Thêm ảnh</span>
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

      {/* 4. Add Service Modal */}
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

      {/* 5. Image Lightbox Viewer Modal */}
      {activeViewerImg && (
        <div
          onClick={() => setActiveViewerImg(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xs z-55 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
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
