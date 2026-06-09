"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Info, Pencil, Plus, Trash2, User } from "lucide-react";
import { useOnboardingData } from "../hooks/useOnboardingData";
import OnboardingFooter from "./OnboardingFooter";
import {
  onboardingBreadcrumb,
  onboardingBreadcrumbActive,
  onboardingBtnPrimary,
  onboardingCard,
  onboardingCardTitle,
  onboardingInfoBox,
  onboardingInfoText,
  onboardingInput,
  onboardingInputError,
  onboardingLabel,
  onboardingPageBg,
  onboardingPageSubtitle,
  onboardingPageTitle,
  onboardingTableHead,
} from "./onboardingStyles";
import { ACTIVITY_TYPE_COLORS, type ActivityType, type CompanyComponent } from "../types";

type FormErrors = {
  name?: string;
  activityType?: string;
  address?: string;
  personInCharge?: string;
  general?: string;
};

const ACTIVITY_TYPES: ActivityType[] = ["Chi nhánh", "Kho bãi", "Showroom", "Văn phòng", "Trung tâm điều phối"];
const fieldClass = (hasError?: boolean) => (hasError ? onboardingInputError : onboardingInput);

export default function ComponentProfileForm() {
  const router = useRouter();
  const { data, isLoaded, saveComponents } = useOnboardingData();
  const [components, setComponents] = useState<CompanyComponent[]>([]);
  const [name, setName] = useState("");
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [address, setAddress] = useState("");
  const [personInCharge, setPersonInCharge] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isLoaded) setComponents(data.components);
  }, [isLoaded, data.components]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Vui lòng nhập tên thành phần";
    if (!activityType) newErrors.activityType = "Vui lòng chọn loại hình hoạt động";
    if (!address.trim()) newErrors.address = "Vui lòng nhập địa chỉ trụ sở";
    if (!personInCharge.trim()) newErrors.personInCharge = "Vui lòng nhập người phụ trách";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName(""); setActivityType(""); setAddress(""); setPersonInCharge(""); setEditingId(null); setErrors({});
  };

  const handleAddOrUpdate = () => {
    if (!validateForm()) return;
    if (editingId) {
      const updated = components.map((c) =>
        c.id === editingId ? { ...c, name: name.trim(), activityType: activityType as ActivityType, address: address.trim(), personInCharge: personInCharge.trim() } : c,
      );
      setComponents(updated);
      saveComponents(updated);
    } else {
      const updated = [...components, { id: crypto.randomUUID(), name: name.trim(), activityType: activityType as ActivityType, address: address.trim(), personInCharge: personInCharge.trim() }];
      setComponents(updated);
      saveComponents(updated);
    }
    resetForm();
  };

  const handleNext = () => {
    if (components.length === 0) {
      setErrors({ general: "Vui lòng thêm ít nhất một thành phần trước khi tiếp tục." });
      return;
    }
    router.push("/onboarding/business-license");
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${onboardingPageBg}`}>
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <nav className={onboardingBreadcrumb}>
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className={onboardingBreadcrumbActive}>Hồ sơ Thành phần</span>
          </nav>
          <div>
            <h2 className={onboardingPageTitle}>Thiết lập Hồ sơ Thành phần</h2>
            <p className={`${onboardingPageSubtitle} max-w-2xl`}>
              Cung cấp thông tin chi tiết về các đơn vị, chi nhánh hoặc thành phần trực thuộc doanh nghiệp của bạn để hệ thống quản lý hiệu quả hơn.
            </p>
          </div>
          {errors.general && (
            <p className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-medium text-error">{errors.general}</p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${onboardingCard} p-6`}>
              <h3 className={onboardingCardTitle}>{editingId ? "Chỉnh sửa thành phần" : "Thêm thành phần mới"}</h3>
              <div className="space-y-4">
                <div>
                  <label className={onboardingLabel}>Tên thành phần</label>
                  <input type="text" placeholder="VD: Chi nhánh Quận 1" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }} className={fieldClass(!!errors.name)} />
                  {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
                </div>
                <div>
                  <label className={onboardingLabel}>Loại hình hoạt động</label>
                  <select value={activityType} onChange={(e) => { setActivityType(e.target.value as ActivityType); setErrors((p) => ({ ...p, activityType: undefined })); }} className={fieldClass(!!errors.activityType)}>
                    <option value="">Chọn loại hình</option>
                    {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.activityType && <p className="mt-1 text-xs text-error">{errors.activityType}</p>}
                </div>
                <div>
                  <label className={onboardingLabel}>Địa chỉ trụ sở</label>
                  <textarea rows={3} placeholder="Số nhà, tên đường, phường/xã..." value={address} onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: undefined })); }} className={`${fieldClass(!!errors.address)} resize-none`} />
                  {errors.address && <p className="mt-1 text-xs text-error">{errors.address}</p>}
                </div>
                <div>
                  <label className={onboardingLabel}>Người phụ trách</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input type="text" placeholder="Họ và tên" value={personInCharge} onChange={(e) => { setPersonInCharge(e.target.value); setErrors((p) => ({ ...p, personInCharge: undefined })); }} className={`${fieldClass(!!errors.personInCharge)} pl-10`} />
                  </div>
                  {errors.personInCharge && <p className="mt-1 text-xs text-error">{errors.personInCharge}</p>}
                </div>
                <button type="button" onClick={handleAddOrUpdate} className={`${onboardingBtnPrimary} w-full py-3 mt-2`}>
                  <Plus className="w-4 h-4" />
                  {editingId ? "Cập nhật thành phần" : "Thêm vào danh sách"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="w-full py-2 text-sm font-medium text-on-surface-variant hover:text-primary">Hủy chỉnh sửa</button>
                )}
              </div>
            </div>
            <div className={`${onboardingCard} p-6 flex flex-col`}>
              <h3 className={onboardingCardTitle}>
                Danh sách đã thêm <span className="text-primary">({components.length})</span>
              </h3>
              {components.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-16 text-on-surface-variant text-sm text-center px-4">
                  Chưa có thành phần nào.<br />Hãy thêm thành phần đầu tiên bên trái.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-left text-sm min-w-[380px]">
                    <thead>
                      <tr className={onboardingTableHead}>
                        <th className="py-2.5 px-3 text-[11px] font-semibold text-on-surface uppercase tracking-wide rounded-tl-lg">Thành phần</th>
                        <th className="py-2.5 px-3 text-[11px] font-semibold text-on-surface uppercase tracking-wide">Loại hình</th>
                        <th className="py-2.5 px-3 text-[11px] font-semibold text-on-surface uppercase tracking-wide">Người phụ trách</th>
                        <th className="py-2.5 px-3 text-right text-[11px] font-semibold text-on-surface uppercase tracking-wide rounded-tr-lg">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                      {components.map((c) => (
                        <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3.5 px-3">
                            <p className="font-semibold text-on-surface">{c.name}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">{c.address}</p>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ACTIVITY_TYPE_COLORS[c.activityType]}`}>{c.activityType}</span>
                          </td>
                          <td className="py-3.5 px-3 text-on-surface text-[13px]">{c.personInCharge}</td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <button type="button" onClick={() => { setName(c.name); setActivityType(c.activityType); setAddress(c.address); setPersonInCharge(c.personInCharge); setEditingId(c.id); setErrors({}); }} className="p-2 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low"><Pencil className="w-3.5 h-3.5" /></button>
                              <button type="button" onClick={() => { const u = components.filter((x) => x.id !== c.id); setComponents(u); saveComponents(u); if (editingId === c.id) resetForm(); }} className="p-2 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className={onboardingInfoBox + " mt-5"}>
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className={onboardingInfoText}>
                  Bạn có thể thêm không giới hạn số lượng thành phần. Mỗi thành phần sẽ được quản lý độc lập trong hệ thống SGCMP.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OnboardingFooter backHref="/onboarding/basic-info" onNext={handleNext} nextLabel="Tiếp theo" />
    </div>
  );
}
