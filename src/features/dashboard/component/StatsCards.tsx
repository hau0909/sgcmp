"use client";

import React from "react";
import {
  CreditCard,
  Building2,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  CircleDot,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCards() {
  const stats = [
    {
      label: "TỔNG DOANH THU",
      value: "2.450.000.000 đ",
      icon: CreditCard,
      iconColor: "text-blue-500 bg-blue-50",
      badge: (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <TrendingUp className="size-3" />
          <span>+12.5%</span>
        </span>
      ),
    },
    {
      label: "TỔNG DOANH NGHIỆP",
      value: "1,284",
      icon: Building2,
      iconColor: "text-blue-600 bg-blue-50/70",
      badge: (
        <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          <CircleDot className="size-2.5 fill-blue-500 text-blue-500 animate-pulse" />
          <span>8 mới/ngày</span>
        </span>
      ),
    },
    {
      label: "TỔNG BẢO VỆ",
      value: "15,620",
      icon: Shield,
      iconColor: "text-slate-600 bg-slate-50",
      badge: (
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>94% Hoạt động</span>
        </span>
      ),
    },
    {
      label: "TRẠNG THÁI HỆ THỐNG",
      value: "99.9% Uptime",
      icon: Activity,
      iconColor: "text-red-500 bg-red-50",
      badge: (
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          <Clock className="size-3 text-slate-400" />
          <span>24ms Latency</span>
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card
            key={index}
            className="border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 rounded-xl"
          >
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${item.iconColor} flex items-center justify-center`}>
                  <Icon className="size-5" />
                </div>
                {item.badge}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                  {item.label}
                </span>
                <span className="text-xl font-bold text-slate-800 tracking-tight">
                  {item.value}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
