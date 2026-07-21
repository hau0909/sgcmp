"use client";

import React from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export interface CompanyServiceProp {
  name: string;
  description: string;
  baseDescription?: string;
  price: string | number;
}

interface CompanyDetailServicesProps {
  services: CompanyServiceProp[];
}

const formatPrice = (price: string | number, fromLabel: string) => {
  if (typeof price === "number") {
    return `${fromLabel} ${price.toLocaleString("vi-VN")}đ`;
  }
  return price;
};

export default function CompanyDetailServices({ services }: CompanyDetailServicesProps) {
  const { dict } = useTranslation();
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
      <h2 className="text-headline-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[12px] border-b border-outline-variant pb-2">
        {dict.customer.company_detail.services_title}
      </h2>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full border-collapse text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container/30">
              <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-1/3">
                {dict.customer.company_detail.col_service_name}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[57%]">
                {dict.customer.company_detail.col_desc}
              </th>
              <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[10%]">
                {dict.customer.company_detail.col_price}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {services.map((service, index) => (
              <tr key={index} className="hover:bg-surface-container/10 transition-colors">
                <td className="px-4 py-4 text-body-sm font-bold text-on-surface align-top">
                  <div>{service.name}</div>
                  {service.baseDescription && (
                    <div className="text-body-xs font-normal text-on-surface-variant mt-1.5 max-w-sm normal-case text-justify leading-relaxed">
                      {service.baseDescription}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-body-sm text-on-surface-variant leading-relaxed text-justify align-top whitespace-pre-line">
                  {service.description}
                </td>
                <td className="px-4 py-4 text-body-sm font-semibold text-primary align-top whitespace-nowrap">
                  {formatPrice(service.price, dict.customer.company_detail.from_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
