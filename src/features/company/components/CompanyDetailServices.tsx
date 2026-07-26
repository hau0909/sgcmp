"use client";

import React from "react";
import { Building2, Home, Calendar, Warehouse, Shield } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export interface CompanyServiceProp {
  serviceId?: string;
  name: string;
  description: string;
  baseDescription?: string;
  price: string | number;
}

interface CompanyDetailServicesProps {
  services: CompanyServiceProp[];
}

const getServiceIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("tòa nhà") || lower.includes("văn phòng")) {
    return <Building2 className="w-4.5 h-4.5 text-primary" />;
  }
  if (lower.includes("chung cư") || lower.includes("dân cư")) {
    return <Home className="w-4.5 h-4.5 text-primary" />;
  }
  if (lower.includes("sự kiện") || lower.includes("hội nghị")) {
    return <Calendar className="w-4.5 h-4.5 text-primary" />;
  }
  if (lower.includes("kho") || lower.includes("xưởng")) {
    return <Warehouse className="w-4.5 h-4.5 text-primary" />;
  }
  return <Shield className="w-4.5 h-4.5 text-primary" />;
};

const formatPrice = (
  price: string | number,
  fromLabel: string,
  contactLabel: string,
) => {
  if (typeof price === "number") {
    if (price === 0) return contactLabel;
    return `${fromLabel} ${price.toLocaleString("vi-VN")}đ/giờ`;
  }
  if (!price) return contactLabel;
  return price;
};

export default function CompanyDetailServices({
  services,
}: CompanyDetailServicesProps) {
  const { dict } = useTranslation();
  const t = dict.customer?.company_detail || {};

  return (
    <section className="py-8 border-b border-outline-variant/60">
      <div className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">
        {t.services_eyebrow || "Danh mục"}
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-4">
        {t.services_title || "Dịch vụ chính"}
      </h2>

      {!services || services.length === 0 ? (
        <p className="text-sm text-on-surface-variant italic py-2">
          {t.no_services || "Chưa có thông tin dịch vụ nào được đăng ký."}
        </p>
      ) : (
        <div className="divide-y divide-outline-variant/40">
          {services.map((service, index) => (
            <div
              key={service.serviceId || index}
              className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  {getServiceIcon(service.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-on-surface leading-tight">
                    {service.name}
                  </h3>

                  {/* 1. Mô tả danh mục loại Dịch vụ */}
                  {service.baseDescription ? (
                    <p className="text-xs sm:text-sm font-medium text-primary leading-relaxed max-w-xl mt-1">
                      {service.baseDescription}
                    </p>
                  ) : null}

                  {/* 2. Mô tả cụ thể triển khai của Công ty */}
                  {service.description &&
                  service.description !== service.baseDescription ? (
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-xl mt-1">
                      {service.description}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Khung Giá tham khảo */}
              <div className="sm:text-right shrink-0 pl-12 sm:pl-0 pt-0.5">
                <span className="text-[11px] font-medium text-on-surface-variant block leading-none mb-1">
                  {t.price_ref || "Giá tham khảo"}
                </span>
                <span className="text-base font-bold text-primary whitespace-nowrap block leading-tight">
                  {formatPrice(
                    service.price,
                    t.from_price || "Từ",
                    t.contact_for_price || "Liên hệ báo giá",
                  )}
                </span>
                <span className="text-[10.5px] text-on-surface-variant/75 block mt-1 leading-none">
                  {t.price_note || "(Tùy quy mô & giờ trực)"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
