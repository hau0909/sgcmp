"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useOnboardingData } from "../hooks/useOnboardingData";
import OnboardingFooter from "./OnboardingFooter";
import CompanySuccessModal from "./CompanySuccessModal";
import {
  onboardingBreadcrumb,
  onboardingBreadcrumbActive,
  onboardingCard,
  onboardingPageBg,
  onboardingPageSubtitle,
  onboardingPageTitle,
} from "./onboardingStyles";
import { ACTIVITY_TYPE_COLORS } from "../types";

export default function ReviewSubmitForm() {
  const router = useRouter();
  const { data, clearOnboardingData } = useOnboardingData();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleConfirmSuccess = () => {
    clearOnboardingData();
    setShowSuccessModal(false);
    router.push("/onboarding/basic-info");
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${onboardingPageBg}`}>
      <CompanySuccessModal open={showSuccessModal} onConfirm={handleConfirmSuccess} />
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
        <div className="max-w-[900px] mx-auto space-y-6">
          <nav className={onboardingBreadcrumb}>
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className={onboardingBreadcrumbActive}>Xem lại & Gửi</span>
          </nav>
          <div>
            <h2 className={onboardingPageTitle}>Xem lại hồ sơ đăng ký</h2>
            <p className={onboardingPageSubtitle}>Kiểm tra lại thông tin trước khi gửi hồ sơ để xét duyệt.</p>
          </div>
          <div className={`${onboardingCard} p-6 space-y-6`}>
            <section>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-3 pb-2 border-b border-outline-variant font-headline">
                Hồ sơ Thành phần ({data.components.length})
              </h3>
              {data.components.length === 0 ? (
                <p className="text-sm text-on-surface-variant font-body">Chưa có thành phần nào.</p>
              ) : (
                <div className="space-y-1">
                  {data.components.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{c.name}</p>
                        <p className="text-xs text-on-surface-variant">{c.address}</p>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${ACTIVITY_TYPE_COLORS[c.activityType]}`}>{c.activityType}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-3 pb-2 border-b border-outline-variant font-headline">
                Giấy phép Kinh doanh
              </h3>
              {data.businessLicense.registrationNumber ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-body">
                  <div><dt className="text-on-surface-variant text-xs mb-0.5">Số GCNĐKKD</dt><dd className="font-semibold text-on-surface">{data.businessLicense.registrationNumber}</dd></div>
                  <div><dt className="text-on-surface-variant text-xs mb-0.5">Ngày cấp</dt><dd className="font-semibold text-on-surface">{data.businessLicense.issueDate || "—"}</dd></div>
                  <div><dt className="text-on-surface-variant text-xs mb-0.5">Người đại diện</dt><dd className="font-semibold text-on-surface">{data.businessLicense.representativeName || "—"}</dd></div>
                  <div><dt className="text-on-surface-variant text-xs mb-0.5">Tài liệu đính kèm</dt><dd className="font-semibold text-on-surface">{data.businessLicense.licenseFileName || "Chưa tải lên"}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-on-surface-variant font-body">Chưa cung cấp thông tin giấy phép.</p>
              )}
            </section>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-primary-fixed/30 border border-primary-fixed px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-on-primary-fixed-variant leading-relaxed font-body">
              Bằng việc gửi hồ sơ, bạn xác nhận rằng tất cả thông tin cung cấp là chính xác và đồng ý với điều khoản sử dụng của SGCMP.
            </p>
          </div>
        </div>
      </div>
      <OnboardingFooter backHref="/onboarding/business-license" onNext={() => setShowSuccessModal(true)} nextLabel="Gửi hồ sơ" />
    </div>
  );
}
