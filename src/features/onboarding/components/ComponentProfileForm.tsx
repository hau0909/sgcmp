"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Info,
  Pencil,
  Plus,
  Trash2,
  User,
  X,
  Upload,
} from "lucide-react";
import { useOnboardingData } from "../hooks/useOnboardingData";
import OnboardingFooter from "./OnboardingFooter";
import {
  ACTIVITY_TYPE_COLORS,
  type ActivityType,
  type CompanyComponent,
} from "../types";

type FormErrors = {
  name?: string;
  activityType?: string;
  address?: string;
  personInCharge?: string;
  general?: string;
  photos?: string;
};

const ACTIVITY_TYPES: ActivityType[] = [
  "Chi nhánh",
  "Kho bãi",
  "Showroom",
  "Văn phòng",
  "Trung tâm điều phối",
];

const inputClass = (hasError?: boolean) =>
  `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition placeholder:text-on-surface-variant/60 focus:ring-1 ${
    hasError
      ? "border-error focus:border-error focus:ring-error"
      : "border-outline-variant focus:border-primary focus:ring-primary bg-surface-container-lowest"
  }`;

export default function ComponentProfileForm({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) {
  const router = useRouter();
  const { data, isLoaded, saveComponents } = useOnboardingData();

  const [components, setComponents] = useState<CompanyComponent[]>([]);
  const [name, setName] = useState("");
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [address, setAddress] = useState("");
  const [personInCharge, setPersonInCharge] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isLoaded) {
      setComponents(data.components);
    }
  }, [isLoaded, data.components]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((results) => {
      setPhotos((prev) => {
        const updated = [...prev, ...results].slice(0, 2);
        return updated;
      });
      setErrors((prev) => ({ ...prev, photos: undefined }));
    });
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "Vui lòng nhập tên thành phần";
    if (!activityType) newErrors.activityType = "Vui lòng chọn loại hình hoạt động";
    if (!address.trim()) newErrors.address = "Vui lòng nhập địa chỉ trụ sở";
    if (!personInCharge.trim()) newErrors.personInCharge = "Vui lòng nhập người phụ trách";
    if (photos.length < 2) {
      newErrors.photos = "Vui lòng tải lên ít nhất 2 ảnh thực tế của thành phần";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName("");
    setActivityType("");
    setAddress("");
    setPersonInCharge("");
    setPhotos([]);
    setEditingId(null);
    setErrors({});
  };

  const handleAddOrUpdate = () => {
    if (!validateForm()) return;

    if (editingId) {
      const updated = components.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: name.trim(),
              activityType: activityType as ActivityType,
              address: address.trim(),
              personInCharge: personInCharge.trim(),
              photos: photos,
            }
          : c,
      );
      setComponents(updated);
      saveComponents(updated);
    } else {
      const newComponent: CompanyComponent = {
        id: crypto.randomUUID(),
        name: name.trim(),
        activityType: activityType as ActivityType,
        address: address.trim(),
        personInCharge: personInCharge.trim(),
        photos: photos,
      };
      const updated = [...components, newComponent];
      setComponents(updated);
      saveComponents(updated);
    }

    resetForm();
  };

  const handleEdit = (component: CompanyComponent) => {
    setName(component.name);
    setActivityType(component.activityType);
    setAddress(component.address);
    setPersonInCharge(component.personInCharge);
    setPhotos(component.photos || []);
    setEditingId(component.id);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    const updated = components.filter((c) => c.id !== id);
    setComponents(updated);
    saveComponents(updated);
    if (editingId === id) resetForm();
  };

  const handleNext = () => {
    if (components.length === 0) {
      setErrors({ general: "Vui lòng thêm ít nhất một thành phần trước khi tiếp tục." });
      return;
    }
    if (onNext) {
      onNext();
    } else {
      router.push("/onboarding/business-license");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-primary font-semibold">Hồ sơ Thành phần</span>
          </nav>

          {/* Page Header */}
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Thiết lập Hồ sơ Thành phần
            </h2>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
              Cung cấp thông tin chi tiết về các đơn vị, chi nhánh hoặc thành phần
              trực thuộc doanh nghiệp của bạn để hệ thống quản lý hiệu quả hơn.
            </p>
          </div>

          {errors.general && (
            <p className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-medium text-error">
              {errors.general}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Add Form */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-5">
                {editingId ? "Chỉnh sửa thành phần" : "Thêm thành phần mới"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Tên thành phần
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Chi nhánh Quận 1"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={inputClass(!!errors.name)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs font-medium text-error">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Loại hình hoạt động
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => {
                      setActivityType(e.target.value as ActivityType);
                      setErrors((prev) => ({ ...prev, activityType: undefined }));
                    }}
                    className={inputClass(!!errors.activityType)}
                  >
                    <option value="">Chọn loại hình</option>
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.activityType && (
                    <p className="mt-1 text-xs font-medium text-error">{errors.activityType}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Địa chỉ trụ sở
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã..."
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((prev) => ({ ...prev, address: undefined }));
                    }}
                    className={`${inputClass(!!errors.address)} resize-none`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs font-medium text-error">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Người phụ trách
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      value={personInCharge}
                      onChange={(e) => {
                        setPersonInCharge(e.target.value);
                        setErrors((prev) => ({ ...prev, personInCharge: undefined }));
                      }}
                      className={`${inputClass(!!errors.personInCharge)} pl-10`}
                    />
                  </div>
                  {errors.personInCharge && (
                    <p className="mt-1 text-xs font-medium text-error">{errors.personInCharge}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                    Ảnh thực tế thành phần (Tối thiểu 2 ảnh)
                    <span className="text-error ml-0.5">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low group">
                        <img src={photo} alt={`Component photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-error transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {photos.length < 2 && (
                      <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-outline-variant hover:border-primary hover:bg-surface-container-low cursor-pointer transition-colors min-h-[90px]">
                        <Upload className="w-5 h-5 text-on-surface-variant mb-1" />
                        <span className="text-[11px] font-semibold text-on-surface">Tải ảnh ({photos.length}/2)</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.photos && (
                    <p className="mt-1 text-xs font-medium text-error">{errors.photos}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddOrUpdate}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold transition-colors mt-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? "Cập nhật thành phần" : "Thêm vào danh sách"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>
            </div>

            {/* Right: List */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-on-surface mb-5">
                Danh sách đã thêm{" "}
                <span className="text-primary">({components.length})</span>
              </h3>

              {components.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12 text-on-surface-variant text-sm">
                  Chưa có thành phần nào. Hãy thêm thành phần đầu tiên.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-left text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-2 px-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                          Thành phần
                        </th>
                        <th className="py-2 px-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                          Loại hình
                        </th>
                        <th className="py-2 px-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                          Người phụ trách
                        </th>
                        <th className="py-2 px-2 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {components.map((component) => (
                        <tr key={component.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3 px-2">
                            <p className="font-semibold text-on-surface">{component.name}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">
                              {component.address}
                            </p>
                            {component.photos && component.photos.length > 0 && (
                              <div className="flex gap-1.5 mt-1.5">
                                {component.photos.map((photo, i) => (
                                  <div key={i} className="w-8 h-8 rounded border border-outline-variant overflow-hidden shrink-0 bg-surface-container-low">
                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full ${ACTIVITY_TYPE_COLORS[component.activityType]}`}
                            >
                              {component.activityType}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-on-surface text-[13px]">
                            {component.personInCharge}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(component)}
                                className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                                aria-label="Chỉnh sửa"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(component.id)}
                                className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
                                aria-label="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex items-start gap-3 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] px-4 py-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-[#1e40af] leading-relaxed">
                  Bạn có thể thêm không giới hạn số lượng thành phần. Mỗi thành phần sẽ được
                  quản lý độc lập trong hệ thống SGCMP.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OnboardingFooter
        onBack={onBack}
        backHref={onBack ? undefined : "/onboarding/basic-info"}
        onNext={handleNext}
        nextLabel="Tiếp theo"
      />
    </div>
  );
}
