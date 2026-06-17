"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import OnboardingFooter from "./OnboardingFooter";

const inputClass =
  "w-full rounded-lg border border-outline-variant px-4 py-2.5 text-sm outline-none transition placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest";

export default function BasicInfoForm({ onNext }: { onNext?: () => void }) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      router.push("/onboarding/component-profile");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[720px] mx-auto space-y-6">
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-primary font-semibold">Thông tin cơ bản</span>
          </nav>

          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Thông tin doanh nghiệp
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Nhập thông tin cơ bản về doanh nghiệp của bạn để bắt đầu quy trình đăng ký.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                Tên công ty
              </label>
              <input
                type="text"
                placeholder="VD: Công ty TNHH Bảo vệ Sài Gòn"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                  Lĩnh vực hoạt động
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Chọn lĩnh vực</option>
                  <option value="An ninh mạng">An ninh mạng</option>
                  <option value="Bảo vệ">Bảo vệ</option>
                  <option value="Phần mềm doanh nghiệp">Phần mềm doanh nghiệp</option>
                  <option value="Vận tải">Vận tải</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                  Loại hình doanh nghiệp
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Chọn loại hình</option>
                  <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                  <option value="Trách nhiệm hữu hạn">Trách nhiệm hữu hạn</option>
                  <option value="Cổ phần">Cổ phần</option>
                  <option value="Tập đoàn nước ngoài">Tập đoàn nước ngoài</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                Địa chỉ trụ sở chính
              </label>
              <textarea
                rows={3}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>
      </div>

      <OnboardingFooter onNext={handleNext} nextLabel="Tiếp theo" />
    </div>
  );
}
