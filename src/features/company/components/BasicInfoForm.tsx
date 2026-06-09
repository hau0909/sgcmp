"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import OnboardingFooter from "./OnboardingFooter";
import {
  onboardingBreadcrumb,
  onboardingBreadcrumbActive,
  onboardingCard,
  onboardingInput,
  onboardingLabel,
  onboardingPageBg,
  onboardingPageSubtitle,
  onboardingPageTitle,
} from "./onboardingStyles";

export default function BasicInfoForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${onboardingPageBg}`}>
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
        <div className="max-w-[720px] mx-auto space-y-6">
          <nav className={onboardingBreadcrumb}>
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className={onboardingBreadcrumbActive}>Thông tin cơ bản</span>
          </nav>
          <div>
            <h2 className={onboardingPageTitle}>Thông tin doanh nghiệp</h2>
            <p className={onboardingPageSubtitle}>Nhập thông tin cơ bản về doanh nghiệp của bạn để bắt đầu quy trình đăng ký.</p>
          </div>
          <div className={`${onboardingCard} p-6 space-y-4`}>
            <div>
              <label className={onboardingLabel}>Tên công ty</label>
              <input type="text" placeholder="VD: Công ty TNHH Bảo vệ Sài Gòn" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={onboardingInput} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={onboardingLabel}>Lĩnh vực hoạt động</label>
                <select value={sector} onChange={(e) => setSector(e.target.value)} className={onboardingInput}>
                  <option value="">Chọn lĩnh vực</option>
                  <option value="Bảo vệ">Bảo vệ</option>
                  <option value="An ninh mạng">An ninh mạng</option>
                  <option value="Phần mềm doanh nghiệp">Phần mềm doanh nghiệp</option>
                </select>
              </div>
              <div>
                <label className={onboardingLabel}>Loại hình doanh nghiệp</label>
                <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={onboardingInput}>
                  <option value="">Chọn loại hình</option>
                  <option value="Doanh nghiệp tư nhân">Doanh nghiệp tư nhân</option>
                  <option value="Trách nhiệm hữu hạn">Trách nhiệm hữu hạn</option>
                  <option value="Cổ phần">Cổ phần</option>
                </select>
              </div>
            </div>
            <div>
              <label className={onboardingLabel}>Địa chỉ trụ sở chính</label>
              <textarea rows={3} placeholder="Số nhà, tên đường, phường/xã..." value={address} onChange={(e) => setAddress(e.target.value)} className={`${onboardingInput} resize-none`} />
            </div>
          </div>
        </div>
      </div>
      <OnboardingFooter onNext={() => router.push("/onboarding/component-profile")} nextLabel="Tiếp theo" />
    </div>
  );
}
