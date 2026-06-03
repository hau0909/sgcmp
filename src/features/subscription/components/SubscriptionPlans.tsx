import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function SubscriptionPlans() {
  const plans = [
    {
      name: "Cơ bản",
      description: "Hoàn hảo cho các tổ chức nhỏ quản lý dưới 20 nhân sự.",
      price: "250.000",
      period: " VNĐ/tháng",
      features: [
        "Quản lý tối đa 20 bảo vệ",
        "Lên lịch trực ca cơ bản",
        "Check-in/Check-out ca làm",
      ],
      current: false,
      buttonText: "Hạ cấp",
      buttonPrimary: false,
    },
    {
      name: "Chuyên nghiệp",
      description: "Giải pháp vận hành an ninh toàn diện cho các công ty quy mô tầm trung.",
      price: "500.000",
      period: " VNĐ/tháng",
      features: [
        "Tất cả tính năng trong gói Cơ bản",
        "Quản lý không giới hạn mục tiêu",
        "Báo cáo phân tích chuyên sâu tự động",
        "Hệ thống trao đổi với Khách hàng",
      ],
      current: true,
      buttonText: "Đang sử dụng",
      buttonPrimary: false,
    },
    {
      name: "Doanh nghiệp",
      description: "Khả năng tùy chỉnh chuyên sâu và hạ tầng chuyên biệt cho quy mô lớn.",
      price: "Tùy chỉnh",
      period: "",
      features: [
        "Máy chủ đám mây độc lập, bảo mật cao",
        "Tích hợp API kết nối hệ thống nội bộ ERP",
        "Hỗ trợ kỹ thuật 24/7 trực tiếp chuyên biệt",
      ],
      current: false,
      buttonText: "Liên hệ tư vấn",
      buttonPrimary: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-on-surface tracking-tight">
        Các Gói Dịch Vụ Khác
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan, idx) => {
          return (
            <div
              key={idx}
              className={`bg-surface-container-lowest border rounded-xl p-6 flex flex-col transition-all relative shadow-sm
                ${
                  plan.current
                    ? "border-primary border-2 -translate-y-1 shadow-md"
                    : "border-outline-variant hover:border-outline"
                }`}
            >
              {plan.current && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Gói Của Bạn
                </div>
              )}
              
              <h4 className={`text-base font-bold mb-2 ${plan.current ? "text-primary mt-1" : "text-on-surface"}`}>
                {plan.name}
              </h4>
              <p className="text-xs text-on-surface-variant mb-5 min-h-[32px] font-medium leading-relaxed">
                {plan.description}
              </p>
              
              <div className="mb-6 flex items-baseline">
                <span className={`text-2xl font-black ${plan.current ? "text-primary" : "text-on-surface"}`}>
                  {plan.price}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  {plan.period}
                </span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li
                    key={fIdx}
                    className={`flex items-start gap-2.5 text-xs text-on-surface-variant font-semibold
                      ${plan.current ? "text-on-surface/80" : ""}`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5
                        ${plan.current ? "text-primary" : "text-secondary"}`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.current ? (
                <button
                  disabled
                  className="w-full bg-surface-container-low text-on-surface-variant/70 font-bold py-2 rounded text-xs cursor-default select-none border border-outline-variant/30 text-center"
                >
                  {plan.buttonText}
                </button>
              ) : plan.buttonPrimary ? (
                <button className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-2 rounded text-xs transition-colors shadow-sm active:scale-98">
                  {plan.buttonText}
                </button>
              ) : (
                <button className="w-full border border-outline text-on-surface hover:bg-surface-container-low font-bold py-2 rounded text-xs transition-colors active:scale-98">
                  {plan.buttonText}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
