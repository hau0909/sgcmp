"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Check } from "lucide-react";
import { useOnboardingData } from "../hooks/useOnboardingData";
import OnboardingFooter from "./OnboardingFooter";
import { ACTIVITY_TYPE_COLORS } from "../types";

export default function ReviewSubmitForm({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const { data } = useOnboardingData();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  useEffect(() => {
    if (!showSuccessModal) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSuccessModal, router]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[900px] mx-auto space-y-6">
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-primary font-semibold">Xem lại & Gửi</span>
          </nav>

          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Xem lại hồ sơ đăng ký
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Kiểm tra lại thông tin trước khi gửi hồ sơ để xét duyệt.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
            <section>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-3">
                Hồ sơ Thành phần ({data.components.length})
              </h3>
              {data.components.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Chưa có thành phần nào.</p>
              ) : (
                <div className="space-y-2">
                  {data.components.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-4 py-2 border-b border-outline-variant last:border-0"
                    >
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{c.name}</p>
                        <p className="text-xs text-on-surface-variant">{c.address}</p>
                        {c.photos && c.photos.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {c.photos.map((photo, i) => (
                              <div key={i} className="w-12 h-12 rounded border border-outline-variant overflow-hidden shrink-0 bg-surface-container-low">
                                <img src={photo} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${ACTIVITY_TYPE_COLORS[c.activityType]}`}
                      >
                        {c.activityType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-3">
                Giấy phép Kinh doanh
              </h3>
              {data.businessLicense.registrationNumber ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-on-surface-variant text-xs">Số GCNĐKKD</dt>
                    <dd className="font-semibold text-on-surface">
                      {data.businessLicense.registrationNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Ngày cấp</dt>
                    <dd className="font-semibold text-on-surface">
                      {data.businessLicense.issueDate || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Người đại diện</dt>
                    <dd className="font-semibold text-on-surface">
                      {data.businessLicense.representativeName || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Tài liệu đính kèm</dt>
                    <dd className="font-semibold text-on-surface">
                      {data.businessLicense.licenseFileName || "Chưa tải lên"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Ảnh mặt trước CCCD</dt>
                    <dd className="font-semibold text-on-surface mt-1">
                      {data.businessLicense.idFrontCardFileName ? (
                        <div className="w-24 h-16 rounded border border-outline-variant overflow-hidden bg-surface-container-low mt-1">
                          <img src={data.businessLicense.idFrontCardFileName} alt="Mặt trước CCCD" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        "Chưa tải lên"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Ảnh mặt sau CCCD</dt>
                    <dd className="font-semibold text-on-surface mt-1">
                      {data.businessLicense.idBackCardFileName ? (
                        <div className="w-24 h-16 rounded border border-outline-variant overflow-hidden bg-surface-container-low mt-1">
                          <img src={data.businessLicense.idBackCardFileName} alt="Mặt sau CCCD" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        "Chưa tải lên"
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-on-surface-variant">Chưa cung cấp thông tin giấy phép.</p>
              )}
            </section>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
            <p className="text-xs text-[#166534] leading-relaxed">
              Bằng việc gửi hồ sơ, bạn xác nhận rằng tất cả thông tin cung cấp là chính xác
              và đồng ý với điều khoản sử dụng của SGCMP.
            </p>
          </div>
        </div>
      </div>

      <OnboardingFooter
        onBack={onBack}
        backHref={onBack ? undefined : "/onboarding/business-license"}
        onNext={handleSubmit}
        nextLabel="Gửi hồ sơ"
      />

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md p-8 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Background design elements to mimic the image */}
            <div className="relative flex items-center justify-center w-28 h-28 mb-6">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 bg-[#e6fbf1] rounded-full scale-95 opacity-80" />
              
              {/* Floating dots and pluses from the design image */}
              {/* Top Right Green Plus */}
              <div className="absolute top-0 right-0 text-emerald-500 font-bold select-none animate-pulse" style={{ fontSize: '18px' }}>+</div>
              {/* Top Left Green Circle */}
              <div className="absolute top-4 -left-1 w-3 h-3 rounded-full border-2 border-emerald-400 select-none opacity-80" />
              {/* Bottom Left Green Plus */}
              <div className="absolute bottom-0 left-0 text-emerald-500 font-bold select-none animate-pulse" style={{ fontSize: '18px' }}>+</div>
              {/* Bottom Right Green Circle */}
              <div className="absolute bottom-4 -right-1 w-2 h-2 rounded-full border-2 border-emerald-400 select-none opacity-80" />
              
              {/* Main solid green circle */}
              <div className="relative w-16 h-16 bg-[#00c853] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-9 h-9 text-white stroke-[3px]" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-on-surface tracking-tight mb-2">
              Đăng ký dịch vụ thành công
            </h3>
            
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-[320px] mb-6">
              Hồ sơ đăng ký doanh nghiệp đã được gửi thành công! Admin sẽ xét duyệt trong vòng 1-2 ngày làm việc.
            </p>

            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center justify-center h-11 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold transition-colors shadow-sm"
              >
                Đi tới Bảng điều khiển
              </button>
              
              <p className="text-xs text-on-surface-variant/80 font-medium">
                Tự động chuyển trang sau <span className="text-primary font-bold">{countdown}</span> giây...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
