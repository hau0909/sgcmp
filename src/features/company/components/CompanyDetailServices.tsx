"use client";

import React from "react";

interface ServiceItem {
  serviceId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
}

interface CompanyDetailServicesProps {
  services: ServiceItem[];
}

export default function CompanyDetailServices({ services }: CompanyDetailServicesProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
      <div className="p-6 pb-4 border-b border-outline-variant">
        <h2 className="text-headline-sm font-semibold text-on-surface uppercase tracking-wider text-[12px]">
          Danh mục dịch vụ &amp; Bảng giá tham khảo
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-dim border-b border-outline-variant text-[11px] uppercase tracking-wider text-on-surface">
              <th className="py-3 px-6 font-semibold w-1/3">Dịch vụ</th>
              <th className="py-3 px-6 font-semibold">Mô tả</th>
              <th className="py-3 px-6 font-semibold text-right">Đơn giá (VND)</th>
            </tr>
          </thead>
          <tbody className="text-body-sm">
            {services.map((svc) => (
              <tr
                key={svc.serviceId}
                className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
              >
                <td className="py-3.5 px-6 font-medium text-on-surface">
                  {svc.name}
                </td>
                <td className="py-3.5 px-6 text-on-surface-variant/90">
                  {svc.description}
                </td>
                <td className="py-3.5 px-6 text-right font-mono text-on-surface font-semibold">
                  {svc.price.toLocaleString("vi-VN")} {svc.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
